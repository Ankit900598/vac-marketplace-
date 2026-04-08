import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";

import { config } from "./config.js";
import { errorMiddleware } from "./middleware/error.js";

import authRoutes from "./routes/auth.js";
import vaRoutes from "./routes/va.js";
import adminRoutes from "./routes/admin.js";
import jobRoutes from "./routes/jobs.js";
import hireRoutes from "./routes/hire.js";
import aiRoutes from "./routes/ai.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.webOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 200,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/va", vaRoutes);
app.use("/admin", adminRoutes);
app.use("/jobs", jobRoutes);
app.use("/hire", hireRoutes);
app.use("/ai", aiRoutes);

app.use(errorMiddleware);

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${config.port}`);
});

