"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const http = require("http");
const createError = require("http-errors");
const express = require("express");
const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
const logger = require("morgan");
const defaults = require("./defaults");
const port = process.env.PORT || defaults.port;
const app = express();
const environment = String(process.env.NODE_ENV || defaults.environment).toLowerCase();
app.use(logger("dev"));
app.use(express.json());
// db connectivity smoketest
app.get("/healthcheck", (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const client = new DynamoDBClient({
        region: process.env.REGION || defaults.region,
        endpoint: process.env.DYNAMODB_ENDPOINT
            || ((_a = defaults.dynamodb) === null || _a === void 0 ? void 0 : _a.endpoint)
    });
    try {
        yield client.send(new ListTablesCommand({}));
        res.send();
    }
    catch (cause) {
        next(new Error("Unable to get DynamoDB table listing.", { cause }));
    }
}));
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
    }
    ;
    res.status(err.status || 500);
    res.send(Object.assign({ message: err.message }, (environment.startsWith("dev")
        ? { causes: causes }
        : {})));
});
const server = http.createServer(app);
server.on("listening", () => {
    const addr = server.address();
    console.log(`Service started on port ${addr.port}`);
});
server.listen(port);
