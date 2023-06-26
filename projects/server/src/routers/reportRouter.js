const reportController = require("../controllers/reportController");
const { readToken } = require("../helper/jwt");
const route = require("express").Router();

route.get("/income", readToken, reportController.getIncomeToday);
route.get("/users", readToken, reportController.getUserPerDay);

route.get("/transaction-chart", readToken, reportController.transactionChart);
route.get(
    "/property-chart/:idProperty",
    readToken,
    reportController.propertyChart
);
route.get("/user-chart", readToken, reportController.userChart);

module.exports = route;
