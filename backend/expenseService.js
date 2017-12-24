const GoogleApiHelper = require("./googleApiHelper");

module.exports.insertExpense = function insertExpense(expense) {

        return GoogleApiHelper.getSpreadsheetId(expense.year)
            .then( function(fileId) { return { spreadsheetFileId: fileId, sheetName: ("0" + expense.month).substr(-2) }; })
            .then( function(metadata) { GoogleApiHelper.appendDataToSpreadsheet(metadata, expense); });
}