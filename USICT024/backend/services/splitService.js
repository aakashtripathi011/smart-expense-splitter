const calculateEqualSplit = (total, numberOfPeople) => {
    if (numberOfPeople <= 0) {
        throw new Error("Number of people must be greater than 0");
    }

    if (total < 0) {
        throw new Error("Total cannot be negative");
    }

    const amountPerPerson = total / numberOfPeople;

    return {
        total,
        numberOfPeople,
        amountPerPerson: Number(amountPerPerson.toFixed(2)),
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

    const amountPerPerson = Number(
        (Number(total) / users.length).toFixed(2)
    );

    return users.map((user) => {

        // Frontend currently sends:
        // [1, 2, 3]

        // But also support:
        // [{ id: 1 }, { id: 2 }, { id: 3 }]

        const userId =
            typeof user === "object"
                ? user.id
                : user;

        if (!userId) {
            throw new Error("Invalid user ID in equal split");
        }

        return {
            userId: Number(userId),
            amount: amountPerPerson,
        };
    });
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

        /*
         * Frontend sends:
         *
         * {
         *   name: "Pizza",
         *   price: 450,
         *   userId: 1
         * }
         *
         * Backend originally expected:
         *
         * {
         *   name: "Pizza",
         *   price: 450,
         *   users: [1]
         * }
         *
         * Support both formats.
         */

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

        const share = Number(
            (Number(item.price) / assignedUsers.length).toFixed(2)
        );

        for (const user of assignedUsers) {

            const userId =
                typeof user === "object"
                    ? user.id
                    : user;

            if (!userId) {
                throw new Error(
                    `Invalid user assigned to ${item.name}`
                );
            }

            if (!userTotals[userId]) {
                userTotals[userId] = 0;
            }

            userTotals[userId] = Number(
                (userTotals[userId] + share).toFixed(2)
            );
        }
    }

    return userTotals;
};


// =========================
// CALCULATE BALANCES
// =========================

const calculateBalances = (shares, payments) => {
    const balances = {};

    for (const userId in shares) {
        const paid = payments[userId] || 0;
        const owed = shares[userId] || 0;

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
        const balance = balances[userId];

        if (balance > 0) {
            creditors.push({
                userId,
                amount: balance,
            });
        } else if (balance < 0) {
            debtors.push({
                userId,
                amount: Math.abs(balance),
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
        const creditor = creditors[creditorIndex];
        const debtor = debtors[debtorIndex];

        const amount = Number(
            Math.min(
                creditor.amount,
                debtor.amount
            ).toFixed(2)
        );

        settlements.push({
            from: debtor.userId,
            to: creditor.userId,
            amount,
        });

        creditor.amount = Number(
            (creditor.amount - amount).toFixed(2)
        );

        debtor.amount = Number(
            (debtor.amount - amount).toFixed(2)
        );

        if (creditor.amount === 0) {
            creditorIndex++;
        }

        if (debtor.amount === 0) {
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

