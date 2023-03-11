import dotenv from "dotenv";
dotenv.config();

import { AddressInfo } from "net";
import http from "http";
import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";

import config from "./config";
import { errorHandler } from "./middleware/errors";
import authenticationMiddleware from "./middleware/authentication";
import v1routes from "./routes/api/v1";
import webRoutes from "./routes/web";
import path from "path";
//import { createBrowserHistory } from "history";

declare global {
    interface ErrorConstructor {
        new (message?: string, opts?: { cause: Error }): Error;
    }
}

const port = process.env.PORT || config.port;
const app = express();
const environment = config.environment;

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(cookieParser());

app.use("/public", express.static("public"));
app.use("/dapp", webRoutes);

app.use(express.json());
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

app.get("/", (req, res) => {
    res.redirect("/dapp");
});

// uncaught error
app.use(errorHandler(environment));

//const history = createBrowserHistory();

//history.listen(({ action, location }) => {
//    //console.log(
//    //  `The current URL is ${location.pathname}${location.search}${location.hash}`
//    //);
//    //console.log(`The last navigation action was ${action}`);
//  });

const server = http.createServer(app);

server.on("listening", () => {
    const addr = server.address() as AddressInfo;
    console.log(`Service started on port ${addr.port}`);
});
server.listen(port);
