import { Router } from "express";

import {
  getCandidateProfile,
  upsertCandidateProfile,
} from "../controllers/candidate.controller.js";
import {
  requireAuth,
  requireRole,
} from "../middleware/auth.middleware.js";

export const candidateRouter = Router();

candidateRouter.use(
  requireAuth,
  requireRole("candidate"),
);

candidateRouter.get("/profile", getCandidateProfile);

candidateRouter.put("/profile", upsertCandidateProfile);
