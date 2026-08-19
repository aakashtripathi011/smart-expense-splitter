const express = require("express");
const pool = require("./config/db");
const receiptRoutes = require("./routes/receiptRoutes");

const app = express();

const PORT = 5000;

app.use(express.json());
app.use("/api/receipts", receiptRoutes);

app.get("/", (req, res) => {
    res.send("Smart Expense Splitter API is running");
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