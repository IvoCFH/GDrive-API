var express = require('express');
var router = express.Router();
var listFiles = require('../gdrive').listFiles;
var authorize = require('../gdrive').authorize;
var createFolder = require('../gdrive').createFolder;
require('dotenv').config();


/* GDrive API page */
router.get('/', async function( req, res, next ) {
    authorize()
        .then(listFiles)
        .then( (data) => {
            console.log(data);
            res.render('gdrive-view', {files: data.files})
        })
        .catch(console.error);
});

router.get('/files', async function( req, res, next ) {
    authorize()
        .then(listFiles)
        .then( (data) => {
            console.log(data);
            res.render('gdrive-view', {files: data.files})
        })
        .catch(console.error);
});

router.get('/folders', async function( req, res, next ) {
    authorize()
        .then(listFiles)
        .then( (data) => {
            console.log(data);
            res.render('gdrive-view', {files: data.folders})
        })
        .catch(console.error);
});

router.get('/search', async function( req, res, next ) {
    authorize()
        .then( client => listFiles( client, req.query.name ) )
        .then( (data) => {
            console.log(data);
            res.render('gdrive-view', {files: [...data.files, ...data.folders]})
        })
        .catch(console.error);
});

router.get('/create', async function( req, res, next ) {
    console.log('create')
    authorize()
        .then( client => createFolder(client, req.query.name))
        .then( () => console.log( 'Folder created!' ) )
        .catch(console.error);
    res.render('gdrive-view', {files: []})
});
  
module.exports = router;
  