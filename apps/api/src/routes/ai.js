import express from "express";
import { z } from "zod";
import OpenAI from "openai";
import { config } from "../config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { ok, forbidden, badRequest } from "../lib/http.js";

const router = express.Router();

function getClient() {
  if (!config.ai.enabled) return null;
  if (!config.ai.openaiApiKey) return null;
  return new OpenAI({ apiKey: config.ai.openaiApiKey });
}

router.post(
  "/job",
  requireAuth,
  requireRole(["CLIENT"]),
  async (req, res) => {
    const client = getClient();
    if (!client) return forbidden(res, "AI is disabled on this server");

    const body = z
      .object({
        title: z.string().min(3).max(120),
        skills: z.array(z.string().min(1)).min(1).max(30),
        seniority: z.string().max(50).optional(),
        timezone: z.string().max(80).optional(),
        hoursPerWeek: z.number().int().min(1).max(80).optional(),
        notes: z.string().max(2000).optional(),
      })
      .parse(req.body);

    const prompt = [
      `Create a concise, premium job post description for a Virtual Assistant role.`,
      `Return JSON only with keys: description (string), suggestedSkills (string[]).`,
      `Title: ${body.title}`,
      `Skills: ${body.skills.join(", ")}`,
      body.seniority ? `Seniority: ${body.seniority}` : "",
      body.timezone ? `Timezone: ${body.timezone}` : "",
      body.hoursPerWeek ? `Hours/week: ${body.hoursPerWeek}` : "",
      body.notes ? `Notes: ${body.notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const resp = await client.responses.create({
      model: config.ai.model,
      input: prompt,
    });

    const text = resp.output_text?.trim();
    if (!text) return badRequest(res, "AI returned empty output");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      return badRequest(res, "AI returned non-JSON output", { text });
    }

    return ok(res, {
      description: String(parsed.description ?? ""),
      suggestedSkills: Array.isArray(parsed.suggestedSkills) ? parsed.suggestedSkills.map(String) : [],
    });
  },
);

export default router;

