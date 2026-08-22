const express = require("express");

const router = express.Router();

const {
    getGroupSettlements,
    markGroupSettlements,
} = require("../controllers/settlementController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/:groupId",
    authMiddleware,
    getGroupSettlements
);

router.patch(
    "/:groupId/settle",
    authMiddleware,
    markGroupSettlements
);

module.exports = router;