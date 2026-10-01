import { Router } from "express";
import {
  matchCandidates,
  getMatchResults,
} from "../controllers/matching.controller.js";

export const matchingRouter = Router();

matchingRouter.post("/jobs/:jobId/match", matchCandidates);
matchingRouter.get("/jobs/:jobId/matches", getMatchResults);
