const express = require("express");

const router = express.Router();

const {
    getGroupSettlements,
    markExpenseSettlement,
} = require("../controllers/settlementController");

const authMiddleware = require("../middleware/authMiddleware");

router.get(
    "/:groupId",
    authMiddleware,
    getGroupSettlements
);

router.patch(
    "/:groupId/expenses/:expenseId/settle",
    authMiddleware,
    markExpenseSettlement
);

module.exports = router;