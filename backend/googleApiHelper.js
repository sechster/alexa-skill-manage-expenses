module.exports = (function googleApiHelperModule() {

    var google = require('googleapis');
    var sheets = google.sheets('v4');
    var drive = google.drive('v3');

    function appendDataToSpreadsheet(spreadsheetMetadata, expense) {
        authorize('https://www.googleapis.com/auth/spreadsheets')
            .then(function (auth) { appendDataToSpreadsheetInternal(auth, spreadsheetMetadata, expense); });
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
        
        sheets.spreadsheets.values.append(request, function(err, response) {
            if (err) {
                console.error(err);
                return;
            }
        
            console.log(JSON.stringify(response, null, 2));
        });
    }

    function getSpreadsheetMetadata(year, month) {
        return authorize('https://www.googleapis.com/auth/drive.readonly')
            .then(function (auth) { return getSpreadsheetMetadataInternal(auth, year, month); })
    }

    function getSpreadsheetMetadataInternal(auth, year, month) {
        return new Promise((resolve, reject) => {
            drive.files.list({
                auth: auth,
                includeRemoved: false,
                fields: 'nextPageToken, files(id, name)',
                q: `name contains 'Expenses ${year}'`
            }, function (err, response) {
                if (!err) {
                    var files = response.files;
                    let fileId = null;
                    for (let i=0; i<files.length; i++) {
                        fileId = files[i].id;
                        console.log(files[i]);
                        break;
                    }
                    resolve({ spreadsheetFileId: fileId, sheetName: ("0" + month).substr(-2) })
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

    let publicApi = {
        appendDataToSpreadsheet: appendDataToSpreadsheet,
        getSpreadsheetMetadata: getSpreadsheetMetadata
    }

    return publicApi;

})();