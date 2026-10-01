import type { Request, Response } from "express";
import { z } from "zod";

import { pool } from "../db/pool.js";

const profileSchema = z.object({
  resume_url: z
    .string()
    .trim()
    .url()
    .max(1000)
    .optional()
    .or(z.literal("")),

  headline: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(""),

  summary: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .default(""),

  skills: z
    .array(z.string().trim().min(1).max(100))
    .max(50)
    .default([]),

  experience_years: z
    .number()
    .int()
    .min(0)
    .max(50)
    .default(0),

  education: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default(""),

  location: z
    .string()
    .trim()
    .max(200)
    .optional()
    .default(""),
});

export const getCandidateProfile = async (
  req: Request,
  res: Response,
) => {
  if (!req.user || req.user.role !== "candidate") {
    return res.status(403).json({
      error: "Candidate access required",
    });
  }

  try {
    const result = await pool.query(
      `
        SELECT
          id,
          user_id,
          resume_url,
          headline,
          summary,
          skills,
          experience_years,
          education,
          location,
          created_at,
          updated_at
        FROM candidate_profiles
        WHERE user_id = $1
      `,
      [req.user.id],
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        profile: null,
      });
    }

    return res.status(200).json({
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to fetch candidate profile:", error);

    return res.status(500).json({
      error: "Failed to fetch candidate profile",
    });
  }
};

export const upsertCandidateProfile = async (
  req: Request,
  res: Response,
) => {
  if (!req.user || req.user.role !== "candidate") {
    return res.status(403).json({
      error: "Candidate access required",
    });
  }

  const parsed = profileSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid profile data",
      details: parsed.error.flatten(),
    });
  }

  const data = parsed.data;

  const skills = [
    ...new Set(
      data.skills
        .map((skill) => skill.trim())
        .filter(Boolean),
    ),
  ];

  try {
    const result = await pool.query(
      `
        INSERT INTO candidate_profiles (
          user_id,
          resume_url,
          headline,
          summary,
          skills,
          experience_years,
          education,
          location
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id)
        DO UPDATE SET
          resume_url = EXCLUDED.resume_url,
          headline = EXCLUDED.headline,
          summary = EXCLUDED.summary,
          skills = EXCLUDED.skills,
          experience_years = EXCLUDED.experience_years,
          education = EXCLUDED.education,
          location = EXCLUDED.location,
          updated_at = CURRENT_TIMESTAMP
        RETURNING
          id,
          user_id,
          resume_url,
          headline,
          summary,
          skills,
          experience_years,
          education,
          location,
          created_at,
          updated_at
      `,
      [
        req.user.id,
        data.resume_url || null,
        data.headline,
        data.summary,
        skills,
        data.experience_years,
        data.education,
        data.location,
      ],
    );

    return res.status(200).json({
      message: "Candidate profile saved successfully",
      profile: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to save candidate profile:", error);

    return res.status(500).json({
      error: "Failed to save candidate profile",
    });
  }
};
