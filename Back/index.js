// Import required modules
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const db = require("./db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const express = require("express");
const app = express();

// ✅ CORS middleware
app.use(
  cors({
    origin: "https://trust-payy.vercel.app",
    credentials: true,
  })
);

// ✅ Preflight request handler
app.options("*", cors());

// ✅ Body parser
app.use(express.json());

// 👇 Add this function to initialize your tables from init.sql
const initDb = async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, "init.sql")).toString();
    await db.query(sql);
    console.log("✅ Tables ensured in DB.");
  } catch (err) {
    console.error("❌ Failed to initialize DB tables:", err);
  }
};

// Call it when server starts
initDb();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }

    req.user = user; // Save user data from token to request
    next();
  });
}

// Default route
app.get("/", (req, res) => {
  res.send("Escrow Platform API is running!");
});

app.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body; // ✅ extract role from request
    const isSeller = role === "seller"; // ✅ convert to boolean

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Email, password, and role are required" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await db.query(
      "INSERT INTO users (email, password, is_seller) VALUES ($1, $2, $3) RETURNING id, email, is_seller, created_at",
      [email, hashedPassword, isSeller] // ✅ include is_seller in values
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if both fields are filled
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const result = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // If no user found
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ Create JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // If match, send back user info (excluding password)
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        is_seller: user.is_seller, // ✅ send this to frontend
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/all-escrows", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM escrows");

    res.json({
      message: "All escrows fetched successfully",
      escrows: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/transactions", authenticateToken, async (req, res) => {
  try {
    // For now, just return dummy transactions
    res.json({
      message: "Access granted to protected transactions route!",
      user: req.user,
      transactions: [
        { id: 1, amount: 10000, type: "credit" },
        { id: 2, amount: 5000, type: "debit" },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/escrows-by-status", async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({
        error: "Status query parameter is required (e.g. pending or completed)",
      });
    }

    const result = await db.query("SELECT * FROM escrows WHERE status = $1", [
      status,
    ]);

    res.json({
      message: `Escrows with status "${status}" fetched successfully`,
      escrows: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/cancel-escrow", authenticateToken, async (req, res) => {
  try {
    const { escrow_id } = req.body;
    const buyerId = req.user.id;

    if (!escrow_id) {
      return res.status(400).json({ error: "escrow_id is required" });
    }

    // Check if escrow exists and belongs to this buyer and is still pending
    const checkResult = await db.query(
      "SELECT * FROM escrows WHERE id = $1 AND buyer_id = $2 AND status = $3",
      [escrow_id, buyerId, "pending"]
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Escrow not found, not pending, or unauthorized" });
    }

    // Update status to cancelled
    await db.query("UPDATE escrows SET status = $1 WHERE id = $2", [
      "cancelled",
      escrow_id,
    ]);

    res.json({ message: "Escrow cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/create-escrow", authenticateToken, async (req, res) => {
  try {
    const { seller_email, amount, description } = req.body;
    const buyerId = req.user.id;

    if (!seller_email || !amount) {
      return res
        .status(400)
        .json({ error: "Seller email and amount are required" });
    }

    const result = await db.query(
      "INSERT INTO escrows (buyer_id, seller_email, amount, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [buyerId, seller_email, amount, description]
    );

    res.status(201).json({
      message: "Escrow created successfully",
      escrow: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/my-escrows", authenticateToken, async (req, res) => {
  try {
    const buyerId = req.user.id;

    const result = await db.query("SELECT * FROM escrows WHERE buyer_id = $1", [
      buyerId,
    ]);

    res.json({
      message: "Fetched your escrows successfully",
      escrows: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/buyer/escrows", authenticateToken, async (req, res) => {
  try {
    const buyerId = req.user.id; // get the ID from the token

    // Get escrows *only* for this buyer
    const result = await db.query(
      "SELECT * FROM escrows WHERE buyer_id = $1 ORDER BY created_at DESC",
      [buyerId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/seller-escrows", authenticateToken, async (req, res) => {
  try {
    // The seller is identified by their email
    const sellerEmail = req.user.email;

    // Find all escrows where this email is the seller
    const result = await db.query(
      "SELECT * FROM escrows WHERE seller_email = $1",
      [sellerEmail]
    );

    // Send back those escrow records
    res.json({
      message: "Fetched escrows assigned to you",
      escrows: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/escrow/:id/accept", authenticateToken, async (req, res) => {
  const escrowId = req.params.id;
  const sellerEmail = req.user.email;

  try {
    const result = await db.query(
      "UPDATE escrows SET status = 'accepted' WHERE id = $1 AND seller_email = $2 AND status = 'pending' RETURNING *",
      [escrowId, sellerEmail]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Escrow not found or already processed" });
    }

    res.json({
      message: "Escrow accepted successfully",
      escrow: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/escrow/:id/reject", authenticateToken, async (req, res) => {
  const escrowId = req.params.id;
  const sellerEmail = req.user.email;

  try {
    const result = await db.query(
      "UPDATE escrows SET status = 'rejected' WHERE id = $1 AND seller_email = $2 AND status = 'pending' RETURNING *",
      [escrowId, sellerEmail]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Escrow not found or already processed" });
    }

    res.json({
      message: "Escrow rejected successfully",
      escrow: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/release-payment", authenticateToken, async (req, res) => {
  try {
    const { escrow_id } = req.body;
    const buyerId = req.user.id;

    if (!escrow_id) {
      return res.status(400).json({ error: "escrow_id is required" });
    }

    // First, check that the escrow exists and belongs to the buyer
    const checkResult = await db.query(
      "SELECT * FROM escrows WHERE id = $1 AND buyer_id = $2",
      [escrow_id, buyerId]
    );

    if (checkResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Escrow not found or unauthorized" });
    }

    // Update the status to completed
    await db.query("UPDATE escrows SET status = $1 WHERE id = $2", [
      "completed",
      escrow_id,
    ]);

    res.json({ message: "Payment released successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
