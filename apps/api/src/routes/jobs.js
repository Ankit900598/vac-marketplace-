import express from "express";
import { z } from "zod";
import { prisma } from "@va-marketplace/db";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { created, ok, notFound } from "../lib/http.js";

const router = express.Router();

const createJobSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(5000),
  skills: z.array(z.string().min(1)).min(1).max(50),
});

router.post("/create", requireAuth, requireRole(["CLIENT"]), async (req, res) => {
  const body = createJobSchema.parse(req.body);

  const client = await prisma.clientProfile.findUnique({ where: { userId: req.auth.sub } });
  if (!client) return notFound(res, "Client profile not found");

  const job = await prisma.job.create({
    data: {
      clientId: client.id,
      title: body.title,
      description: body.description,
      skills: { create: body.skills.map((name) => ({ name })) },
    },
    include: { skills: true },
  });

  return created(res, { job });
});

router.get("/mine", requireAuth, requireRole(["CLIENT"]), async (req, res) => {
  const client = await prisma.clientProfile.findUnique({ where: { userId: req.auth.sub } });
  if (!client) return notFound(res, "Client profile not found");

  const jobs = await prisma.job.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    include: {
      skills: true,
      matches: {
        orderBy: { score: "desc" },
        include: {
          vaProfile: {
            include: {
              user: { select: { email: true, id: true } },
              skills: true,
              portfolioLinks: true,
              application: true,
            },
          },
        },
      },
      hire: true,
    },
  });

  return ok(res, { jobs });
});

// Match: only APPROVED VAs, scored by overlap with job skills
router.post("/match", requireAuth, requireRole(["CLIENT"]), async (req, res) => {
  const body = z.object({ jobId: z.string().min(1) }).parse(req.body);

  const client = await prisma.clientProfile.findUnique({ where: { userId: req.auth.sub } });
  if (!client) return notFound(res, "Client profile not found");

  const job = await prisma.job.findFirst({
    where: { id: body.jobId, clientId: client.id },
    include: { skills: true },
  });
  if (!job) return notFound(res, "Job not found");

  const jobSkills = job.skills.map((s) => s.name.toLowerCase());

  const approvedVas = await prisma.vaProfile.findMany({
    where: { application: { status: "APPROVED" } },
    include: {
      user: { select: { email: true, id: true } },
      skills: true,
      portfolioLinks: true,
      application: true,
    },
  });

  const scored = approvedVas
    .map((va) => {
      const vaSkills = va.skills.map((s) => s.name.toLowerCase());
      const overlap = jobSkills.filter((s) => vaSkills.includes(s)).length;
      const score = overlap * 10 + Math.min(va.application?.testScore ?? 0, 100);
      return { va, score, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  await prisma.jobMatch.deleteMany({ where: { jobId: job.id } });
  if (scored.length) {
    await prisma.jobMatch.createMany({
      data: scored.map((x) => ({ jobId: job.id, vaProfileId: x.va.id, score: x.score })),
      skipDuplicates: true,
    });
  }

  const matches = await prisma.jobMatch.findMany({
    where: { jobId: job.id },
    orderBy: { score: "desc" },
    include: {
      vaProfile: {
        include: {
          user: { select: { email: true, id: true } },
          skills: true,
          portfolioLinks: true,
          application: true,
        },
      },
    },
  });

  return ok(res, { matches });
});

export default router;

