const express = require("express");

const router = express.Router();

const {
    upload,
    createReceipt,
} = require("../controllers/receiptController");

router.post("/", upload.single("receipt"), createReceipt);

module.exports = router;