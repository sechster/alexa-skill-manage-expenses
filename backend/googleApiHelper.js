const google = require('googleapis');
const sheets = google.sheets('v4');
const drive = google.drive('v3');

module.exports.appendDataToSpreadsheet = function appendDataToSpreadsheet(spreadsheetMetadata, expense) {
    return authorize('https://www.googleapis.com/auth/spreadsheets')
        .then(
            function (auth) { return appendDataToSpreadsheetInternal(auth, spreadsheetMetadata, expense); },
            function (err) { console.log(`Authorize in appendDataToSpreadsheet has failed: ${err}`); });
}

module.exports.getSpreadsheetId = function getSpreadsheetId(fileName) {
    return authorize('https://www.googleapis.com/auth/drive.readonly')
        .then(
            function (auth) { return getSpreadsheetIdInternal(auth, fileName); },
            function (err) { console.log(`Authorize in getSpreadsheetId has failed: ${err}`); })
}

function appendDataToSpreadsheetInternal(auth, spreadsheetMetadata, expense) {
    var request = {
        spreadsheetId: spreadsheetMetadata.spreadsheetFileId,
        range: spreadsheetMetadata.sheetName + '!A1',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        auth: auth,
        resource: {
            values: [[expense.day, expense.category, expense.description, expense.amount]] 
        }
    };

    return new Promise((resolve, reject) => {
        sheets.spreadsheets.values.append(request, function(err, response) {
            if (err) {
                reject(err);
            }

            console.log(JSON.stringify(response, null, 2));
            resolve();
        });
    });
}

function getSpreadsheetIdInternal(auth, fileName) {
    return new Promise((resolve, reject) => {
        drive.files.list({
            auth: auth,
            includeRemoved: false,
            fields: 'files(id)',
            q: `name contains '${fileName}'`
        }, function (err, response) {
            if (!err) {
                resolve(response.files[0].id)
            } else {
                console.log('getSpreadsheetMetadataInternal error: ', err);
                reject(err);
            }
        });
    });
}

function authorize(realm) {
    var key = require('./access_keys/google_api_key.json');
    var jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        [realm],
        null
    );

    return new Promise((resolve, reject) => {
        jwtClient.authorize((err, tokens) => {
            if (err) {
                return reject(err);
            }
            resolve(jwtClient);
        });
    });
}
