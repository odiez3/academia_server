'use-strict'

var express = require('express');
var AssisController = require('../controllers/assitance');
var md_auth = require('../middlewares/autenticated');
var api = express.Router();


api.post('/addAssistance',AssisController.saveAssistanceClase);
api.post('/addAsistencia',AssisController.addAsistance);
api.post('/getAssitancesByID',AssisController.getAssitancesByID);
api.post('/dummyAssistance',AssisController.saveAssistanceClase);
module.exports = api;