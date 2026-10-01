import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";

import { healthRouter } from "./routes/health.routes.js";
import { matchingRouter } from "./routes/matching.routes.js";
import { jobsRouter } from "./routes/jobs.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { candidateRouter } from "./routes/candidate.routes.js";
import { applicationsRouter } from "./routes/applications.routes.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    res.json({
      service: "RecruitX API",
      status: "running",
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/candidates", candidateRouter);
app.use("/api/v1", matchingRouter);
  app.use("/api/v1/jobs", jobsRouter);
  app.use("/api/v1", applicationsRouter);

  return app;
};
