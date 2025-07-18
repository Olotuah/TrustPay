// Import pg library and dotenv
const { Pool } = require("pg");
require("dotenv").config();

// Create a new pool using your DATABASE_URL with SSL enabled
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Only use SSL if needed
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test the connection immediately
pool
  .connect()
  .then((client) => {
    console.log("✅ Connected to PostgreSQL database!");
    client.release();
  })
  .catch((err) => {
    console.error("❌ Error connecting to database:", err);
  });

// Export the pool for queries
module.exports = pool;
