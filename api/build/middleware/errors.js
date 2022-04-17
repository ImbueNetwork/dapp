"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (environment) => (err, _req, res, _next) => {
    const causes = [];
    let cause = err;
    console.error(cause);
    while (cause = cause.cause) {
        causes.push(cause);
        console.error("Caused by:", cause);
    }
    ;
    res.status(err.status || 500);
    res.send({
        message: err.message,
        ...(environment.startsWith("dev")
            ? { causes: causes.map(cause => cause.message) }
            : {})
    });
};
exports.errorHandler = errorHandler;
