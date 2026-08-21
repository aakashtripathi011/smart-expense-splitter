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


const calculateEqualSplitForUsers = (total, users) => {
    if (users.length === 0) {
        throw new Error("At least one user is required");
    }

    if (total < 0) {
        throw new Error("Total cannot be negative");
    }

    const amountPerPerson = Number(
        (total / users.length).toFixed(2)
    );

    return users.map((user) => ({
        userId: user.id,
        amount: amountPerPerson,
    }));
};

const calculateItemSplit = (items) => {
    const userTotals = {};

    for (const item of items) {
        if (!item.users || item.users.length === 0) {
            throw new Error(`No users assigned to ${item.name}`);
        }

        const share = Number(
            (item.price / item.users.length).toFixed(2)
        );

        for (const userId of item.users) {
            if (!userTotals[userId]) {
                userTotals[userId] = 0;
            }

            userTotals[userId] += share;
        }
    }

    return userTotals;
};

const calculateBalances = (shares, payments) => {
    const balances = {};

    // Calculate balance for every user
    for (const userId in shares) {
        const paid = payments[userId] || 0;
        const owed = shares[userId] || 0;

        balances[userId] = Number(
            (paid - owed).toFixed(2)
        );
    }

    return balances;
};

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




module.exports = {
    calculateEqualSplit,
    calculateEqualSplitForUsers,
    calculateItemSplit,
    calculateBalances,
    calculateSettlements,
};