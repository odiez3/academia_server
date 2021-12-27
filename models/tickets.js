'use-strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TicketSchema = Schema({
    date: Date,
    concepts:String,
    totals: String,
	student: {type: Schema.ObjectId, ref: 'Student'}
});

module.exports = mongoose.model('Tickets', TicketSchema);