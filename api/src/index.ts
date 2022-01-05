import http from "http";
import createError from "http-errors";
import express from "express";
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import logger from "morgan";

// const defaults = require("./defaults");
import defaults from "./defaults";

type Cause = Error & {
    constructor(msg: string, options: Record<string, any>): Cause;
}

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
                {cause: (cause as Error)}
            )
        );
    }
});

// not found handler
app.use((_req, _res, next) => {
    next(createError(404));
});

// error handler
app.use((
    err: Error<express.Request>,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
) => {
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
