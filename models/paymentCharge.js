'use-strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PayChargeSchema = Schema({
    date: Date, //Fecha en que se hizo el pago o cobro
    month: Number, // El mes a pagar
    year: Number, //El año del mes a pagar
    charge:Number, //El monto del Cargo
    payment:Number, //El monto del pago
    isLesson:Boolean, //Si es un cobro por clase 
    assistence: Date, //Fecha de asistencia
    assisted:Boolean,
    ticketId:String,
    paidOut:Boolean, // Si se encuentra pagada esta clase es true
    isMonthly:Boolean, //Si esta en true es porque pertenece a un pago mensual
    isPayment:Boolean, //Si esta en true es porque pertecene a un extra
    concept : {type: Schema.ObjectId, ref:'Extra'}, //El concepto por el cual es el cargo
    student: {type: Schema.ObjectId, ref: 'Student'}, //El consecutivo del estudiante
    isWeekend:Boolean //Si es cobro por fin de seman
});

module.exports = mongoose.model('PaymentCharge', PayChargeSchema);