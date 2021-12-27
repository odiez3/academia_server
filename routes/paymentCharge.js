'use-strict'

var express = require('express');
var PaymentChargeController = require('../controllers/paymentCharge');
var api = express.Router();


api.post('/addPayment',PaymentChargeController.savePayment);
api.post('/getPaymentsCharges',PaymentChargeController.getPaymentCharguesByStudent);
api.post('/getLessonPayments',PaymentChargeController.getOnlyLessonPayments);
api.post('/getExtrasPayments',PaymentChargeController.getOnlyExtrasPayments);
api.post('/getAllPayments',PaymentChargeController.getAllPaymentsCharge);
api.post('/getPaymentsRange',PaymentChargeController.getPaymentsByDateRange);
api.post('/getPaymentsChargesByStudent',PaymentChargeController.getPaymentsDateRangeByStudent);
api.post('/getPaymentsChargesClassByStudent',PaymentChargeController.getPaymentChargeClass);
api.post('/getLessonsNoPaid',PaymentChargeController.getLessonsNoPaid);
api.post('/getAssistances',PaymentChargeController.getAssistances);
api.post('/getTotalDebtLessons',PaymentChargeController.getTotalDebtLessons);
api.post('/payLesson',PaymentChargeController.payLesson);
api.post('/payMonth',PaymentChargeController.payMonth);
api.post('/getAllPaymentsCharges',PaymentChargeController.getAllPaymentsCharges);
api.post('/pdfPaymentsCharges',PaymentChargeController.pdfPaymentsCharges);

module.exports = api;