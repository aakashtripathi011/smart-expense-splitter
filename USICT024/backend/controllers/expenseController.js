const pool = require("../config/db");

const {
    calculateEqualSplitForUsers,
    calculateItemSplit,
} = require("../services/splitService");


// ============================================================
// CREATE EXPENSE
// ============================================================

const createExpense = async (req, res) => {
    try {

        const {
            groupId,
            description,
            amount,
            splitType,
            users,
            items,
            payerId,
        } = req.body;

        // Person currently logged in
        const createdBy = req.user.id;

        // ========================================================
        // BASIC VALIDATION
        // ========================================================

        if (
            !groupId ||
            !description ||
            !amount ||
            !splitType
        ) {
            return res.status(400).json({
                message:
                    "groupId, description, amount and splitType are required",
            });
        }

        if (Number(amount) <= 0) {
            return res.status(400).json({
                message: "Amount must be greater than zero",
            });
        }

        // ========================================================
        // CHECK GROUP
        // ========================================================

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

        // ========================================================
        // ONLY ADMIN CAN CREATE EXPENSE
        // ========================================================

        if (
            Number(groupCheck.rows[0].created_by) !==
            Number(createdBy)
        ) {
            return res.status(403).json({
                message:
                    "Only the group admin can create expenses",
            });
        }

        // ========================================================
        // PAYER IS REQUIRED
        // ========================================================

        if (!payerId) {
            return res.status(400).json({
                message:
                    "Please select who actually paid",
            });
        }

        const actualPayerId = Number(payerId);

        // ========================================================
        // CHECK PAYER IS A GROUP MEMBER
        // ========================================================

        const payerCheck = await pool.query(
            `SELECT gm.user_id, u.name
             FROM group_members gm
             JOIN users u
                ON gm.user_id = u.id
             WHERE gm.group_id = $1
               AND gm.user_id = $2`,
            [
                groupId,
                actualPayerId,
            ]
        );

        if (payerCheck.rows.length === 0) {
            return res.status(400).json({
                message:
                    "Selected payer is not a member of this group",
            });
        }

        // ========================================================
        // VALIDATE INCLUDED USERS
        // ========================================================

        let includedUsers = [];

        if (splitType === "equal") {

            if (
                !Array.isArray(users) ||
                users.length === 0
            ) {
                return res.status(400).json({
                    message:
                        "Please select at least one person",
                });
            }

            includedUsers = users.map(
                (user) => Number(
                    typeof user === "object"
                        ? user.id
                        : user
                )
            );

        } else if (splitType === "item") {

            if (
                !Array.isArray(items) ||
                items.length === 0
            ) {
                return res.status(400).json({
                    message:
                        "Items are required for item-wise split",
                });
            }

            // Get all people involved in the items
            for (const item of items) {

                let itemUsers = [];

                if (Array.isArray(item.users)) {
                    itemUsers = item.users;
                } else if (item.userId) {
                    itemUsers = [item.userId];
                }

                for (const user of itemUsers) {

                    const id = Number(
                        typeof user === "object"
                            ? user.id
                            : user
                    );

                    if (
                        id &&
                        !includedUsers.includes(id)
                    ) {
                        includedUsers.push(id);
                    }
                }
            }

            if (includedUsers.length === 0) {
                return res.status(400).json({
                    message:
                        "Please assign items to at least one person",
                });
            }
        }

        // ========================================================
        // CHECK ALL INCLUDED USERS ARE GROUP MEMBERS
        // ========================================================

        const memberResult = await pool.query(
            `SELECT user_id
             FROM group_members
             WHERE group_id = $1
               AND user_id = ANY($2::int[])`,
            [
                groupId,
                includedUsers,
            ]
        );

        const validMemberIds =
            memberResult.rows.map(
                (row) => Number(row.user_id)
            );

        const invalidUsers =
            includedUsers.filter(
                (id) =>
                    !validMemberIds.includes(id)
            );

        if (invalidUsers.length > 0) {
            return res.status(400).json({
                message:
                    "One or more selected users are not group members",
            });
        }

        // ========================================================
        // CALCULATE SHARES
        // ========================================================

        let shares = {};

        // ========================================================
        // EQUAL SPLIT
        // ========================================================

        if (splitType === "equal") {

            const result =
                calculateEqualSplitForUsers(
                    Number(amount),
                    includedUsers
                );

            for (const share of result) {

                shares[share.userId] =
                    Number(
                        share.amount.toFixed(2)
                    );
            }
        }

        // ========================================================
        // ITEM-WISE SPLIT
        // ========================================================

        else if (splitType === "item") {

            // -----------------------------------------------
            // Calculate item subtotal
            // -----------------------------------------------

            const itemShares =
                calculateItemSplit(items);

            const itemSubtotal =
                Object.values(itemShares).reduce(
                    (sum, value) =>
                        sum + Number(value),
                    0
                );

            if (itemSubtotal <= 0) {
                return res.status(400).json({
                    message:
                        "Item subtotal must be greater than zero",
                });
            }

            // -----------------------------------------------
            // Distribute final receipt total proportionally
            //
            // Example:
            //
            // Items = ₹1340
            // Tax   = ₹67
            // Total = ₹1407
            //
            // Tax is distributed according to
            // each person's item share.
            // -----------------------------------------------

            const actualTotal =
                Number(amount);

            for (
                const userId in itemShares
            ) {

                const userItemShare =
                    Number(
                        itemShares[userId]
                    );

                const proportion =
                    userItemShare /
                    itemSubtotal;

                shares[userId] =
                    Number(
                        (
                            actualTotal *
                            proportion
                        ).toFixed(2)
                    );
            }

            // -----------------------------------------------
            // Fix rounding difference
            // -----------------------------------------------

            const calculatedTotal =
                Object.values(shares).reduce(
                    (sum, value) =>
                        sum + Number(value),
                    0
                );

            const roundingDifference =
                Number(
                    (
                        actualTotal -
                        calculatedTotal
                    ).toFixed(2)
                );

            if (
                Math.abs(
                    roundingDifference
                ) >= 0.01
            ) {

                const firstUserId =
                    Object.keys(shares)[0];

                shares[firstUserId] =
                    Number(
                        (
                            shares[firstUserId] +
                            roundingDifference
                        ).toFixed(2)
                    );
            }
        }

        // ========================================================
        // INVALID SPLIT
        // ========================================================

        else {

            return res.status(400).json({
                message:
                    "Invalid split type",
            });
        }

        // ========================================================
        // CREATE EXPENSE
        // ========================================================
        //
        // IMPORTANT:
        //
        // created_by now represents the PERSON WHO PAID.
        //
        // This fixes the problem where Claire was always
        // shown as payer.
        //
        // The logged-in admin can choose another group member
        // as payer using payerId.
        //
        // ========================================================

        const expenseResult =
            await pool.query(
                `INSERT INTO expenses
                    (group_id, created_by, total, description)
                 VALUES ($1, $2, $3, $4)
                 RETURNING *`,
                [
                    groupId,
                    actualPayerId,
                    Number(amount),
                    description,
                ]
            );

        const expense =
            expenseResult.rows[0];

        // ========================================================
        // SAVE EXPENSE SHARES
        // ========================================================

        for (
            const userId in shares
        ) {

            await pool.query(
                `INSERT INTO expense_shares
                    (expense_id, user_id, amount)
                 VALUES ($1, $2, $3)`,
                [
                    expense.id,
                    Number(userId),
                    Number(
                        shares[userId]
                    ),
                ]
            );
        }

        // ========================================================
        // RESPONSE
        // ========================================================

        res.status(201).json({

            message:
                "Expense created successfully",

            expense,

            payerId:
                actualPayerId,

            payerName:
                payerCheck.rows[0].name,

            shares,

        });

    } catch (error) {

        console.error(
            "Create expense error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to create expense",
            error:
                error.message,
        });
    }
};


// ============================================================
// GET GROUP BALANCES
// ============================================================

const getGroupBalances = async (
    req,
    res
) => {

    try {

        const { groupId } =
            req.params;

        // ========================================================
        // GET EXPENSES
        // ========================================================

        const expenseResult =
            await pool.query(
                `SELECT
                    id,
                    created_by,
                    total
                 FROM expenses
                 WHERE group_id = $1`,
                [groupId]
            );

        // ========================================================
        // GET SHARES
        // ========================================================

        const shareResult =
            await pool.query(
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

        // ========================================================
        // HOW MUCH EACH PERSON OWES
        // ========================================================

        for (
            const row of shareResult.rows
        ) {

            const userId =
                Number(row.user_id);

            if (!shares[userId]) {
                shares[userId] = 0;
            }

            shares[userId] =
                Number(
                    (
                        shares[userId] +
                        Number(row.amount)
                    ).toFixed(2)
                );
        }

        // ========================================================
        // HOW MUCH EACH PERSON PAID
        // ========================================================

        for (
            const expense
            of expenseResult.rows
        ) {

            const payerId =
                Number(
                    expense.created_by
                );

            if (!payments[payerId]) {
                payments[payerId] = 0;
            }

            payments[payerId] =
                Number(
                    (
                        payments[payerId] +
                        Number(expense.total)
                    ).toFixed(2)
                );
        }

        // ========================================================
        // BALANCE
        // ========================================================
        //
        // Positive = gets money back
        // Negative = owes money
        //
        // Example:
        //
        // Claire paid ₹1407
        // Claire owes ₹703.50
        //
        // Claire balance:
        //
        // 1407 - 703.50
        // = +703.50
        //
        // Thebear:
        //
        // 0 - 703.50
        // = -703.50
        //
        // ========================================================

        const balances = {};

        const userIds =
            new Set([
                ...Object.keys(shares),
                ...Object.keys(payments),
            ]);

        for (
            const userId of userIds
        ) {

            const paid =
                payments[userId] || 0;

            const owed =
                shares[userId] || 0;

            balances[userId] =
                Number(
                    (
                        paid -
                        owed
                    ).toFixed(2)
                );
        }

        // ========================================================
        // RESPONSE
        // ========================================================

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
            message:
                "Failed to calculate balances",
            error:
                error.message,
        });
    }
};


// ============================================================
// GET GROUP EXPENSES
// ============================================================

const getGroupExpenses = async (
    req,
    res
) => {

    try {

        const { groupId } =
            req.params;

        const userId =
            req.user.id;

        // ========================================================
        // CHECK MEMBERSHIP
        // ========================================================

        const memberCheck =
            await pool.query(
                `SELECT id
                 FROM group_members
                 WHERE group_id = $1
                   AND user_id = $2`,
                [
                    groupId,
                    userId,
                ]
            );

        if (
            memberCheck.rows.length === 0
        ) {

            return res.status(403).json({
                message:
                    "You are not a member of this group",
            });
        }

        // ========================================================
        // GET EXPENSES + PAYER
        // ========================================================

        const expenseResult =
            await pool.query(
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

        // ========================================================
        // RESPONSE
        // ========================================================

        res.status(200).json({

            groupId,

            expenses:
                expenseResult.rows,

        });

    } catch (error) {

        console.error(
            "Get expenses error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to fetch expenses",
            error:
                error.message,
        });
    }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    createExpense,
    getGroupBalances,
    getGroupExpenses,
};