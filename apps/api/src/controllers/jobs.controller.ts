import type { Request, Response } from "express";
import { z } from "zod";

import { pool } from "../db/pool.js";

const createJobSchema = z.object({
  title: z.string().trim().min(2).max(150),
  company: z.string().trim().min(2).max(150),
  description: z.string().trim().min(20).max(10000),
  location: z.string().trim().min(2).max(150),
  employment_type: z.enum([
    "Full-time",
    "Part-time",
    "Contract",
    "Internship",
  ]),
  required_skills: z
    .array(z.string().trim().min(1).max(100))
    .min(1)
    .max(30),
  experience_min: z.number().int().min(0).max(50),
  experience_max: z.number().int().min(0).max(50),
});

export const getJobs = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        company,
        description,
        location,
        employment_type,
        required_skills,
        experience_min,
        experience_max,
        created_at
      FROM jobs
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      jobs: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Failed to fetch jobs:", error);

    return res.status(500).json({
      error: "Failed to fetch jobs",
    });
  }
};

export const getJobById = async (req: Request, res: Response) => {
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId) || jobId <= 0) {
    return res.status(400).json({ error: "Invalid job ID" });
  }

  try {
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          company,
          description,
          location,
          employment_type,
          required_skills,
          experience_min,
          experience_max,
          created_at
        FROM jobs
        WHERE id = $1
      `,
      [jobId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.status(200).json({
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to fetch job:", error);

    return res.status(500).json({
      error: "Failed to fetch job",
    });
  }
};

export const createJob = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== "recruiter") {
    return res.status(403).json({
      error: "Recruiter access required",
    });
  }

  const parsed = createJobSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid job data",
      details: parsed.error.flatten(),
    });
  }

  const data = parsed.data;

  if (data.experience_max < data.experience_min) {
    return res.status(400).json({
      error: "Maximum experience cannot be less than minimum experience",
    });
  }

  const requiredSkills = [
    ...new Set(
      data.required_skills
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  ];

  if (requiredSkills.length === 0) {
    return res.status(400).json({
      error: "At least one required skill is needed",
    });
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO jobs (
          title,
          company,
          description,
          location,
          employment_type,
          required_skills,
          experience_min,
          experience_max
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          title,
          company,
          description,
          location,
          employment_type,
          required_skills,
          experience_min,
          experience_max,
          created_at
      `,
      [
        data.title,
        data.company,
        data.description,
        data.location,
        data.employment_type,
        requiredSkills,
        data.experience_min,
        data.experience_max,
      ],
    );

    return res.status(201).json({
      message: "Job created successfully",
      job: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to create job:", error);

    return res.status(500).json({
      error: "Failed to create job",
    });
  }
};
