const googleApiHelper = require("./googleApiHelper");

module.exports.insertExpense = function insertExpense(expense, accessToken) {

        return GoogleApiHelper.getSpreadsheetId(expense.year)
            .then( 
                function(fileId) { return { spreadsheetFileId: fileId, sheetName: ("0" + expense.month).substr(-2) }; },
                function (err) { console.log(`GetSpreadsheetId has failed: ${err}`); })
            .then( function(metadata) { 
                    return GoogleApiHelper.appendDataToSpreadsheet(metadata, expense); 
                },
                function (err) { console.log(`AppendDataToSpreadsheet has failed: ${err}`); });
}