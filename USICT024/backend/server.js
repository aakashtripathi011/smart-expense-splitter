const express = require("express");
const pool = require("./config/db");
const receiptRoutes = require("./routes/receiptRoutes");
const authRoutes = require("./routes/authRoutes");
const verifyToken = require("./middleware/authMiddleware");
const cors = require("cors");
const groupRoutes = require("./routes/groupRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const settlementRoutes = require("./routes/settlementRoutes");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 5000;

app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://smart-expense-splitter-ten.vercel.app",
        "https://smart-expense-splitter-git-main-aakash-5827.vercel.app"
    ]
}));
app.use("/api/receipts", receiptRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/settlements", settlementRoutes);

app.get("/", (req, res) => {
    res.send("Smart Expense Splitter API is running");
});

app.get("/protected-test", verifyToken, (req, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.user,
    });
});

app.get("/db-test", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            message: "Database connected",
            time: result.rows[0].now,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database connection failed",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});