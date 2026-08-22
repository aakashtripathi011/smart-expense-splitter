const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// -------------------------
// Signup
// -------------------------

const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const existingUser = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0],
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Signup failed",
            error: error.message,
        });
    }
};

// -------------------------
// Login
// -------------------------

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed",
            error: error.message,
        });
    }
};

// -------------------------
// Delete Account
// -------------------------

const deleteAccount = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.user.id;

        await client.query("BEGIN");

        // 1. Delete settlements involving this user
        await client.query(
            `DELETE FROM settlements
             WHERE payer_id = $1 OR receiver_id = $1`,
            [userId]
        );

        // 2. Delete expense shares of this user
        await client.query(
            `DELETE FROM expense_shares
             WHERE user_id = $1`,
            [userId]
        );

        // 3. Delete expenses created by this user
        //    First delete their settlements/shares
        const expenses = await client.query(
            `SELECT id
             FROM expenses
             WHERE created_by = $1`,
            [userId]
        );

        for (const expense of expenses.rows) {
            await client.query(
                `DELETE FROM settlements
                 WHERE expense_id = $1`,
                [expense.id]
            );

            await client.query(
                `DELETE FROM expense_shares
                 WHERE expense_id = $1`,
                [expense.id]
            );
        }

        await client.query(
            `DELETE FROM expenses
             WHERE created_by = $1`,
            [userId]
        );

        // 4. Delete receipts belonging to this user
        await client.query(
            `DELETE FROM receipts
             WHERE user_id = $1`,
            [userId]
        );

        // 5. Delete user's group memberships
        await client.query(
            `DELETE FROM group_members
             WHERE user_id = $1`,
            [userId]
        );

        // 6. Delete groups created by this user
        //    Delete their remaining members first
        const groups = await client.query(
            `SELECT id
             FROM groups
             WHERE created_by = $1`,
            [userId]
        );

        for (const group of groups.rows) {

            // Delete expenses inside the group
            const groupExpenses = await client.query(
                `SELECT id
                 FROM expenses
                 WHERE group_id = $1`,
                [group.id]
            );

            for (const expense of groupExpenses.rows) {

                await client.query(
                    `DELETE FROM settlements
                     WHERE expense_id = $1`,
                    [expense.id]
                );

                await client.query(
                    `DELETE FROM expense_shares
                     WHERE expense_id = $1`,
                    [expense.id]
                );
            }

            await client.query(
                `DELETE FROM expenses
                 WHERE group_id = $1`,
                [group.id]
            );

            await client.query(
                `DELETE FROM group_members
                 WHERE group_id = $1`,
                [group.id]
            );
        }

        // Delete groups created by user
        await client.query(
            `DELETE FROM groups
             WHERE created_by = $1`,
            [userId]
        );

        // 7. Finally delete the user
        await client.query(
            `DELETE FROM users
             WHERE id = $1`,
            [userId]
        );

        await client.query("COMMIT");

        res.status(200).json({
            message: "Account deleted successfully"
        });

    } catch (error) {

        await client.query("ROLLBACK");

        console.error("Delete account error:", error);

        res.status(500).json({
            message: "Failed to delete account",
            error: error.message
        });

    } finally {
        client.release();
    }
};

module.exports = {
    signup,
    login,
    deleteAccount,
};