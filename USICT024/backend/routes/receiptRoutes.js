const express = require("express");

const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

const {
    upload,
    createReceipt,
    createQuestReceipt,
} = require("../controllers/receiptController");


// Logged-in receipt
router.post(
    "/",
    verifyToken,
    upload.single("receipt"),
    createReceipt
);


// Quest receipt — no login
router.post(
    "/quest",
    upload.single("receipt"),
    createQuestReceipt
);

module.exports = router;