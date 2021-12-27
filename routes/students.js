'use-strict'

var express = require('express');
var StudentController = require('../controllers/students');
var md_auth = require('../middlewares/autenticated');

var api = express.Router();

var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './uploads/students'});

api.get('/probando-student', StudentController.pruebaStudent);
api.post('/students/:page?',StudentController.getStudents);
api.post('/addStudent',StudentController.saveStudent);
api.post('/getStudentByID',StudentController.getStudentByID);
api.post('/getStudentByName',StudentController.getStudentByName);
api.post('/upload-image-student/:id', [md_upload], StudentController.uploadImage);
api.get('/get-image-student/:imageFile', StudentController.getImageFile);

module.exports = api;