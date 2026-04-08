import express from "express";
import { z } from "zod";
import { prisma } from "@va-marketplace/db";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ok, notFound } from "../lib/http.js";

const router = express.Router();

router.get("/applications", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
  const applications = await prisma.vaApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      vaProfile: {
        include: {
          user: { select: { email: true, id: true } },
          skills: true,
          portfolioLinks: true,
        },
      },
      testSubmissions: { orderBy: { createdAt: "desc" } },
    },
  });
  return ok(res, { applications });
});

const approveSchema = z.object({
  vaProfileId: z.string().min(1),
  approve: z.boolean(),
  note: z.string().max(500).optional(),
});

router.post("/approve", requireAuth, requireRole(["ADMIN"]), async (req, res) => {
  const body = approveSchema.parse(req.body);

  const app = await prisma.vaApplication.findUnique({ where: { vaProfileId: body.vaProfileId } });
  if (!app) return notFound(res, "Application not found");

  const updated = await prisma.vaApplication.update({
    where: { id: app.id },
    data: {
      status: body.approve ? "APPROVED" : "REJECTED",
      reviewedById: req.auth.sub,
      reviewedAt: new Date(),
      reviewNote: body.note ?? null,
    },
  });

  return ok(res, { application: updated });
});

export default router;

