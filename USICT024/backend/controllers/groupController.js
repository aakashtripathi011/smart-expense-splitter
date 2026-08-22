const pool = require("../config/db");

function generateGroupCode() {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}

const createGroup = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name) {
      return res.status(400).json({
        message: "Group name is required",
      });
    }

    let code;
    let existingGroup;

    do {
      code = generateGroupCode();

      const result = await pool.query(
        "SELECT id FROM groups WHERE code = $1",
        [code]
      );

      existingGroup = result.rows[0];
    } while (existingGroup);

    const groupResult = await pool.query(
      `INSERT INTO groups (name, code, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, code, userId]
    );

    const group = groupResult.rows[0];

    await pool.query(
      `INSERT INTO group_members (group_id, user_id)
       VALUES ($1, $2)`,
      [group.id, userId]
    );

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("Create group error:", error);

    res.status(500).json({
      message: "Failed to create group",
    });
  }
};

const joinGroup = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({
        message: "Group code is required",
      });
    }

    const groupResult = await pool.query(
      "SELECT * FROM groups WHERE code = $1",
      [code.toUpperCase()]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({
        message: "Group not found",
      });
    }

    const group = groupResult.rows[0];

    const memberResult = await pool.query(
      `SELECT id
       FROM group_members
       WHERE group_id = $1 AND user_id = $2`,
      [group.id, userId]
    );

    if (memberResult.rows.length > 0) {
      return res.status(400).json({
        message: "You are already a member of this group",
      });
    }

    await pool.query(
      `INSERT INTO group_members (group_id, user_id)
       VALUES ($1, $2)`,
      [group.id, userId]
    );

    res.status(200).json({
      message: "Joined group successfully",
      group,
    });
  } catch (error) {
    console.error("Join group error:", error);

    res.status(500).json({
      message: "Failed to join group",
    });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
        g.id,
        g.name,
        g.code,
        g.created_by,
        g.created_at,
        (
          SELECT COUNT(*)
          FROM group_members gm2
          WHERE gm2.group_id = g.id
        ) AS member_count
       FROM groups g
       INNER JOIN group_members gm
         ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY g.created_at DESC`,
      [userId]
    );

    res.status(200).json({
      groups: result.rows,
    });
  } catch (error) {
    console.error("Get groups error:", error);

    res.status(500).json({
      message: "Failed to fetch groups",
    });
  }
};

const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

     console.log("========== GET GROUP MEMBERS ==========");
    console.log("GROUP ID:", groupId);
    console.log("REQ.USER:", req.user);
    console.log("USER ID:", userId);

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

    const result = await pool.query(
      `SELECT
        u.id,
        u.name,
        u.email,
        gm.joined_at
       FROM group_members gm
       INNER JOIN users u
         ON gm.user_id = u.id
       WHERE gm.group_id = $1
       ORDER BY gm.joined_at`,
      [groupId]
    );

    res.status(200).json({
      members: result.rows,
    });
  } catch (error) {
    console.error("Get members error:", error);

    res.status(500).json({
      message: "Failed to fetch group members",
    });
  }
};


// =====================================
// DELETE GROUP
// =====================================

const deleteGroup = async (req, res) => {
  const client = await pool.connect();

  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    await client.query("BEGIN");

    // Only the group creator can delete the group
    const groupResult = await client.query(
      `SELECT id
       FROM groups
       WHERE id = $1 AND created_by = $2`,
      [groupId, userId]
    );

    if (groupResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "Only the group creator can delete this group",
      });
    }

    // Get all expenses in this group
    const expenseResult = await client.query(
      `SELECT id
       FROM expenses
       WHERE group_id = $1`,
      [groupId]
    );

    const expenseIds = expenseResult.rows.map(
      (row) => row.id
    );

    // Delete settlements connected to these expenses
    if (expenseIds.length > 0) {
      await client.query(
        `DELETE FROM settlements
         WHERE expense_id = ANY($1::int[])`,
        [expenseIds]
      );

      // Delete expense shares
      await client.query(
        `DELETE FROM expense_shares
         WHERE expense_id = ANY($1::int[])`,
        [expenseIds]
      );

      // Delete expenses
      await client.query(
        `DELETE FROM expenses
         WHERE id = ANY($1::int[])`,
        [expenseIds]
      );
    }

    // Delete group members
    await client.query(
      `DELETE FROM group_members
       WHERE group_id = $1`,
      [groupId]
    );

    // Delete group
    await client.query(
      `DELETE FROM groups
       WHERE id = $1`,
      [groupId]
    );

    await client.query("COMMIT");

    res.status(200).json({
      message: "Group deleted successfully",
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Delete group error:", error);

    res.status(500).json({
      message: "Failed to delete group",
      error: error.message,
    });

  } finally {
    client.release();
  }
};


module.exports = {
  createGroup,
  joinGroup,
  getMyGroups,
  getGroupMembers,
  deleteGroup,
};