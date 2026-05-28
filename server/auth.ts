import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import type { Role, SessionUser } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "local-mediform-development-secret";
const FIFTEEN_MINUTES = "15m";

export function signSession(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: FIFTEEN_MINUTES });
}

export function requireAuth(roles?: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) {
      return res.status(401).json({ message: "Sesión requerida" });
    }

    try {
      const user = jwt.verify(token, JWT_SECRET) as SessionUser;
      if (roles?.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Permisos insuficientes" });
      }
      req.user = user;
      next();
    } catch {
      return res.status(401).json({ message: "Sesión expirada o inválida" });
    }
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}
