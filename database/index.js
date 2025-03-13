const { Pool } = require("pg");
require("dotenv").config();

let pool;
const isDev = process.env.NODE_ENV === "development";

// Set up PostgreSQL connection pool
pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isDev
    ? { rejectUnauthorized: false } // For development, allows self-signed certificates
    : false, // Disable SSL in production if unnecessary
  max: 20, // Increase max connections
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
  connectionTimeoutMillis: 5000, // 5 seconds connection timeout
});

// Improved query function (works in both dev & prod)
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      if (isDev) {
        console.log("Executed query:", text);
      }
      return res;
    } catch (error) {
      console.error("Error in query:", text, error);
      throw error;
    }
  },
  pool, // Exporting the pool so you can manually release connections if needed
};
