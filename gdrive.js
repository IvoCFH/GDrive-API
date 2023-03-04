const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');
const { drive } = require('googleapis/build/src/apis/drive');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/drive.metadata.readonly',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.resource',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.appfolder',
    'https://www.googleapis.com/auth/drive'
];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

let viewFiles = [];
let viewFolders = [];

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
} catch (err) {
    return null;
}
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
const content = await fs.readFile(CREDENTIALS_PATH);
const keys = JSON.parse(content);
const key = keys.installed || keys.web;
const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
});
await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
let client = await loadSavedCredentialsIfExist();
if (client) {
    return client;
}
client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
});
if (client.credentials) {
    await saveCredentials(client);
}
client = client;
return client;
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
async function listFiles(authClient, fileName) {
    const drive = google.drive({version: 'v3', auth: authClient});
    const pageSize = 10;
    const fields = 'nextPageToken, files(id, name)'
    const folderMimeType = 'mimeType = "application/vnd.google-apps.folder"'
    const name = `name contains "${fileName}"`

    filesOptions = {};
    foldersOptions = {};

    if ( !fileName || fileName === '' ) {
        filesOptions = {
            pageSize: pageSize,
            field: fields
        }

        foldersOptions = {
            pageSize: pageSize,
            field: fields,
            q: folderMimeType
        }
    }
    else {
        filesOptions = {
            pageSize: pageSize,
            field: fields,
            q: name
        }

        foldersOptions = {
            pageSize: pageSize,
            field: fields,
            q: folderMimeType + ' and ' + name
        }
    }

    console.log(filesOptions);
    console.log(foldersOptions);

    const filesReq = await drive.files.list(filesOptions);
    viewFiles = filesReq.data.files.map( file => `${file.name} (${file.id})` );
    
    const foldersReq = await drive.files.list(foldersOptions);
    viewFolders = foldersReq.data.files.map( folder => `${folder.name} (${folder.id})` );
    
    return { files: viewFiles, folders: viewFolders }
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {OAuth2Client} authClient An authorized OAuth2 client.
 */
const createFolder = async (authClient, name) => {
    const drive = google.drive({version: 'v3', auth: authClient});
    const fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
    };
    try {
        const folderCreated = await drive.files.create({
            resource: fileMetadata,
            fields: 'id',
        })
        console.log('Folder Id:', folderCreated.data.id);
        return folderCreated.data.id;
    } 
    catch (err) {
        // TODO(developer) - Handle error
        throw err;
    }
}

module.exports = {
    authorize,
    listFiles,
    createFolder,
    viewFiles,
    viewFolders
}