import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: "candidate" | "recruiter";
      };
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    if (typeof payload === "string" || payload.sub === undefined) {
      return res.status(401).json({
        error: "Invalid authentication token",
      });
    }

    const userId = Number(payload.sub);
    const role = payload.role;

    if (
      !Number.isInteger(userId) ||
      userId <= 0 ||
      (role !== "candidate" && role !== "recruiter")
    ) {
      return res.status(401).json({
        error: "Invalid authentication token",
      });
    }

    req.user = {
      id: userId,
      role,
    };

    next();
  } catch {
    return res.status(401).json({
      error: "Invalid or expired authentication token",
    });
  }
};

export const requireRole = (
  role: "candidate" | "recruiter",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({
        error: "Insufficient permissions",
      });
    }

    next();
  };
};
