const pool = require("../config/db");

// Get settlements for an expense
const getSettlementsByExpense = async (expenseId) => {
  const result = await pool.query(
    `
    SELECT
      s.id,
      s.expense_id,
      s.payer_id AS "from",
      s.receiver_id AS "to",
      s.amount,
      s.settled,
      s.created_at,
      payer.name AS "fromName",
      receiver.name AS "toName"
    FROM settlements s
    JOIN users payer
      ON s.payer_id = payer.id
    JOIN users receiver
      ON s.receiver_id = receiver.id
    WHERE s.expense_id = $1
    ORDER BY s.created_at ASC
    `,
    [expenseId]
  );

  return result.rows;
};


// Mark settlement as settled
const markSettlementAsSettled = async (settlementId) => {
  const result = await pool.query(
    `
    UPDATE settlements
    SET settled = true
    WHERE id = $1
    RETURNING *
    `,
    [settlementId]
  );

  return result.rows[0];
};


module.exports = {
  getSettlementsByExpense,
  markSettlementAsSettled,
};