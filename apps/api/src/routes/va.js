import express from "express";
import { z } from "zod";
import { prisma } from "@va-marketplace/db";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { created, ok, badRequest, notFound } from "../lib/http.js";

const router = express.Router();

const applySchema = z.object({
  experience: z.string().min(20),
  testScore: z.number().int().min(0).max(100),
  skills: z.array(z.string().min(1)).min(1).max(50),
  portfolioLinks: z
    .array(
      z.object({
        label: z.string().min(1).max(50).optional(),
        url: z.string().url(),
      }),
    )
    .max(20)
    .optional()
    .default([]),
});

router.post("/apply", requireAuth, requireRole(["VA"]), async (req, res) => {
  const body = applySchema.parse(req.body);

  const vaProfile = await prisma.vaProfile.findUnique({
    where: { userId: req.auth.sub },
    include: { application: true },
  });
  if (!vaProfile) return notFound(res, "VA profile not found");
  if (vaProfile.application && vaProfile.application.status === "APPROVED") {
    return badRequest(res, "Already approved");
  }

  const application = await prisma.vaApplication.upsert({
    where: { vaProfileId: vaProfile.id },
    create: {
      vaProfileId: vaProfile.id,
      experience: body.experience,
      testScore: body.testScore,
      status: "PENDING",
    },
    update: {
      experience: body.experience,
      testScore: body.testScore,
      status: "PENDING",
      reviewedById: null,
      reviewedAt: null,
      reviewNote: null,
    },
  });

  await prisma.vaSkill.deleteMany({ where: { vaProfileId: vaProfile.id } });
  await prisma.vaPortfolioLink.deleteMany({ where: { vaProfileId: vaProfile.id } });

  await prisma.vaSkill.createMany({
    data: body.skills.map((name) => ({ name, vaProfileId: vaProfile.id })),
    skipDuplicates: true,
  });

  if (body.portfolioLinks?.length) {
    await prisma.vaPortfolioLink.createMany({
      data: body.portfolioLinks.map((p) => ({ ...p, vaProfileId: vaProfile.id })),
    });
  }

  return created(res, { applicationId: application.id, status: application.status });
});

router.get("/me", requireAuth, requireRole(["VA"]), async (req, res) => {
  const vaProfile = await prisma.vaProfile.findUnique({
    where: { userId: req.auth.sub },
    include: {
      application: true,
      skills: true,
      portfolioLinks: true,
    },
  });
  if (!vaProfile) return notFound(res, "VA profile not found");
  return ok(res, { vaProfile });
});

export default router;

