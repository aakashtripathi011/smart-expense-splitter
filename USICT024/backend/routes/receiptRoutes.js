const express = require("express");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

const {
    upload,
    createReceipt,
} = require("../controllers/receiptController");

router.post(
    "/",
    verifyToken,
    upload.single("receipt"),
    createReceipt
);

module.exports = router;