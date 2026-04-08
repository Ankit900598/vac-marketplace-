import express from "express";
import { z } from "zod";
import { prisma } from "@va-marketplace/db";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { created, notFound, badRequest, ok } from "../lib/http.js";

const router = express.Router();

const hireSchema = z.object({
  jobId: z.string().min(1),
  vaProfileId: z.string().min(1),
});

router.post("/", requireAuth, requireRole(["CLIENT"]), async (req, res) => {
  const body = hireSchema.parse(req.body);

  const client = await prisma.clientProfile.findUnique({ where: { userId: req.auth.sub } });
  if (!client) return notFound(res, "Client profile not found");

  const job = await prisma.job.findFirst({
    where: { id: body.jobId, clientId: client.id },
    include: { hire: true },
  });
  if (!job) return notFound(res, "Job not found");
  if (job.hire) return badRequest(res, "Already hired for this job");

  const va = await prisma.vaProfile.findUnique({
    where: { id: body.vaProfileId },
    include: { application: true },
  });
  if (!va) return notFound(res, "VA not found");
  if (va.application?.status !== "APPROVED") return badRequest(res, "VA is not verified");

  const hire = await prisma.hire.create({
    data: { jobId: job.id, vaProfileId: va.id },
  });

  await prisma.job.update({ where: { id: job.id }, data: { status: "HIRED" } });

  return created(res, { hire });
});

router.get("/job/:jobId", requireAuth, requireRole(["CLIENT"]), async (req, res) => {
  const client = await prisma.clientProfile.findUnique({ where: { userId: req.auth.sub } });
  if (!client) return notFound(res, "Client profile not found");

  const job = await prisma.job.findFirst({ where: { id: req.params.jobId, clientId: client.id } });
  if (!job) return notFound(res, "Job not found");

  const hire = await prisma.hire.findUnique({
    where: { jobId: job.id },
    include: { vaProfile: { include: { user: { select: { email: true } } } } },
  });

  return ok(res, { hire });
});

export default router;

