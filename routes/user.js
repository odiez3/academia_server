'use-strict'

var express = require('express');
var UserController = require('../controllers/user');
var md_auth = require('../middlewares/autenticated');

var api = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/users'});

api.get('/probando-controlador', md_auth.ensureAuth ,UserController.pruebas);

api.get('/getUsersApp',UserController.getUsers);

api.post('/register',UserController.saveUser);

api.post('/login',UserController.loginUser);

api.post('/update-user/:id', UserController.updateUser);

api.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);

api.get('/get-image-user/:imageFile', UserController.getImageFile);


module.exports = api;