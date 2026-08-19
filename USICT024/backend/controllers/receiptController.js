const multer = require("multer");
const { scanReceipt } = require("../services/geminiService");

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
        if (!req.file) {
            return res.status(400).json({
                message: "No receipt uploaded",
            });
        }

        console.log("Receipt uploaded:", req.file.path);

        const result = await scanReceipt(req.file.path);

        console.log("Gemini result:", result);

        res.status(200).json({
            message: "Receipt scanned successfully",
            receipt: result,
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