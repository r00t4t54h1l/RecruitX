import { Router } from "express";

import {
  applyToJob,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/applications.controller.js";

import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

export const applicationsRouter = Router();

applicationsRouter.post(
  "/jobs/:jobId/apply",
  requireAuth,
  requireRole("candidate"),
  applyToJob,
);

applicationsRouter.get(
  "/candidates/applications",
  requireAuth,
  requireRole("candidate"),
  getCandidateApplications,
);

applicationsRouter.get(
  "/jobs/:jobId/applications",
  requireAuth,
  requireRole("recruiter"),
  getJobApplications,
);

applicationsRouter.patch(
  "/applications/:applicationId/status",
  requireAuth,
  requireRole("recruiter"),
  updateApplicationStatus,
);
