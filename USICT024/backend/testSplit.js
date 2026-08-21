const { calculateSettlements } = require("./services/splitService");

const balances = {
    1: 700,
    2: -400,
    3: -300,
};

const result = calculateSettlements(balances);

console.log(result);