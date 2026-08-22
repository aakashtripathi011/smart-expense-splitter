const express = require("express");

const router = express.Router();

const {
    createExpense,
    getGroupBalances,
    getGroupExpenses,
} = require("../controllers/expenseController");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/",
    authMiddleware,
    createExpense
);

router.get(
    "/group/:groupId/balances",
    authMiddleware,
    getGroupBalances
);

router.get(
    "/group/:groupId",
    authMiddleware,
    getGroupExpenses
);

module.exports = router;