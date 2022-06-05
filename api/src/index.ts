import dotenv from "dotenv";
dotenv.config();

import { AddressInfo } from "net";
import http from "http";
import createError from "http-errors";
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import logger from "morgan";
import passport from "passport";

import config from "./config";
import { errorHandler } from "./middleware/errors";
import authenticationMiddleware from "./middleware/authentication";
import v1routes from "./routes/api/v1";

declare global {
    interface ErrorConstructor {
        new(message?: string, opts?: {cause: Error}): Error;
    }
}

const port = process.env.PORT || config.port;
const app = express();
const environment = config.environment;

// app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());

app.use(authenticationMiddleware);
app.use("/api/v1", v1routes);

app.get("/redirect", (req, res) => {
    const next = (req.session as any).next;
    if (next) {
        delete (req.session as any).next;
        return res.redirect(next);
    }
    res.redirect("/");
});


// not found
app.use((_req, _res, next) => {
    next(createError(404));
});

// uncaught error
app.use(errorHandler(environment));


const server = http.createServer(app);

server.on("listening", () => {
    const addr = server.address() as AddressInfo;
    console.log(`Service started on port ${addr.port}`);
});

server.listen(port);
