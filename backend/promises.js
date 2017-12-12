function appendDataToSpreadsheet(spreadsheetMetadata, expense) {
    authorize('appendDataToSpreadsheet')
        .then(function (auth) { appendDataToSpreadsheetInternal(auth, spreadsheetMetadata, expense); });
}

function appendDataToSpreadsheetInternal(auth, spreadsheetMetadata, expense) {

}

function getSpreadsheetMetadata(year, month) {
    return authorize('getSpreadsheetMetadata')
        .then(function (auth) { return getSpreadsheetMetadataInternal(auth, 'expense', 'month'); });
}

function getSpreadsheetMetadataInternal(auth, year, month) {
    console.log(auth);
    return 'xxx';
}

function authorize(realm)
{
    return new Promise((resolve, reject) => {
        resolve("token " + realm);
    });
}

getSpreadsheetMetadata('year', 'month').then(function(input) { console.log(input) });
