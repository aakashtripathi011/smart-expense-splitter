const pool = require("../config/db");

const {
    calculateBalances,
    calculateSettlements,
} = require("../services/splitService");


// =====================================================
// GET GROUP SETTLEMENTS
// =====================================================

const getGroupSettlements = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Check membership
        const memberCheck = await pool.query(
            `SELECT id
             FROM group_members
             WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                message: "You are not a member of this group",
            });
        }

        // =================================================
        // CHECK IF GROUP HAS BEEN SETTLED
        // =================================================

        const settlementStatus = await pool.query(
            `SELECT COUNT(*) AS total
             FROM settlements
             WHERE group_id = $1
               AND settled = true`,
            [groupId]
        );

        const hasSettledRecords =
            Number(settlementStatus.rows[0].total) > 0;

        // =================================================
        // GET EXPENSES
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

        // =================================================
        // GET SHARES
        // =================================================

        const sharesResult = await pool.query(
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

        // Calculate shares
        for (const row of sharesResult.rows) {

            if (!shares[row.user_id]) {
                shares[row.user_id] = 0;
            }

            shares[row.user_id] += Number(row.amount);
        }

        // Calculate payments
        for (const row of expenseResult.rows) {

            if (!payments[row.created_by]) {
                payments[row.created_by] = 0;
            }

            payments[row.created_by] += Number(row.total);
        }

        // =================================================
        // IF GROUP IS ALREADY SETTLED
        // RETURN ZERO BALANCES
        // =================================================

        if (hasSettledRecords) {

            const userIds = new Set([
                ...Object.keys(shares),
                ...Object.keys(payments),
            ]);

            const balances = {};

            for (const userId of userIds) {
                balances[userId] = 0;
            }

            return res.status(200).json({
                groupId,
                balances,
                settlements: [],
            });
        }

        // =================================================
        // CALCULATE BALANCES
        // =================================================

        const balances = calculateBalances(
            shares,
            payments
        );

        // =================================================
        // CALCULATE SETTLEMENTS
        // =================================================

        const calculatedSettlements =
            calculateSettlements(balances);

        // =================================================
        // GET USER NAMES
        // =================================================

        const usersResult = await pool.query(
            `SELECT id, name
             FROM users
             WHERE id IN (
                 SELECT DISTINCT user_id
                 FROM group_members
                 WHERE group_id = $1

                 UNION

                 SELECT DISTINCT created_by
                 FROM expenses
                 WHERE group_id = $1

                 UNION

                 SELECT DISTINCT es.user_id
                 FROM expense_shares es
                 INNER JOIN expenses e
                    ON es.expense_id = e.id
                 WHERE e.group_id = $1
             )`,
            [groupId]
        );

        const users = {};

        for (const user of usersResult.rows) {
            users[user.id] = user.name;
        }

        // =================================================
        // ADD NAMES
        // =================================================

        const settlementsWithNames =
            calculatedSettlements.map((settlement) => ({
                from: settlement.from,
                to: settlement.to,
                amount: Number(settlement.amount),

                fromName:
                    users[settlement.from] ||
                    `User ${settlement.from}`,

                toName:
                    users[settlement.to] ||
                    `User ${settlement.to}`,
            }));

        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({
            groupId,
            balances,
            settlements: settlementsWithNames,
        });

    } catch (error) {

        console.error(
            "Settlement error:",
            error
        );

        res.status(500).json({
            message: "Failed to calculate settlements",
            error: error.message,
        });
    }
};


// =====================================================
// MARK GROUP SETTLED
// =====================================================

const markGroupSettlements = async (req, res) => {

    console.log(
        "========== MARK SETTLED =========="
    );

    try {

        const { groupId } = req.params;
        const userId = req.user.id;

        console.log("GROUP ID:", groupId);
        console.log("USER ID:", userId);

        // =================================================
        // CHECK MEMBERSHIP
        // =================================================

        const memberCheck = await pool.query(
            `SELECT id
             FROM group_members
             WHERE group_id = $1 AND user_id = $2`,
            [groupId, userId]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(403).json({
                message: "You are not a member of this group",
            });
        }

        // =================================================
        // GET EXPENSES
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

        if (expenseResult.rows.length === 0) {
            return res.status(400).json({
                message: "No expenses found for this group",
            });
        }

        // =================================================
        // GET SHARES
        // =================================================

        const sharesResult = await pool.query(
            `SELECT
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

        // Calculate shares
        for (const row of sharesResult.rows) {

            if (!shares[row.user_id]) {
                shares[row.user_id] = 0;
            }

            shares[row.user_id] += Number(row.amount);
        }

        // Calculate payments
        for (const row of expenseResult.rows) {

            if (!payments[row.created_by]) {
                payments[row.created_by] = 0;
            }

            payments[row.created_by] += Number(row.total);
        }

        // =================================================
        // CALCULATE BALANCES
        // =================================================

        const balances = calculateBalances(
            shares,
            payments
        );

        // =================================================
        // CALCULATE SETTLEMENTS
        // =================================================

        const settlements =
            calculateSettlements(balances);

        console.log(
            "CALCULATED SETTLEMENTS:",
            settlements
        );

        // =================================================
        // INSERT SETTLEMENT RECORDS
        // =================================================

        let inserted = 0;

        for (const settlement of settlements) {

            const payerId = Number(settlement.from);
            const receiverId = Number(settlement.to);
            const amount = Number(settlement.amount);

            // Use first expense only because
            // expense_id is required by your table.
            const expenseId =
                expenseResult.rows[0].id;

            // Check if this exact settlement
            // is already marked settled
            const existing = await pool.query(
                `SELECT id
                 FROM settlements
                 WHERE group_id = $1
                   AND payer_id = $2
                   AND receiver_id = $3
                   AND amount = $4
                   AND settled = true`,
                [
                    groupId,
                    payerId,
                    receiverId,
                    amount,
                ]
            );

            if (existing.rows.length > 0) {
                continue;
            }

            await pool.query(
                `INSERT INTO settlements
                 (
                    expense_id,
                    payer_id,
                    receiver_id,
                    amount,
                    settled,
                    group_id
                 )
                 VALUES ($1, $2, $3, $4, true, $5)`,
                [
                    expenseId,
                    payerId,
                    receiverId,
                    amount,
                    groupId,
                ]
            );

            inserted++;
        }

        console.log(
            "INSERTED SETTLEMENTS:",
            inserted
        );

        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({
            message: "All settlements marked as settled",
            updated: inserted,
        });

    } catch (error) {

        console.error(
            "Mark settlement error:",
            error
        );

        res.status(500).json({
            message:
                "Failed to mark settlements as settled",
            error: error.message,
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getGroupSettlements,
    markGroupSettlements,
};