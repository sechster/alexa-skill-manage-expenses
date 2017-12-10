//module.exports = function serviceModule() {

    let dateTimeHelper = require("./dateTimeHelper");
    let googleApiHelper = require("./googleApiHelper");

    let year = dateTimeHelper.getCurrentYear();
    let month = dateTimeHelper.getCurrentMonth();

    function insertExpense(expense) {
        var metadata = googleApiHelper.getSpreadsheetMetadata(year, month);
        googleApiHelper.appendDataToSpreadsheet(metadata, expense);
    }

    let publicAPI = {
        insertExpense: insertExpense
    }
//}

insertExpense({ day: 12, category: "Regular", description: "Test", amount: 100 });