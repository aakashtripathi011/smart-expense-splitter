// =========================
// EQUAL SPLIT
// =========================

const calculateEqualSplit = (total, numberOfPeople) => {
    if (numberOfPeople <= 0) {
        throw new Error("Number of people must be greater than 0");
    }

    if (total < 0) {
        throw new Error("Total cannot be negative");
    }

    const amountPerPerson = Number(
        (Number(total) / numberOfPeople).toFixed(2)
    );

    return {
        total: Number(total),
        numberOfPeople,
        amountPerPerson,
    };
};


// =========================
// EQUAL SPLIT FOR USERS
// =========================

const calculateEqualSplitForUsers = (total, users) => {
    if (!users || users.length === 0) {
        throw new Error("At least one user is required");
    }

    if (total < 0) {
        throw new Error("Total cannot be negative");
    }

    const totalAmount = Number(total);

    const baseAmount = Math.floor(
        (totalAmount / users.length) * 100
    ) / 100;

    const shares = [];

    let assignedTotal = 0;

    users.forEach((user, index) => {

        const userId =
            typeof user === "object"
                ? user.id
                : user;

        if (!userId) {
            throw new Error("Invalid user ID in equal split");
        }

        let amount = baseAmount;

        // Give rounding remainder to last user
        if (index === users.length - 1) {
            amount = Number(
                (totalAmount - assignedTotal).toFixed(2)
            );
        }

        amount = Number(amount.toFixed(2));

        assignedTotal = Number(
            (assignedTotal + amount).toFixed(2)
        );

        shares.push({
            userId: Number(userId),
            amount,
        });
    });

    return shares;
};


// =========================
// ITEM-WISE SPLIT
// =========================

const calculateItemSplit = (items) => {

    const userTotals = {};

    if (!items || items.length === 0) {
        throw new Error("At least one item is required");
    }

    for (const item of items) {

        let assignedUsers = [];

        if (Array.isArray(item.users)) {
            assignedUsers = item.users;
        } else if (item.userId) {
            assignedUsers = [item.userId];
        }

        if (assignedUsers.length === 0) {
            throw new Error(
                `No users assigned to ${item.name}`
            );
        }

        const price = Number(item.price);

        if (Number.isNaN(price) || price < 0) {
            throw new Error(
                `Invalid price for ${item.name}`
            );
        }

        const baseShare =
            Math.floor(
                (price / assignedUsers.length) * 100
            ) / 100;

        let assignedTotal = 0;

        assignedUsers.forEach((user, index) => {

            const userId =
                typeof user === "object"
                    ? user.id
                    : user;

            if (!userId) {
                throw new Error(
                    `Invalid user assigned to ${item.name}`
                );
            }

            let share = baseShare;

            // Give rounding remainder to last user
            if (index === assignedUsers.length - 1) {
                share = Number(
                    (price - assignedTotal).toFixed(2)
                );
            }

            share = Number(share.toFixed(2));

            assignedTotal = Number(
                (assignedTotal + share).toFixed(2)
            );

            if (!userTotals[userId]) {
                userTotals[userId] = 0;
            }

            userTotals[userId] = Number(
                (userTotals[userId] + share).toFixed(2)
            );
        });
    }

    return userTotals;
};


// =========================
// CALCULATE BALANCES
// =========================

const calculateBalances = (shares, payments) => {

    const balances = {};

    // Include EVERY user who either paid OR owes
    const userIds = new Set([
        ...Object.keys(shares || {}),
        ...Object.keys(payments || {}),
    ]);

    for (const userId of userIds) {

        const paid = Number(
            payments[userId] || 0
        );

        const owed = Number(
            shares[userId] || 0
        );

        balances[userId] = Number(
            (paid - owed).toFixed(2)
        );
    }

    return balances;
};


// =========================
// CALCULATE SETTLEMENTS
// =========================

const calculateSettlements = (balances) => {

    const creditors = [];
    const debtors = [];

    for (const userId in balances) {

        const balance = Number(
            balances[userId]
        );

        if (balance > 0.01) {

            creditors.push({
                userId: String(userId),
                amount: Number(
                    balance.toFixed(2)
                ),
            });

        } else if (balance < -0.01) {

            debtors.push({
                userId: String(userId),
                amount: Number(
                    Math.abs(balance).toFixed(2)
                ),
            });
        }
    }

    const settlements = [];

    let creditorIndex = 0;
    let debtorIndex = 0;

    while (
        creditorIndex < creditors.length &&
        debtorIndex < debtors.length
    ) {

        const creditor =
            creditors[creditorIndex];

        const debtor =
            debtors[debtorIndex];

        const amount = Number(
            Math.min(
                creditor.amount,
                debtor.amount
            ).toFixed(2)
        );

        if (amount <= 0) {
            break;
        }

        settlements.push({
            from: Number(debtor.userId),
            to: Number(creditor.userId),
            amount,
        });

        creditor.amount = Number(
            (creditor.amount - amount).toFixed(2)
        );

        debtor.amount = Number(
            (debtor.amount - amount).toFixed(2)
        );

        if (Math.abs(creditor.amount) < 0.01) {
            creditor.amount = 0;
            creditorIndex++;
        }

        if (Math.abs(debtor.amount) < 0.01) {
            debtor.amount = 0;
            debtorIndex++;
        }
    }

    return settlements;
};


// =========================
// EXPORTS
// =========================

module.exports = {
    calculateEqualSplit,
    calculateEqualSplitForUsers,
    calculateItemSplit,
    calculateBalances,
    calculateSettlements,
};