'use-strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StudentSchema = Schema({
    consecutivo: Number,
	name: String,
    image: String,
    tel: String,
    emergency: String,
    birthday:String,
    priceLesson: Number,
    debtLimit: Number,
    observations: String,
    methodPayment: Number,
    nameUpper: String
});

module.exports = mongoose.model('Student', StudentSchema);