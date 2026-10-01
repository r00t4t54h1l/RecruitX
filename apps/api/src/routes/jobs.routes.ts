import { Router } from "express";

import {
  createJob,
  getJobs,
  getJobById,
} from "../controllers/jobs.controller.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

export const jobsRouter = Router();

jobsRouter.get("/", getJobs);

jobsRouter.get("/:jobId", getJobById);

jobsRouter.post(
  "/",
  requireAuth,
  requireRole("recruiter"),
  createJob,
);
