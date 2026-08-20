const multer = require("multer");
const { scanReceipt } = require("../services/geminiService");
const pool = require("../config/db");

// -------------------------
// Multer setup
// -------------------------

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const upload = multer({
    storage: storage,
});

// -------------------------
// Create receipt
// -------------------------

const createReceipt = async (req, res) => {
    try {
        // Check file
        if (!req.file) {
            return res.status(400).json({
                message: "No receipt uploaded",
            });
        }

        console.log("Receipt uploaded:", req.file.path);

        // Scan receipt using Gemini
        const result = await scanReceipt(req.file.path);

        console.log("Gemini result:", result);

        // Convert Gemini JSON string into JavaScript object
       const cleanResult = result
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

const receiptData = JSON.parse(cleanResult);

        // Current logged-in user's ID
        const userId = req.user.id;

        // Save receipt
        const receiptResult = await pool.query(
            `INSERT INTO receipts (user_id, total)
             VALUES ($1, $2)
             RETURNING *`,
            [userId, receiptData.total]
        );

        const receipt = receiptResult.rows[0];

        // Save individual receipt items
        for (const item of receiptData.items) {
            await pool.query(
                `INSERT INTO receipt_items (receipt_id, name, price)
                 VALUES ($1, $2, $3)`,
                [
                    receipt.id,
                    item.name,
                    item.price,
                ]
            );
        }

        // Send response
        res.status(201).json({
            message: "Receipt created successfully",
            receipt: receipt,
            items: receiptData.items,
        });

    } catch (error) {
        console.error("Receipt processing failed:", error);

        res.status(500).json({
            message: "Failed to process receipt",
            error: error.message,
        });
    }
};

module.exports = {
    upload,
    createReceipt,
};