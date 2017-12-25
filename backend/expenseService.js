const GoogleApiHelper = require("./googleApiHelper");

module.exports.insertExpense = function insertExpense(expense) {

        return GoogleApiHelper.getSpreadsheetId(expense.year)
            .then( 
                function(fileId) { return { spreadsheetFileId: fileId, sheetName: ("0" + expense.month).substr(-2) }; },
                function (err) { console.log(`GetSpreadsheetId has failed: ${err}`); })
            .then( function(metadata) { 
                return GoogleApiHelper.appendDataToSpreadsheet(metadata, expense); 
                // console.log(metadata.sheetName);
                // console.log(metadata.spreadsheetFileId);
                // console.log(expense.category);
                // console.log(expense.day);
                // console.log(expense.month);
                // console.log(expense.year);
                },
                function (err) { console.log(`AppendDataToSpreadsheet has failed: ${err}`); });
}