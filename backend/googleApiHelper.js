const google = require('googleapis');
const sheets = google.sheets('v4');
const drive = google.drive('v3');

module.exports = function googleApiHelper(accessToken) {

    this.accessToken = accessToken;

    function appendDataToSpreadsheet(spreadsheetMetadata, expense) {
        return authorize()
            .then(
                function (auth) { return appendDataToSpreadsheetInternal(auth, spreadsheetMetadata, expense); },
                function (err) { console.log(`Authorize in appendDataToSpreadsheet has failed: ${err}`); });
    }

    function getSpreadsheetId(fileName) {
        return authorize()
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

    function authorize() {
        var oauthData = require('./access_keys/google_oauth_data.json');
        var oauth2Client = new auth.OAuth2(oauthData.client_id, oauthData.client_secret, oauthData.redirect_uris[0]);

        return new Promise((resolve, reject) => {
                oauth2Client.setCredentials({access_token: accessToken});
                resolve(oauth2Client);
            });
    }
}
