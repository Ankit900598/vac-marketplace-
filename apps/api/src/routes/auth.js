import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "@va-marketplace/db";
import { config } from "../config.js";
import { created, ok, badRequest, unauthorized } from "../lib/http.js";
import { sha256Base64 } from "../lib/crypto.js";

const router = express.Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["CLIENT", "VA"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signAccess(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
}

function signRefresh(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
}

function setAuthCookies(res, { accessToken, refreshToken }) {
  const base = {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
  res.cookie(config.cookies.access, accessToken, { ...base });
  res.cookie(config.cookies.refresh, refreshToken, { ...base });
}

router.post("/signup", async (req, res) => {
  const body = signupSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: body.email } });
  if (existing) return badRequest(res, "Email already in use");

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      role: body.role,
      clientProfile: body.role === "CLIENT" ? { create: {} } : undefined,
      vaProfile: body.role === "VA" ? { create: {} } : undefined,
    },
    select: { id: true, email: true, role: true },
  });

  const accessToken = signAccess({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefresh({ sub: user.id });
  await prisma.refreshToken.create({
    data: {
      tokenHash: sha256Base64(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  setAuthCookies(res, { accessToken, refreshToken });
  return created(res, { user });
});

router.post("/login", async (req, res) => {
  const body = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) return unauthorized(res, "Invalid credentials");

  const okPw = await bcrypt.compare(body.password, user.passwordHash);
  if (!okPw) return unauthorized(res, "Invalid credentials");

  const accessToken = signAccess({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefresh({ sub: user.id });
  await prisma.refreshToken.create({
    data: {
      tokenHash: sha256Base64(refreshToken),
      userId: user.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  setAuthCookies(res, { accessToken, refreshToken });
  return ok(res, { user: { id: user.id, email: user.email, role: user.role } });
});

router.post("/logout", async (req, res) => {
  const refresh = req.cookies?.[config.cookies.refresh];
  if (refresh) {
    await prisma.refreshToken.updateMany({
      where: { tokenHash: sha256Base64(refresh), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  res.clearCookie(config.cookies.access, { path: "/" });
  res.clearCookie(config.cookies.refresh, { path: "/" });
  return ok(res, { loggedOut: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.[config.cookies.access];
  if (!token) return unauthorized(res);
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    return ok(res, { user: payload });
  } catch {
    return unauthorized(res);
  }
});

export default router;

