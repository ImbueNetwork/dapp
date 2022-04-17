"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const http_errors_1 = __importDefault(require("http-errors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("./config"));
const errors_1 = require("./middleware/errors");
const authentication_1 = __importDefault(require("./middleware/authentication"));
const v1_1 = __importDefault(require("./routes/api/v1"));
const port = process.env.PORT || config_1.default.port;
const app = (0, express_1.default)();
const environment = config_1.default.environment;
// app.set("view engine", "ejs");
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)(config_1.default.session));
app.use(passport_1.default.authenticate("session"));
app.use(authentication_1.default);
app.use("/api/v1", v1_1.default);
app.get("/redirect", (req, res) => {
    const next = req.session.next;
    if (next) {
        delete req.session.next;
        return res.redirect(next);
    }
    res.redirect("/");
});
// not found
app.use((_req, _res, next) => {
    next((0, http_errors_1.default)(404));
});
// uncaught error
app.use((0, errors_1.errorHandler)(environment));
const server = http_1.default.createServer(app);
server.on("listening", () => {
    const addr = server.address();
    console.log(`Service started on port ${addr.port}`);
});
server.listen(port);
