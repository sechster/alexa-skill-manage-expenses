const google = require('googleapis');
const sheets = google.sheets('v4');
const drive = google.drive('v3');
const oauth2 = google.auth.OAuth2;

module.exports = function googleApiHelper(accessToken) {

    let _auth = authorize(accessToken);

    function appendDataToSpreadsheet(spreadsheetMetadata, expense) {
        return appendDataToSpreadsheetInternal(_auth, spreadsheetMetadata, expense);
    }

    function getSpreadsheetId(fileName) {
        return getSpreadsheetIdInternal(_auth, fileName);
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

    function authorize(accessToken) {
        let oauthData = require('./access_keys/google_oauth_data.json');
        let oauth2Client = new oauth2(oauthData.web.client_id, oauthData.web.client_secret, oauthData.web.redirect_uris[0]);
        oauth2Client.credentials = { access_token: accessToken };
        return oauth2Client;
    }

    return {
        appendDataToSpreadsheet: appendDataToSpreadsheet,
        getSpreadsheetId: getSpreadsheetId
    }
}
