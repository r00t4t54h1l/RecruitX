import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import { pool } from "../db/pool.js";
import { env } from "../config/env.js";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  role: z.enum(["candidate", "recruiter"]).default("candidate"),
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const createToken = (user: {
  id: number;
  role: string;
}) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid registration data",
      details: parsed.error.flatten().fieldErrors,
    });
  }

  const { name, email, password, role } = parsed.data;

  try {
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at
      `,
      [name, email, passwordHash, role],
    );

    const user = result.rows[0];

    const token = createToken(user);

    return res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return res.status(500).json({
      error: "Registration failed",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid login data",
    });
  }

  const { email, password } = parsed.data;

  try {
    const result = await pool.query(
      `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE LOWER(email) = LOWER($1)
      `,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordValid = await bcrypt.compare(
      password,
      user.password_hash,
    );

    if (!passwordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({
      error: "Login failed",
    });
  }
};

export const me = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  try {
    const result = await pool.query(
      `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = $1
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }
};
