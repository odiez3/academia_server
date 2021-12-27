'use-strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ExtraSchema = Schema({
    date: Date,
    amount:Number,
    remaining: Number,
    concept:String,
    finished:Boolean,
    canceled: Boolean,
	student: {type: Schema.ObjectId, ref: 'Student'}
});

module.exports = mongoose.model('Extra', ExtraSchema);