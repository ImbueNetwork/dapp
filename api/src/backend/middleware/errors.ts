import express, { ErrorRequestHandler } from "express";

interface MiddlewareError extends Error {
  cause: MiddlewareError;
  status: number;
}

export const errorHandler =
  (environment: string): ErrorRequestHandler =>
  (
    err: MiddlewareError,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const causes = [];
    let cause = err;

    console.error(cause);

    while ((cause = cause.cause)) {
      causes.push(cause);
      console.error("Caused by:", cause);
    }

    res.status(err.status || 500);
    res.send({
      message: err.message,
      ...(environment.startsWith("dev")
        ? { causes: causes.map((cause) => cause.message) }
        : {}),
    });
  };
