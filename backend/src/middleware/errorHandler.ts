import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

// ─── Error Handler Middleware ──────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn("ErrorHandler", `AppError: ${err.message}`, {
      code: err.code,
      statusCode: err.statusCode,
    });
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Unexpected error
  logger.error("ErrorHandler", "Unhandled error", {
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    success: false,
    error: "An internal server error occurred",
    code: "INTERNAL_ERROR",
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: "Route not found",
    code: "NOT_FOUND",
  });
}
