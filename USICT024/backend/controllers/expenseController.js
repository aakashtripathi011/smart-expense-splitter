const pool = require("../config/db");

const {
    calculateEqualSplitForUsers,
    calculateItemSplit,
} = require("../services/splitService");


// =========================
// CREATE EXPENSE
// =========================

const createExpense = async (req, res) => {
    try {
        const {
            groupId,
            description,
            amount,
            splitType,
            users,
            items,
        } = req.body;

        const createdBy = req.user.id;

        if (!groupId || !description || !amount || !splitType) {
            return res.status(400).json({
                message:
                    "groupId, description, amount and splitType are required",
            });
        }

        // Check if user is the group admin
        const groupCheck = await pool.query(
            `SELECT created_by
             FROM groups
             WHERE id = $1`,
            [groupId]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({
                message: "Group not found",
            });
        }

        if (
            Number(groupCheck.rows[0].created_by) !==
            Number(createdBy)
        ) {
            return res.status(403).json({
                message: "Only the group admin can create expenses",
            });
        }

        // Create expense
        const expenseResult = await pool.query(
            `INSERT INTO expenses
                (group_id, created_by, total, description)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [groupId, createdBy, amount, description]
        );

        const expense = expenseResult.rows[0];

        let shares = {};

        // Equal split
        if (splitType === "equal") {

            if (!users || users.length === 0) {
                return res.status(400).json({
                    message: "Users are required for equal split",
                });
            }

            const result = calculateEqualSplitForUsers(
                Number(amount),
                users
            );

            for (const share of result) {
                shares[share.userId] = share.amount;
            }
        }

        // Item-wise split
        else if (splitType === "item") {

            if (!items || items.length === 0) {
                return res.status(400).json({
                    message: "Items are required for item-wise split",
                });
            }

            shares = calculateItemSplit(items);
        }

        else {
            return res.status(400).json({
                message: "Invalid split type",
            });
        }

        // Save shares
        for (const userId in shares) {

            await pool.query(
                `INSERT INTO expense_shares
                    (expense_id, user_id, amount)
                 VALUES ($1, $2, $3)`,
                [
                    expense.id,
                    userId,
                    shares[userId],
                ]
            );
        }

        res.status(201).json({
            message: "Expense created successfully",
            expense,
            shares,
        });

    } catch (error) {

        console.error(
            "Create expense error:",
            error
        );

        res.status(500).json({
            message: "Failed to create expense",
            error: error.message,
        });
    }
};


// =========================
// GET GROUP BALANCES
// =========================

const getGroupBalances = async (req, res) => {
    try {

        const { groupId } = req.params;

        // =================================================
        // CHECK IF GROUP HAS BEEN SETTLED
        // =================================================

        const settlementCheck = await pool.query(
            `SELECT id
             FROM settlements
             WHERE group_id = $1
               AND settled = true
             LIMIT 1`,
            [groupId]
        );

        // =================================================
        // IF GROUP IS SETTLED
        // EVERYONE'S BALANCE = 0
        // =================================================

        if (settlementCheck.rows.length > 0) {

            const membersResult = await pool.query(
                `SELECT user_id
                 FROM group_members
                 WHERE group_id = $1`,
                [groupId]
            );

            const balances = {};

            for (const member of membersResult.rows) {
                balances[member.user_id] = 0;
            }

            return res.status(200).json({
                groupId,
                balances,
            });
        }

        // =================================================
        // GROUP NOT SETTLED
        // CALCULATE NORMAL BALANCES
        // =================================================

        const expenseResult = await pool.query(
            `SELECT
                id,
                created_by,
                total
             FROM expenses
             WHERE group_id = $1`,
            [groupId]
        );

        const shareResult = await pool.query(
            `SELECT
                es.expense_id,
                es.user_id,
                es.amount
             FROM expense_shares es
             INNER JOIN expenses e
                ON es.expense_id = e.id
             WHERE e.group_id = $1`,
            [groupId]
        );

        const shares = {};
        const payments = {};

        // =================================================
        // CALCULATE OWED AMOUNTS
        // =================================================

        for (const row of shareResult.rows) {

            if (!shares[row.user_id]) {
                shares[row.user_id] = 0;
            }

            shares[row.user_id] += Number(row.amount);
        }

        // =================================================
        // CALCULATE PAID AMOUNTS
        // =================================================

        for (const expense of expenseResult.rows) {

            if (!payments[expense.created_by]) {
                payments[expense.created_by] = 0;
            }

            payments[expense.created_by] += Number(
                expense.total
            );
        }

        // =================================================
        // CALCULATE BALANCES
        // =================================================

        const balances = {};

        const userIds = new Set([
            ...Object.keys(shares),
            ...Object.keys(payments),
        ]);

        for (const userId of userIds) {

            const paid = payments[userId] || 0;
            const owed = shares[userId] || 0;

            balances[userId] = Number(
                (paid - owed).toFixed(2)
            );
        }

        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({
            groupId,
            balances,
        });

    } catch (error) {

        console.error(
            "Get balances error:",
            error
        );

        res.status(500).json({
            message: "Failed to calculate balances",
            error: error.message,
        });
    }
};


// =========================
// GET GROUP EXPENSES
// =========================

const getGroupExpenses = async (req, res) => {
    try {

        const { groupId } = req.params;
        const userId = req.user.id;

        // Check group membership
        const memberCheck = await pool.query(
            `SELECT id
             FROM group_members
             WHERE group_id = $1
               AND user_id = $2`,
            [groupId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                message: "You are not a member of this group",
            });
        }

        // Get expenses
        const expenseResult = await pool.query(
            `SELECT
                e.id,
                e.description,
                e.total,
                e.created_at,
                e.created_by,
                u.name AS created_by_name
             FROM expenses e
             JOIN users u
                ON e.created_by = u.id
             WHERE e.group_id = $1
             ORDER BY e.created_at DESC`,
            [groupId]
        );

        res.status(200).json({
            groupId,
            expenses: expenseResult.rows,
        });

    } catch (error) {

        console.error(
            "Get expenses error:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch expenses",
            error: error.message,
        });
    }
};


// =========================
// EXPORTS
// =========================

module.exports = {
    createExpense,
    getGroupBalances,
    getGroupExpenses,
};