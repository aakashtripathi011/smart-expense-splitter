const pool = require("../config/db");

const {
    calculateBalances,
    calculateSettlements,
} = require("../services/splitService");


// =====================================================
// GET GROUP SETTLEMENTS
// =====================================================

const getGroupSettlements = async (req, res) => {

     console.log("🔥🔥🔥 GET GROUP SETTLEMENTS CALLED 🔥🔥🔥");
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // =================================================
        // CHECK MEMBERSHIP
        // =================================================

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


        // =================================================
        // GET EXPENSES
        // =================================================

        const expenseResult = await pool.query(
            `SELECT
                id,
                description,
                total,
                created_at
             FROM expenses
             WHERE group_id = $1
             ORDER BY created_at DESC`,
            [groupId]
        );


        if (expenseResult.rows.length === 0) {
            return res.status(200).json({
                groupId,
                balances: {},
                settlements: [],
            });
        }


        // =================================================
        // GET ALL SHARES
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

        console.log("GROUP ID:", groupId);
console.log("SHARE ROWS:", sharesResult.rows);


        // =================================================
        // GET ALL PAYMENTS
        // =================================================

        const payerResult = await pool.query(
            `SELECT
                ep.expense_id,
                ep.user_id,
                ep.amount
             FROM expense_payers ep
             INNER JOIN expenses e
                ON ep.expense_id = e.id
             WHERE e.group_id = $1`,
            [groupId]
        );

        console.log("PAYER ROWS:", payerResult.rows);


        // =================================================
        // GET ALREADY SETTLED EXPENSES
        // =================================================

        const settledResult = await pool.query(
            `SELECT DISTINCT expense_id
             FROM settlements
             WHERE group_id = $1
               AND settled = true`,
            [groupId]
        );

        const settledExpenses = new Set(
            settledResult.rows.map(
                (row) => Number(row.expense_id)
            )
        );


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

                 SELECT DISTINCT ep.user_id
                 FROM expense_payers ep
                 INNER JOIN expenses e
                    ON ep.expense_id = e.id
                 WHERE e.group_id = $1

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
        // CREATE QUICK LOOKUPS
        // =================================================

        const sharesByExpense = {};
        const paymentsByExpense = {};


        // =================================================
        // ORGANIZE SHARES BY EXPENSE
        // =================================================

        for (const row of sharesResult.rows) {

            const expenseId = Number(row.expense_id);

            if (!sharesByExpense[expenseId]) {
                sharesByExpense[expenseId] = {};
            }

            if (!sharesByExpense[expenseId][row.user_id]) {
                sharesByExpense[expenseId][row.user_id] = 0;
            }

            sharesByExpense[expenseId][row.user_id] =
                Number(
                    (
                        sharesByExpense[expenseId][row.user_id] +
                        Number(row.amount)
                    ).toFixed(2)
                );
        }


        // =================================================
        // ORGANIZE PAYMENTS BY EXPENSE
        // =================================================

        for (const row of payerResult.rows) {

            const expenseId = Number(row.expense_id);

            if (!paymentsByExpense[expenseId]) {
                paymentsByExpense[expenseId] = {};
            }

            if (!paymentsByExpense[expenseId][row.user_id]) {
                paymentsByExpense[expenseId][row.user_id] = 0;
            }

            paymentsByExpense[expenseId][row.user_id] =
                Number(
                    (
                        paymentsByExpense[expenseId][row.user_id] +
                        Number(row.amount)
                    ).toFixed(2)
                );
        }


        // =================================================
        // CALCULATE EACH EXPENSE SEPARATELY
        // =================================================

        const settlements = [];
        const groupBalances = {};


        for (const expense of expenseResult.rows) {

            const expenseId = Number(expense.id);


            // ---------------------------------------------
            // SKIP ALREADY SETTLED EXPENSE
            // ---------------------------------------------

            if (settledExpenses.has(expenseId)) {
                continue;
            }


            const shares =
                sharesByExpense[expenseId] || {};

            const payments =
                paymentsByExpense[expenseId] || {};


            // ---------------------------------------------
            // CALCULATE BALANCE FOR THIS EXPENSE
            // ---------------------------------------------

            const balances =
                calculateBalances(
                    shares,
                    payments
                );


            // ---------------------------------------------
            // STORE GROUP-LEVEL BALANCES
            // ---------------------------------------------

            for (const userId in balances) {

                if (!groupBalances[userId]) {
                    groupBalances[userId] = 0;
                }

                groupBalances[userId] =
                    Number(
                        (
                            groupBalances[userId] +
                            Number(balances[userId])
                        ).toFixed(2)
                    );
            }


            // ---------------------------------------------
            // CALCULATE SETTLEMENTS FOR THIS EXPENSE
            // ---------------------------------------------

            const expenseSettlements =
                calculateSettlements(balances);


            // ---------------------------------------------
            // ADD EXPENSE INFORMATION
            // ---------------------------------------------

            for (const settlement of expenseSettlements) {

                settlements.push({

                    // Expense information
                    expenseId,

                    expenseDescription:
                        expense.description,

                    expenseTotal:
                        Number(expense.total),

                    // Settlement information
                    from:
                        Number(settlement.from),

                    to:
                        Number(settlement.to),

                    amount:
                        Number(
                            settlement.amount
                        ),

                    // User names
                    fromName:
                        users[settlement.from] ||
                        `User ${settlement.from}`,

                    toName:
                        users[settlement.to] ||
                        `User ${settlement.to}`,
                });
            }
        }


        // =================================================
        // RESPONSE
        // =================================================

        res.status(200).json({

            groupId,

            balances:
                groupBalances,

            settlements,
        });

    } catch (error) {

        console.error(
            "Settlement error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to calculate settlements",

            error:
                error.message,
        });
    }
};


// =====================================================
// MARK ONE EXPENSE SETTLEMENT
// =====================================================

const markExpenseSettlement = async (req, res) => {

    console.log(
        "========== MARK EXPENSE SETTLED =========="
    );

    try {

        const {
            groupId,
            expenseId,
        } = req.params;

        const userId = req.user.id;


        console.log(
            "GROUP ID:",
            groupId
        );

        console.log(
            "EXPENSE ID:",
            expenseId
        );

        console.log(
            "USER ID:",
            userId
        );


        // =================================================
        // CHECK MEMBERSHIP
        // =================================================

        const memberCheck = await pool.query(
            `SELECT id
             FROM group_members
             WHERE group_id = $1
               AND user_id = $2`,
            [
                groupId,
                userId,
            ]
        );

        if (memberCheck.rows.length === 0) {

            return res.status(403).json({
                message:
                    "You are not a member of this group",
            });
        }


        // =================================================
        // GET SPECIFIC EXPENSE
        // =================================================

        const expenseResult = await pool.query(
            `SELECT
                id,
                group_id,
                description,
                total
             FROM expenses
             WHERE id = $1
               AND group_id = $2`,
            [
                expenseId,
                groupId,
            ]
        );

        if (expenseResult.rows.length === 0) {

            return res.status(404).json({
                message:
                    "Expense not found in this group",
            });
        }


        // =================================================
        // CHECK IF ALREADY SETTLED
        // =================================================

        const alreadySettled = await pool.query(
            `SELECT id
             FROM settlements
             WHERE group_id = $1
               AND expense_id = $2
               AND settled = true`,
            [
                groupId,
                expenseId,
            ]
        );

        if (alreadySettled.rows.length > 0) {

            return res.status(400).json({
                message:
                    "This expense is already settled",
            });
        }


        // =================================================
        // GET SHARES FOR THIS EXPENSE
        // =================================================

        const sharesResult = await pool.query(
            `SELECT
                user_id,
                amount
             FROM expense_shares
             WHERE expense_id = $1`,
            [expenseId]
        );


        // =================================================
        // GET PAYMENTS FOR THIS EXPENSE
        // =================================================

        const payerResult = await pool.query(
            `SELECT
                user_id,
                amount
             FROM expense_payers
             WHERE expense_id = $1`,
            [expenseId]
        );

        console.log("========== SETTLEMENT DEBUG ==========");
console.log("GROUP ID:", groupId);
console.log("SHARE ROWS:", sharesResult.rows);
console.log("PAYER ROWS:", payerResult.rows);
console.log("======================================");


        if (sharesResult.rows.length === 0) {

            return res.status(400).json({
                message:
                    "No shares found for this expense",
            });
        }


        if (payerResult.rows.length === 0) {

            return res.status(400).json({
                message:
                    "No payer found for this expense",
            });
        }


        // =================================================
        // BUILD BALANCES
        // =================================================

        const shares = {};
        const payments = {};


        // =================================================
        // SHARES
        // =================================================

        for (const row of sharesResult.rows) {

            if (!shares[row.user_id]) {
                shares[row.user_id] = 0;
            }

            shares[row.user_id] =
                Number(
                    (
                        shares[row.user_id] +
                        Number(row.amount)
                    ).toFixed(2)
                );
        }


        // =================================================
        // PAYMENTS
        // =================================================

        for (const row of payerResult.rows) {

            if (!payments[row.user_id]) {
                payments[row.user_id] = 0;
            }

            payments[row.user_id] =
                Number(
                    (
                        payments[row.user_id] +
                        Number(row.amount)
                    ).toFixed(2)
                );
        }


        // =================================================
        // CALCULATE BALANCES
        // =================================================

        const balances =
            calculateBalances(
                shares,
                payments
            );


        console.log(
            "EXPENSE BALANCES:",
            balances
        );


        // =================================================
        // CALCULATE SETTLEMENTS
        // =================================================

        const calculatedSettlements =
            calculateSettlements(
                balances
            );


        console.log(
            "EXPENSE SETTLEMENTS:",
            calculatedSettlements
        );


        if (calculatedSettlements.length === 0) {

            return res.status(400).json({
                message:
                    "This expense does not require a settlement",
            });
        }


        // =================================================
        // INSERT SETTLEMENT RECORDS
        // =================================================

        let inserted = 0;


        for (
            const settlement
            of calculatedSettlements
        ) {

            const payerId =
                Number(settlement.from);

            const receiverId =
                Number(settlement.to);

            const amount =
                Number(settlement.amount);


            // ---------------------------------------------
            // CHECK DUPLICATE
            // ---------------------------------------------

            const existing = await pool.query(
                `SELECT id
                 FROM settlements
                 WHERE group_id = $1
                   AND expense_id = $2
                   AND payer_id = $3
                   AND receiver_id = $4
                   AND amount = $5
                   AND settled = true`,
                [
                    groupId,
                    expenseId,
                    payerId,
                    receiverId,
                    amount,
                ]
            );


            if (existing.rows.length > 0) {
                continue;
            }


            // ---------------------------------------------
            // INSERT
            // ---------------------------------------------

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
                VALUES
                ($1, $2, $3, $4, true, $5)`,
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


        // =================================================
        // RESPONSE
        // =================================================

        console.log(
            "INSERTED:",
            inserted
        );


        res.status(200).json({

            message:
                "Expense settlement marked as settled",

            expenseId:
                Number(expenseId),

            updated:
                inserted,
        });


    } catch (error) {

        console.error(
            "Mark expense settlement error:",
            error
        );

        res.status(500).json({

            message:
                "Failed to mark expense settlement",

            error:
                error.message,
        });
    }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
    getGroupSettlements,
    markExpenseSettlement,
};