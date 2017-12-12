// exports.handler = (event, context, callback) => {

//     let category = "Regular";
//     let description = "Groceries";
//     let amount = 10;






//     callback();
// };

//module.exports = function serviceModule() {

    let dateTimeHelper = require("./dateTimeHelper");
    let googleApiHelper = require("./googleApiHelper");

    //let year = dateTimeHelper.getCurrentYear();
    //let month = dateTimeHelper.getCurrentMonth();

    function insertExpense(expense) {
        googleApiHelper.getSpreadsheetMetadata(expense.year, expense.month)
            .then( function(metadata) { googleApiHelper.appendDataToSpreadsheet(metadata, expense); });
    }

    let publicAPI = {
        insertExpense: insertExpense
    }
//}

insertExpense({ day: 12, category: "Regular", description: "Test", amount: 100, year: 2018, month: 12 });