import { pool } from "./pool.js";

const result = await pool.query("SELECT NOW() AS now");

console.log("PostgreSQL connected:", result.rows[0]);

await pool.end();
