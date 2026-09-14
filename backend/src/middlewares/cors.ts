import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

export function cors(req: Request, res: Response, next: NextFunction): void {
  res.setHeader("Access-Control-Allow-Origin", env.allowedOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
