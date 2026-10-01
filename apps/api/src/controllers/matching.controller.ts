import type { Request, Response } from "express";
import { pool } from "../db/pool.js";

export const matchCandidates = async (req: Request, res: Response) => {
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res.status(400).json({
      error: "Invalid job ID",
    });
  }

  try {
    const jobResult = await pool.query(
      `
      SELECT
        id,
        title,
        required_skills,
        experience_min,
        experience_max
      FROM jobs
      WHERE id = $1
      `,
      [jobId]
    );

    if (jobResult.rowCount === 0) {
      return res.status(404).json({
        error: "Job not found",
      });
    }

    const job = jobResult.rows[0];

    const candidateResult = await pool.query(
      `
      SELECT
        id,
        user_id,
        headline,
        skills,
        experience_years,
        location
      FROM candidate_profiles
      `
    );

    const requiredSkills: string[] = job.required_skills || [];

    const matches = candidateResult.rows.map((candidate) => {
      const candidateSkills: string[] = candidate.skills || [];

      const matchedSkills = requiredSkills.filter((required: string) =>
        candidateSkills.some(
          (skill: string) =>
            skill.toLowerCase() === required.toLowerCase()
        )
      );

      const missingSkills = requiredSkills.filter(
        (required: string) =>
          !candidateSkills.some(
            (skill: string) =>
              skill.toLowerCase() === required.toLowerCase()
          )
      );

      const skillScore =
        requiredSkills.length === 0
          ? 100
          : (matchedSkills.length / requiredSkills.length) * 70;

      const experienceScore =
        candidate.experience_years >= job.experience_min
          ? 30
          : Math.max(
              0,
              (candidate.experience_years /
                Math.max(job.experience_min, 1)) *
                30
            );

      const matchScore = Math.min(
        100,
        Number((skillScore + experienceScore).toFixed(2))
      );

      return {
        candidate_id: candidate.id,
        user_id: candidate.user_id,
        headline: candidate.headline,
        skills: candidateSkills,
        experience_years: candidate.experience_years,
        location: candidate.location,
        match_score: matchScore,
        matched_skills: matchedSkills,
        missing_skills: missingSkills,
        analysis: `Matched ${matchedSkills.length} of ${requiredSkills.length} required skills and has ${candidate.experience_years} year(s) of experience.`,
      };
    });

    matches.sort((a, b) => b.match_score - a.match_score);

    // Save each matching result without creating duplicates
    for (const match of matches) {
      const existingResult = await pool.query(
        `
        UPDATE match_results
        SET
          match_score = $3,
          matched_skills = $4,
          missing_skills = $5,
          analysis = $6,
          created_at = NOW()
        WHERE job_id = $1
          AND candidate_id = $2
        `,
        [
          jobId,
          match.candidate_id,
          match.match_score,
          match.matched_skills,
          match.missing_skills,
          match.analysis,
        ]
      );

      if (existingResult.rowCount === 0) {
        await pool.query(
          `
          INSERT INTO match_results (
            job_id,
            candidate_id,
            match_score,
            matched_skills,
            missing_skills,
            analysis
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            jobId,
            match.candidate_id,
            match.match_score,
            match.matched_skills,
            match.missing_skills,
            match.analysis,
          ]
        );
      }
    }

    return res.status(200).json({
      job: {
        id: job.id,
        title: job.title,
        required_skills: requiredSkills,
        experience_min: job.experience_min,
        experience_max: job.experience_max,
      },
      matches,
      count: matches.length,
    });
  } catch (error) {
    console.error("Failed to match candidates:", error);

    return res.status(500).json({
      error: "Failed to match candidates",
    });
  }
};

export const getMatchResults = async (req: Request, res: Response) => {
  const jobId = Number(req.params.jobId);

  if (!Number.isInteger(jobId)) {
    return res.status(400).json({
      error: "Invalid job ID",
    });
  }

  try {
    const result = await pool.query(
      `
      SELECT
        mr.id,
        mr.job_id,
        mr.candidate_id,
        u.id AS user_id,
        u.name AS candidate_name,
        u.email AS candidate_email,
        cp.resume_url,
        cp.headline,
        cp.summary,
        cp.skills,
        cp.experience_years,
        cp.education,
        cp.location,
        mr.match_score,
        mr.matched_skills,
        mr.missing_skills,
        mr.analysis,
        mr.created_at
      FROM match_results mr
      JOIN candidate_profiles cp
        ON cp.id = mr.candidate_id
      JOIN users u
        ON u.id = cp.user_id
      WHERE mr.job_id = $1
      ORDER BY mr.match_score DESC, mr.created_at DESC
      `,
      [jobId]
    );

    return res.status(200).json({
      job_id: jobId,
      matches: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error("Failed to fetch match results:", error);

    return res.status(500).json({
      error: "Failed to fetch match results",
    });
  }
};
