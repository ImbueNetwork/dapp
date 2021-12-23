const http = require("http");
const createError = require("http-errors");
const express = require("express");
const { DynamoDBClient, ListTablesCommand } =
    require("@aws-sdk/client-dynamodb");
const logger = require("morgan");

const defaults = require("./defaults");

const port = process.env.PORT || defaults.port;
const app = express();
const environment = String(
    process.env.NODE_ENV || defaults.environment).toLowerCase();

app.use(logger("dev"));
app.use(express.json());

// db connectivity smoketest
app.get("/healthcheck", async (_req, res, next) => {
    const client = new DynamoDBClient({
        region: process.env.REGION || defaults.region,
        endpoint: process.env.DYNAMODB_ENDPOINT
            || defaults.dynamodb?.endpoint
    });

    try {
        await client.send(new ListTablesCommand({}));
        res.send();
    } catch (cause) {
        next(
            new Error(
                "Unable to get DynamoDB table listing.",
                {cause}
            )
        );
    }
});

// not found handler
app.use((_req, _res, next) => {
    next(createError(404));
});

// error handler
app.use((err, _req, res, _next) => {
    const causes = [];
    let cause = err;

    console.error(cause);
    
    while (cause = cause.cause) {
        causes.push(cause);
        console.error("Caused by:", cause);
    };

    res.status(err.status || 500);
    res.send({
        message: err.message,
        ...(
            environment.startsWith("dev")
                ? {causes: causes}
                : {}
        )
    });
});

const server = http.createServer(app);

server.on("listening", () => {
    const addr = server.address();
    console.log(`Service started on port ${addr.port}`);
});

server.listen(port);
