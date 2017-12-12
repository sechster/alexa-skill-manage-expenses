module.exports = (function googleApiHelperModule() {

    var google = require('googleapis');
    var sheets = google.sheets('v4');
    var drive = google.drive('v3');

    function appendDataToSpreadsheet(expense) {
        authorize(function (auth) { appendDataToSpreadsheetInternal(expense, auth) });
    }

    function appendDataToSpreadsheetInternal(expense, auth) {

        let spreadsheetMetadata = getSpreadsheetMetadataInternal(auth, expense.year, expense.month);

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
        //return { spreadsheetFileId: "1HHVievRz1R4IkPD0o_Kehd0xZdVamv0Q6VWZXjcbshc", sheetName: ("0" + month).substr(-2) };
        let metadata = null;
        authorize(function (auth) { getSpreadsheetMetadataInternal(auth, year, month) });
        return metadata;
    }

    function getSpreadsheetMetadataInternal(auth, year, month) {
        let fileId = null;
        drive.files.list({
            auth: auth,
            includeRemoved: false,
            fields: 'nextPageToken, files(id, name)',
            q: `name = 'Expenses ${year}'`
        }, function (err, response) {
            if (!err) {
                var files = response.files;
                for (let i=0; i<files.length; i++) {
                    fileId = files[i].id;
                    console.log(files[i]);
                }
            } else {
                console.log('getSpreadsheetMetadataInternal error: ', err);
            }
        });

        return { spreadsheetFileId: fileId, sheetName: ("0" + month).substr(-2) };
    }

    function authorize(callback) {
        var key = require('./access_keys/google_api_key.json');
        var jwtClient = new google.auth.JWT(
            key.client_email,
            null,
            key.private_key,
            ['https://www.googleapis.com/auth/drive'],
            null
        );
        
        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.log(err);
                return;
            }
            
            callback(jwtClient);
        });
    }

    let publicApi = {
        appendDataToSpreadsheet: appendDataToSpreadsheet,
        getSpreadsheetMetadata: getSpreadsheetMetadata
    }

    return publicApi;

})();