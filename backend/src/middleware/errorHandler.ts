
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.status || err.statusCode || 500;

  if (statusCode >= 500) {
    console.error("Unhandled request error", {
      statusCode,
      name: err?.name,
      code: err?.code,
      message: err?.message,
      stack: err?.stack,
    });
  }

  const message =
    statusCode >= 500
      ? "Internal server error"
      : err.message || "Request failed";

  res.status(statusCode).json({
    success: false,
    message,
    code: statusCode >= 500
      ? "INTERNAL_ERROR"
      : err.code || "REQUEST_FAILED",
  });
};
