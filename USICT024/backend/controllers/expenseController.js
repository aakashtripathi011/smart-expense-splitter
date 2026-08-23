const pool = require("../config/db");

const {
    calculateEqualSplitForUsers,
    calculateItemSplit,
} = require("../services/splitService");


// =====================================================
// CREATE EXPENSE
// =====================================================

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
            paymentAmount,
        } = req.body;

        const createdBy = req.user.id;

          console.log("CREATE EXPENSE BODY:", req.body);
console.log("PAYER ID:", payerId);
console.log("PAYMENT AMOUNT:", paymentAmount);

        // =================================================
        // BASIC VALIDATION
        // =================================================

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

        if (!payerId) {
            return res.status(400).json({
                message: "Please select who paid",
            });
        }

        if (
            paymentAmount === undefined ||
            Number(paymentAmount) <= 0
        ) {
            return res.status(400).json({
                message:
                    "Please enter the amount paid",
            });
        }

        if (
            Number(paymentAmount) >
            Number(amount)
        ) {
            return res.status(400).json({
                message:
                    "Payment cannot be greater than the total",
            });
        }


        // =================================================
        // CHECK GROUP
        // =================================================

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


        // =================================================
        // CHECK ADMIN
        // =================================================

        if (
            Number(groupCheck.rows[0].created_by) !==
            Number(createdBy)
        ) {
            return res.status(403).json({
                message:
                    "Only the group admin can create expenses",
            });
        }


        // =================================================
        // CHECK PAYER IS GROUP MEMBER
        // =================================================

        const payerCheck = await pool.query(
            `SELECT id
             FROM group_members
             WHERE group_id = $1
               AND user_id = $2`,
            [
                groupId,
                payerId,
            ]
        );

        if (payerCheck.rows.length === 0) {
            return res.status(400).json({
                message:
                    "Selected payer is not a member of this group",
            });
        }


        // =================================================
        // CREATE EXPENSE
        // =================================================

        const expenseResult = await pool.query(
            `INSERT INTO expenses
                (group_id, created_by, total, description)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                groupId,
                createdBy,
                Number(amount),
                description.trim(),
            ]
        );

        const expense =
            expenseResult.rows[0];


        // =================================================
        // CALCULATE SHARES
        // =================================================

        let shares = {};


        // =================================================
        // EQUAL SPLIT
        // =================================================

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

            const result =
                calculateEqualSplitForUsers(
                    Number(amount),
                    users
                );

            for (const share of result) {

                shares[share.userId] =
                    Number(share.amount);
            }
        }


        // =================================================
        // ITEM-WISE SPLIT
        // =================================================

        else if (splitType === "item") {

            if (
                !Array.isArray(items) ||
                items.length === 0
            ) {
                return res.status(400).json({
                    message:
                        "Items are required for item-wise split",
                });
            }


            // ---------------------------------------------
            // Calculate each user's item share
            // ---------------------------------------------

            for (const item of items) {

                if (
                    !Array.isArray(item.users) ||
                    item.users.length === 0
                ) {
                    return res.status(400).json({
                        message:
                            `Please assign "${item.name}" to someone`,
                    });
                }


                const itemPrice =
                    Number(item.price);

                if (
                    !Number.isFinite(itemPrice) ||
                    itemPrice <= 0
                ) {
                    return res.status(400).json({
                        message:
                            `Invalid price for ${item.name}`,
                    });
                }


                const individualShare =
                    itemPrice /
                    item.users.length;


                for (
                    const userId of item.users
                ) {

                    if (!shares[userId]) {
                        shares[userId] = 0;
                    }

                    shares[userId] +=
                        individualShare;
                }
            }


            // ---------------------------------------------
            // Round shares
            // ---------------------------------------------

            for (const userId in shares) {

                shares[userId] =
                    Number(
                        shares[userId].toFixed(2)
                    );
            }


            // ---------------------------------------------
            // Handle tax / extra charges
            // ---------------------------------------------

            const itemSubtotal =
                Object.values(shares).reduce(
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


            const actualTotal =
                Number(amount);


            // If receipt total is larger
            // than item subtotal,
            // distribute extra charges proportionally.

            if (
                Math.abs(
                    actualTotal -
                    itemSubtotal
                ) > 0.01
            ) {

                const adjustedShares = {};

                for (
                    const userId in shares
                ) {

                    const proportion =
                        shares[userId] /
                        itemSubtotal;

                    adjustedShares[userId] =
                        Number(
                            (
                                actualTotal *
                                proportion
                            ).toFixed(2)
                        );
                }

                shares =
                    adjustedShares;
            }


            // ---------------------------------------------
            // Fix rounding
            // ---------------------------------------------

            const calculatedTotal =
                Object.values(shares).reduce(
                    (sum, value) =>
                        sum + Number(value),
                    0
                );

            const difference =
                Number(
                    (
                        actualTotal -
                        calculatedTotal
                    ).toFixed(2)
                );


            if (
                Math.abs(difference) >=
                0.01
            ) {

                const firstUserId =
                    Object.keys(shares)[0];

                shares[firstUserId] =
                    Number(
                        (
                            shares[firstUserId] +
                            difference
                        ).toFixed(2)
                    );
            }
        }


        // =================================================
        // INVALID SPLIT
        // =================================================

        else {

            return res.status(400).json({
                message:
                    "Invalid split type",
            });
        }


        // =================================================
        // SAVE SHARES
        // =================================================

        for (
            const userId in shares
        ) {

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

        await pool.query(
    `INSERT INTO expense_payers
        (expense_id, user_id, amount)
     VALUES ($1, $2, $3)`,
    [
        expense.id,
        payerId,
        Number(paymentAmount),
    ]
);


        // =================================================
        // RESPONSE
        // =================================================

        res.status(201).json({

            message:
                "Expense created successfully",

            expense,

            payerId:
                Number(payerId),

            paymentAmount:
                Number(paymentAmount),

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


// =====================================================
// GET GROUP BALANCES
// =====================================================

const getGroupBalances = async (
    req,
    res
) => {

    try {

        const { groupId } =
            req.params;


        // =================================================
        // GET EXPENSES
        // =================================================

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


        // =================================================
        // GET SHARES
        // =================================================

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


        // =================================================
        // OWED
        // =================================================

        for (
            const row of shareResult.rows
        ) {

            if (
                !shares[row.user_id]
            ) {
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
        // PAID
        //
        // IMPORTANT:
        //
        // We cannot use created_by here.
        // created_by = person who created expense.
        //
        // We need the actual payer.
        //
        // For now this endpoint will use
        // expense_payers table if it exists.
        // =================================================

        let payerResult;

        try {

            payerResult =
                await pool.query(
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

        } catch (error) {

            // If table does not exist yet,
            // don't crash the whole API.

            console.log(
                "expense_payers table not found yet"
            );

            payerResult = {
                rows: [],
            };
        }


        // =================================================
        // CALCULATE PAYMENTS
        // =================================================

        for (
            const row of payerResult.rows
        ) {

            if (
                !payments[row.user_id]
            ) {
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
        // BALANCES
        // =================================================

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
                        paid - owed
                    ).toFixed(2)
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

            message:
                "Failed to calculate balances",

            error:
                error.message,

        });
    }
};


// =====================================================
// GET GROUP EXPENSES
// =====================================================

const getGroupExpenses = async (
    req,
    res
) => {

    try {

        const { groupId } =
            req.params;

        const userId =
            req.user.id;


        // =================================================
        // CHECK MEMBERSHIP
        // =================================================

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


        // =================================================
        // GET EXPENSES
        // =================================================

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


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

    createExpense,

    getGroupBalances,

    getGroupExpenses,

};