import { Request, Response } from "express";
import { z } from "zod";

import { pool } from "../db/pool.js";

const applySchema = z.object({
  cover_letter: z.string().trim().max(5000).optional().default(""),
});

const statusSchema = z.object({
  status: z.enum([
    "applied",
    "reviewing",
    "shortlisted",
    "rejected",
    "hired",
  ]),
});

export async function applyToJob(req: Request, res: Response) {
  try {
    const candidateUserId = req.user!.id;
    const jobId = Number(req.params.jobId);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const parsed = applySchema.safeParse(req.body ?? {});

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid application data",
        details: parsed.error.flatten(),
      });
    }

    const candidateResult = await pool.query(
      `
      SELECT id
      FROM candidate_profiles
      WHERE user_id = $1
      `,
      [candidateUserId],
    );

    if (candidateResult.rowCount === 0) {
      return res.status(400).json({
        error: "Create your candidate profile before applying.",
      });
    }

    const candidateId = candidateResult.rows[0].id;

    const jobResult = await pool.query(
      `
      SELECT id
      FROM jobs
      WHERE id = $1
      `,
      [jobId],
    );

    if (jobResult.rowCount === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const existingResult = await pool.query(
      `
      SELECT id, status, applied_at
      FROM applications
      WHERE job_id = $1 AND candidate_id = $2
      `,
      [jobId, candidateId],
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({
        error: "You have already applied to this job.",
        application: existingResult.rows[0],
      });
    }

    const result = await pool.query(
      `
      INSERT INTO applications (
        job_id,
        candidate_id,
        cover_letter
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        job_id,
        candidate_id,
        status,
        cover_letter,
        applied_at,
        updated_at
      `,
      [jobId, candidateId, parsed.data.cover_letter],
    );

    return res.status(201).json({
      application: result.rows[0],
    });
  } catch (error) {
    console.error("applyToJob error:", error);

    return res.status(500).json({
      error: "Failed to submit application",
    });
  }
}

export async function getCandidateApplications(
  req: Request,
  res: Response,
) {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.cover_letter,
        a.applied_at,
        a.updated_at,
        j.title,
        j.company,
        j.description,
        j.location,
        j.employment_type,
        j.required_skills,
        j.experience_min,
        j.experience_max,
        mr.match_score,
        mr.matched_skills,
        mr.missing_skills,
        mr.analysis
      FROM applications a
      INNER JOIN candidate_profiles cp
        ON cp.id = a.candidate_id
      INNER JOIN jobs j
        ON j.id = a.job_id
      LEFT JOIN match_results mr
        ON mr.job_id = a.job_id
       AND mr.candidate_id = a.candidate_id
      WHERE cp.user_id = $1
      ORDER BY a.applied_at DESC
      `,
      [userId],
    );

    return res.json({
      applications: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch candidate applications:", error);

    return res.status(500).json({
      error: "Failed to fetch applications",
    });
  }
}

export async function getJobApplications(req: Request, res: Response) {
  try {
    const recruiterUserId = req.user!.id;
    const jobId = Number(req.params.jobId);

    if (!Number.isInteger(jobId) || jobId <= 0) {
      return res.status(400).json({ error: "Invalid job ID" });
    }

    const jobResult = await pool.query(
      `
      SELECT id, title, company
      FROM jobs
      WHERE id = $1 AND recruiter_id = $2
      `,
      [jobId, recruiterUserId],
    );

    if (jobResult.rowCount === 0) {
      return res.status(404).json({
        error: "Job not found or you do not own this job.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.status,
        a.cover_letter,
        a.applied_at,
        a.updated_at,

        cp.id AS candidate_id,
        cp.headline,
        cp.summary,
        cp.skills,
        cp.experience_years,
        cp.education,
        cp.location,
        cp.resume_url,

        u.id AS user_id,
        u.name,
        u.email,

        mr.match_score AS match_score,
        mr.matched_skills,
        mr.missing_skills,
        mr.analysis AS match_analysis

      FROM applications a

      INNER JOIN candidate_profiles cp
        ON cp.id = a.candidate_id

      INNER JOIN users u
        ON u.id = cp.user_id

      LEFT JOIN match_results mr
        ON mr.job_id = a.job_id
       AND mr.candidate_id = a.candidate_id

      WHERE a.job_id = $1

      ORDER BY
        mr.match_score DESC NULLS LAST,
        a.applied_at DESC
      `,
      [jobId],
    );

    return res.json({
      job: jobResult.rows[0],
      applications: result.rows,
    });
  } catch (error) {
    console.error("getJobApplications error:", error);

    return res.status(500).json({
      error: "Failed to fetch job applications",
    });
  }
}

export async function updateApplicationStatus(
  req: Request,
  res: Response,
) {
  try {
    const recruiterUserId = req.user!.id;
    const applicationId = Number(req.params.applicationId);

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      return res.status(400).json({
        error: "Invalid application ID",
      });
    }

    const parsed = statusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid application status",
        details: parsed.error.flatten(),
      });
    }

    const result = await pool.query(
      `
      UPDATE applications a
      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP
      FROM jobs j
      WHERE
        a.id = $2
        AND a.job_id = j.id
        AND j.recruiter_id = $3
      RETURNING
        a.id,
        a.job_id,
        a.candidate_id,
        a.status,
        a.cover_letter,
        a.applied_at,
        a.updated_at
      `,
      [parsed.data.status, applicationId, recruiterUserId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Application not found or you do not own this job.",
      });
    }

    return res.json({
      application: result.rows[0],
    });
  } catch (error) {
    console.error("updateApplicationStatus error:", error);

    return res.status(500).json({
      error: "Failed to update application status",
    });
  }
}
