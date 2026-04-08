import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { unauthorized, forbidden } from "../lib/http.js";

export function requireAuth(req, res, next) {
  const token = req.cookies?.[config.cookies.access];
  if (!token) return unauthorized(res);

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    req.auth = payload;
    return next();
  } catch {
    return unauthorized(res);
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.auth?.role) return unauthorized(res);
    if (!roles.includes(req.auth.role)) return forbidden(res);
    return next();
  };
}

