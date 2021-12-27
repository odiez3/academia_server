'use-strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AssistanceSchema = Schema({
    date: Date,
    created: Date,
	student: {type: Schema.ObjectId, ref: 'Student'}
});

module.exports = mongoose.model('Asistance', AssistanceSchema);