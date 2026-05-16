import type { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

// ─── Auth Middleware ──────────────────────────────────────────────────────────
// Validates Supabase JWT tokens attached in Authorization header
// Attaches user to request if valid token present (non-blocking for optional auth)

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

// Optional auth — attaches user if token valid, continues regardless
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Token invalid but don't block — just proceed unauthenticated
      logger.debug("AuthMiddleware", "Invalid token, proceeding unauthenticated");
      return next();
    }

    req.userId = user.id;
    req.userEmail = user.email;
    logger.debug("AuthMiddleware", `Authenticated user: ${user.id}`);
  } catch (err) {
    logger.warn("AuthMiddleware", "Token verification failed", err);
  }

  next();
}

// Required auth — returns 401 if no valid token
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      code: "UNAUTHORIZED",
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        code: "INVALID_TOKEN",
      });
      return;
    }

    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch (err) {
    logger.error("AuthMiddleware", "Auth check failed", err);
    res.status(500).json({
      success: false,
      error: "Authentication service error",
      code: "AUTH_ERROR",
    });
  }
}
