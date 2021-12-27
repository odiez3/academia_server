'use-strict'

var express = require('express');
var pruebaController = require('../controllers/prueba');
var api = express.Router();


api.post('/pdf',pruebaController.makePdf);

module.exports = api;