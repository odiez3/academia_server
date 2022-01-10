'use-strict'

var fs = require('fs');
var path = require('path');
var Assistance = require('../models/assistance');
var Student = require('../models/student');
var PaymentCharge = require('../models/paymentCharge');
const moment = require('moment');
var weekendDays = [5, 6, 0];
const ShortId = require('shortid');



async function addAsistance(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(500).send({ message: "Indique el alumno." });
    } else {
        var assistance = new Assistance();
        var dateObj = new Date();
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();

        var currentDay = dateObj.getDay();
        var priceLesson = params.priceLesson;
        var methodPayment = params.methodPayment;

        let dateAssistance = new Date(year + "/" + month + "/" + day);

        assistance.date = dateAssistance;
        assistance.created = new Date();

        //Verifica que el estudiante exista
        Student.findById(params.id, (erro, std) => {
            if (std) {
                assistance.student = params.id;
                //Busca que el alumno no tenga una asistencia del dia en curso
                Assistance.findOne({ student: params.id, date: dateAssistance }, (err, asistance) => {
                    if (asistance) {
                        res.status(405).send({ message: "El alumno ya cuenta con una asistencia el dia de hoy." });
                    } else {
                        var paymentCharge = new PaymentCharge();
                        paymentCharge.date = new Date();
                        paymentCharge.student = params.id;
                        console.log(currentDay);
                        //Identifica si el pago es por fin de semana
                        if (weekendDays.indexOf(currentDay) >= 0) {
                            //Es una clase de fin de semana.
                            priceLesson = params.priceWeekend;
                            paymentCharge.charge = priceLesson;
                            paymentCharge.isLesson = true;
                            paymentCharge.paidOut = false;
                            paymentCharge.isWeekend = true;

                        } else {
                            //identifica si el pago es por clase o mensual.
                            if (methodPayment === 3) {

                            } else {
                                res.status(200).send("Paga por mes");
                            }
                        }

                        paymentCharge.save((error, paymentStored) => {
                            if (error) {
                                console.log(error);
                                res.status(500).send({ message: "No se logro agregar la asistencia al alumno." });
                            } else {
                                console.log(paymentStored);
                                storeAssitance(req, res, assistance, paymentStored);
                            }
                        });
                    }

                });

            } else {
                res.status(404).send({ message: "El estudiante no existe." });
            }
        });
    }

}


function storeAssitance(req, res, assistance, paymentStored) {
    assistance.save((error, assistanceStored) => {
        if (!error) {
            res.status(200).send(assistanceStored);
        } else {
            console.log(error);
            PaymentCharge.findByIdAndDelete(paymentStored._id, (err, paymentDELETED) => {
                res.status(500).send({ message: "No se logro agregar la asistencia." });
            });

        }
    });
}

function getAssitancesByID(req, res) {
    let params = req.body;
    let from = moment(moment(params.from).startOf('day'));
    let to = moment(moment(params.to).endOf('day'));

    if (!params.id) {
        res.status(500).send({ message: "Indique el estudiante." });
    } else {

        PaymentCharge.find({
            student: params.id, assistence: {
                $gte: from,
                $lte: to
            }
        }, (err, documents) => {
            if (err) {
                res.status(500).send({ message: "No se lograron obtener las asistencias de este alumgno." });
            } else {
                res.status(200).send(documents);
            }
        });
    }
}

function addAsistanceDummy(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(400).send({ message: "Indique el alumno." });
    } else {
        var dateObj = new Date(params.date);
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        var currentDay = dateObj.getDay();

        let dateAssistance = new Date(year + "/" + month + "/" + day);


        PaymentCharge.findOne({ student: params.id, assistence: dateAssistance }, async (err, asistance) => {
            if (asistance && asistance.assisted) {
                res.status(405).send({ message: "El alumno ya cuenta con una asistencia hoy." });
            } else {
                console.log(asistance.assisted);
                if (!asistance.assisted) {
                    PaymentCharge.findByIdAndUpdate(asistance._id, { paidOut: true, assisted: true }, (err, assistanceUpdated) => {
                        if (!err) {
                            res.status(200).send({ message: "Se aplico la asistencia.", assistanceUpdated });
                        } else {
                            res.status(500).send({ message: "Ocurrio un error al agregar la asistencia." });
                        }
                    })
                } else {


                    var paymentCharge = new PaymentCharge();
                    paymentCharge.date = new Date();
                    paymentCharge.assistence = dateAssistance;
                    paymentCharge.student = params.id;
                    paymentCharge.paidOut = params.paidOut;
                    paymentCharge.isWeekend = false;
                    paymentCharge.isLesson = true;
                    console.log(currentDay);
                    if (weekendDays.indexOf(currentDay) >= 0) {
                        paymentCharge.isWeekend = true;
                        paymentCharge.charge = params.priceWeekend;
                    } else {
                        paymentCharge.charge = params.priceLesson;
                    }

                    paymentCharge.assisted = params.assisted;
                    //Revisa que si el dia es Jueves. para saber si aplicar un cargo o no
                    if (currentDay === 3) {
                        let today = day;
                        paymentCharge.charge = 0;
                        paymentCharge.paidOut = true;
                        //Recupera si pago las 3 clases pasadas correspondientes a Lunes, Martes y Miercoles
                        for (var i = 0; i <= 2; i++) {
                            today = today - 1;
                            let dateAssistanceSearch = new Date(year + "/" + month + "/" + today);
                            try {
                                let check = await new Promise((resolve) => {
                                    PaymentCharge.findOne({ student: params.id, assistence: dateAssistanceSearch }, (err, pay) => {
                                        console.log(pay)
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            resolve(pay);
                                        }
                                    });
                                });
                                if (!check) {
                                    paymentCharge.paidOut = params.paidOut;
                                    paymentCharge.charge = params.priceLesson;
                                }
                            } catch (error) {

                            }
                        }


                    }
                    console.log(paymentCharge.charge)
                    paymentCharge.save((err, paymentStored) => {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ message: "No se logro hacer el cargo." });
                        } else {
                            res.status(200).send({ message: "Se aplico la asistencia.", paymentStored });
                        }
                    });
                }
            }
        });


    }

}


function saveAssistanceClase(req, res) {
    let params = req.body;
    if (!params.id) {
        res.status(400).send({ message: "Indique el alumno." });
    } else {
        var dateObj = new Date();
        if (params.date) {
            dateObj = new Date(params.date);
        }
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getDate();
        var year = dateObj.getFullYear();
        var currentDay = dateObj.getDay();
        // console.log("Asistencia ", dateAssistance);
        PaymentCharge.findOne({ student: params.id, assistence: new Date(`${year}/${month}/${day}`) }, async (err, asistance) => {
            //console.log(asistance);
            if (asistance && asistance.assisted && !params.isAbono) {
                res.status(405).send({ message: "El alumno ya cuenta con una asistencia hoy." });
            } else if (params.isAbono && asistance && asistance.paidOut) {
                res.status(405).send({ message: `El alumno ya cuenta la asistencia del dia ${day + "-" + month + "-" + year} pagada.` });
            } else {
                if (asistance && !asistance.assisted && asistance.paidOut) {
                    PaymentCharge.findByIdAndUpdate(asistance._id, { assisted: true }, (err, assistanceUpdated) => {
                        if (!err) {
                            res.status(200).send({ message: "Se aplico la asistencia.", assistanceUpdated });
                        } else {
                            res.status(500).send({ message: "Ocurrio un error al agregar la asistencia." });
                        }
                    })
                } else {
                    var paymentCharge = new PaymentCharge();
                    paymentCharge.date = new Date();
                    paymentCharge.assistence = new Date(`${year}/${month}/${day}`);
                    paymentCharge.student = params.id;
                    paymentCharge.paidOut = params.paidOut;
                    paymentCharge.ticketId = params.ticketId || false; 
                    paymentCharge.isWeekend = false;
                    paymentCharge.isLesson = true;
                    // console.log(currentDay);
                    if (weekendDays.indexOf(currentDay) >= 0) {
                        paymentCharge.isWeekend = true;
                        paymentCharge.charge = params.priceWeekend;
                    } else {
                        paymentCharge.charge = params.priceLesson;
                    }
                    paymentCharge.assisted = params.assisted;


                    if(params.paidOut && !params.ticketId){
                        let ticketId = ShortId.generate();

                        let existeTicket = true;

                        //REvisa que no existe el ticket

                        while(existeTicket === true) {
                            let ticket = await PaymentCharge.findOne({ ticketId: ticketId })
                            if (ticket) {
                                ticketId = ShortId.generate();
                            } else {
                                existeTicket = false;
                            }
                        }

                        paymentCharge.ticketId = ticketId;
                    }
                    //Revisa que si el dia es Jueves. para saber si aplicar un cargo o no
                    // if (currentDay === 4) {
                    //     let today = day;
                    //     let fchaMoment = new moment(year + "/" + month + "/" + today, 'YYYY/MM/DD');
                    //     // console.log(fchaMoment);
                    //     paymentCharge.charge = 0;
                    //     paymentCharge.paidOut = false;
                    //     //Recupera si pago las 3 clases pasadas correspondientes a Lunes, Martes y Miercoles
                    //     for (var i = 0; i <= 2; i++) {
                    //         fchaMoment = fchaMoment.subtract(1, "days");
                    //         let dateAssistanceSearch = new Date(fchaMoment.format('YYYY/MM/DD'));
                    //         // console.log(dateAssistanceSearch);
                    //         try {
                    //             let check = await new Promise((resolve) => {
                    //                 PaymentCharge.findOne({ student: params.id, assistence: dateAssistanceSearch }, (err, pay) => {
                    //                     if (err) {
                    //                         console.log(err);
                    //                     } else {
                    //                         resolve(pay);
                    //                     }
                    //                 });
                    //             });
                    //             if (!check) {
                    //                 paymentCharge.paidOut = params.paidOut;
                    //                 paymentCharge.charge = params.priceLesson;
                    //             }
                    //         } catch (error) {

                    //         }
                    //     }
                    // }
                    console.log(paymentCharge.charge)
                    console.log(currentDay);
                    console.log(paymentCharge.assistence);
                    //paymentCharge.paidOut = false;
                    if (params.isAbono && asistance && !asistance.paidOut) {
                        PaymentCharge.findByIdAndUpdate(asistance._id, { paidOut: true,date:new Date() }, (err, result) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ message: "No se logro aplicar el pago." });
                            } else {
                                res.status(200).send({ message: "Clase pagada con éxito." });
                            }
                        });
                    } else {
                        paymentCharge.save((err, paymentStored) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ message: "No se logro hacer el cargo." });
                            } else {
                                res.status(200).send({ message: "Se aplico la asistencia.", paymentStored });
                            }
                        });
                    }

                }
            }
        });
    }
}



module.exports = {
    saveAssistanceClase,
    getAssitancesByID,
    addAsistanceDummy,
    addAsistance
}