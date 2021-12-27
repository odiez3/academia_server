'use-strict'

var express = require('express');
var ExtraController = require('../controllers/extras');
var api = express.Router();


api.post('/addExtra',ExtraController.addExtra);
api.post('/getExtras',ExtraController.getExtrasByStudend);
api.post('/cancelExtra',ExtraController.cancelExtra);
module.exports = api;