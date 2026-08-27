const express = require("express");
const cors = require("cors");

const pool = require("./config/db");

const receiptRoutes = require("./routes/receiptRoutes");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const settlementRoutes = require("./routes/settlementRoutes");

const verifyToken = require("./middleware/authMiddleware");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================
// MIDDLEWARE
// =====================================

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://smart-expense-splitter-ten.vercel.app",
      "https://smart-expense-splitter-git-main-aakash-5827.vercel.app",
    ],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =====================================
// DATABASE TEST
// =====================================

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "Database connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error);

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
      code: error.code,
    });
  }
});

// =====================================
// API ROUTES
// =====================================

app.use("/api/receipts", receiptRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/groups", groupRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/settlements", settlementRoutes);



// =====================================
// HOME
// =====================================

app.get("/", (req, res) => {
  res.send("Smart Expense Splitter API is running");
});

// =====================================
// PROTECTED TEST
// =====================================

app.get("/protected-test", verifyToken, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

// =====================================
// START SERVER
// =====================================

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});