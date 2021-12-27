'use-strict'

var PaymentCharge = require('../models/paymentCharge');
var Extra = require('../models/extras');
var Student = require('../models/student');
var moment = require('moment');
var pdf = require('html-pdf');


async function savePayment(req, res) {
    let params = req.body;
    var payment = new PaymentCharge();
    payment.student = params.id;
    payment.date = new Date();
    payment.payment = params.monto;

    if (!params.id) {
        res.status(500).send({ message: "Indique el alumno." });
    } else {
        if (params.abonoExtra) {
            if (!params.extraId) {
                res.status(500).send({ message: "Indique el extra a pagar." });
            } else {
                Extra.findById(params.extraId, (error, extra) => {

                    if (!error) {
                        if (extra) {

                            if (extra.finished) {
                                res.status(500).send({ message: "Este cargo ya fue liquidado." });
                            } else {
                                let remaining = extra.amount - params.monto;
                                if (extra.remaining) {

                                    remaining = extra.remaining - params.monto;
                                }
                                extra.remaining = remaining;
                                if (remaining <= 0) {
                                    //Actualiza el extra a pagado.
                                    extra.finished = true;
                                }

                                Extra.findByIdAndUpdate(extra._id, extra, (err, extraUpdated) => {
                                    if (!err) {
                                        console.log("Adicional Pagado.");
                                    } else {
                                        res.status(500).send({ message: "No se logro terminar el cargo adicional." });
                                    }
                                });

                                payment.isPayment = true; //Indica que es un abono de extra
                                payment.concept = params.extraId;
                                console.log(params.isMonthly);
                                if (params.isMonthly) {
                                    payment.isMonthly = true;
                                }

                                payment.save((error, paymetnStored) => {
                                    if (!error) {
                                        res.status(200).send({ message: "Abono aplicado correctamente." });
                                    } else {
                                        console.log(error);
                                        res.status(500).send({ message: "El abono no pudo ser agregado correctamente." });
                                    }

                                }).catch((error) => {
                                    console.log(error);
                                    res.status(500).send({ message: "Ocurrio un error inesperado al agregar el abono." });
                                });

                            }
                        } else {
                            res.status(404).send({ message: "No se encontrarón resultados." });
                        }

                    } else {
                        console.log(error);
                        res.status(500).send({ message: "No se encontro el cargo adicional." })
                    }

                });
            }
        } else {
            if (params.isMonthly) {
                payment.isMonthly = true;
                payment.month = params.month;
                payment.year = params.year;
                payment.paidOut = true;
            }
            payment.save((error, paymetnStored) => {
                if (!error) {
                    res.status(200).send({ message: "Abono aplicado correctamente." });
                } else {
                    console.log(error);

                    res.status(500).send({ message: "El abono no pudo ser agregado correctamente." });
                }

            }).catch((error) => {
                console.log(error);
                res.status(500).send({ message: "Ocurrio un error inesperado al agregar el abono." });
            });
        }


    }
}

function getPaymentCharguesByStudent(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(500).send({ message: "Falta proporcionar el ID del Alumno." });
    } else {

        PaymentCharge.find({ student: params.id }, (err, paymentsCharges) => {
            console.log(paymentsCharges);
            if (err) {
                res.status(500).send({ message: "No se lograron obtener los pagos y cargos." });
            } else {
                res.status(200).send(paymentsCharges);
            }
        });
    }
}

function getOnlyLessonPayments(req, res) {
    let params = req.body;
    if (!params.id) {
        res.status(500).send({ message: "Falta proporcionar el ID del Alumno." });
    } else {
        PaymentCharge.find({ student: params.id, isPayment: null }, (err, paymentsCharges) => {
            console.log(paymentsCharges);
            if (err) {
                res.status(500).send({ message: "No se lograron obtener los pagos de clases." });
            } else {
                res.status(200).send(paymentsCharges);
            }
        });
    }
}

function getOnlyExtrasPayments(req, res) {
    let params = req.body;
    if (!params.id) {
        res.status(500).send({ message: "Falta proporcionar el ID del Alumno." });
    } else {
        PaymentCharge.find({ student: params.id, isPayment: true }).populate({ path: 'concept' })
            .exec(
                (err, paymentsCharges) => {
                    if (err) {
                        res.status(500).send({ message: "No se lograron obtener los pagos adicionales." });
                    } else {

                        res.status(200).send(paymentsCharges);
                    }
                });
    }
}

function getAllPaymentsCharge(req, res) {

    let params = req.body;
    if (params.page) {
        var page = params.page;
    } else {
        var page = 1;
    }
    var itemsPerPage = params.limit;

    PaymentCharge.find().populate({ path: 'concept' }).populate({ path: 'student' }).sort('date')
        .paginate(page, itemsPerPage, (err, paymentsCharges, total) => {
            if (err) {
                res.status(500).send({
                    message: 'Error en la petición'
                });
            } else {
                if (!paymentsCharges) {
                    res.status(404).send({
                        message: 'No se obtuvieron resultados.'
                    });
                } else {
                    return res.status(200).send({
                        total_items: total,
                        paymentsCharges
                    });
                }
            }
        });
}

function getPaymentsByDateRange(req, res) {

    const today = moment().startOf('day')
    PaymentCharge.find({
        date: {
            $gte: new Date(2019, 4, 21),
            $lte: new Date(2019, 12, 2)
        }
    }).populate({ path: 'concept' }).populate({ path: 'student' }).sort('date').exec((err, paymentsCharges) => {
        if (!err) {
            res.status(200).send(paymentsCharges);
        } else {
            res.status(404).send({ message: "No se obtuvieron resultados." });
        }
    });
}

function getPaymentsDateRangeByStudent(req, res) {
    let params = req.body;
    let from = params.from;
    let to = params.to;
    PaymentCharge.find({
        student: params.id,
        date: {
            $gte: new Date(from),
            $lte: new Date(to)
        }
    }).populate({ path: 'concept' }).populate({ path: 'student' }).sort('date').exec((err, paymentsCharges) => {
        if (!err) {
            res.status(200).send(paymentsCharges);
        } else {
            res.status(404).send({ message: "No se obtuvieron resultados." });
        }
    });
}

function getPaymentChargeClass(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(500).send({ message: "Falta proporcionar el ID del Alumno." });
    } else {

        PaymentCharge.find({ student: params.id }).where('concept', null).exec((err, paymentChargesClass) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: "No se lograron obtener los pagos y cargos." });
            } else {
                res.status(200).send(paymentChargesClass);
            }
        })

        // PaymentCharge.find({ student: params.id }, (err, paymentsCharges) => {
        //     console.log(paymentsCharges);
        //     if (err) {
        //         res.status(500).send({ message: "No se lograron obtener los pagos y cargos." });
        //     } else {
        //         res.status(200).send(paymentsCharges);
        //     }
        // });
    }
}


function getLessonsNoPaid(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(500).send({ message: "Indique el Consecutivo del Alumno." });
    } else {
        PaymentCharge.find({ student: params.id, isLesson: true, paidOut: false, assisted: true }, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: "No se logro recuperar las clases no pagadas de este alumno." });
            } else {
                res.status(200).send({ clases: results });
            }
        });
    }
}

function getAssistances(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(500).send({ message: "Falta indicar al alumno." });
    } else {
        if (params.page) {
            var page = params.page;
        } else {
            var page = 1;
        }
        var itemsPerPage = params.limit;

        PaymentCharge.find({ student: params.id, isLesson: true, assited: true }).sort('consecutivo')
            .paginate(page, itemsPerPage, (err, students, total) => {
                if (err) {
                    res.status(500).send({
                        message: 'Error en la petición'
                    });
                } else {
                    if (!students) {
                        res.status(404).send({
                            message: 'No hay estudiantes.'
                        });
                    } else {
                        return res.status(200).send({
                            total_items: total,
                            students: students
                        });
                    }
                }
            });
    }
}

function getTotalDebtLessons(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(500).send({ message: "Indique el Consecutivo del Alumno." });
    } else {
        PaymentCharge.find({ student: params.id, isLesson: true, paidOut: false }, (err, results) => {
            if (err) {
                console.log(err);
                res.status(500).send({ message: "No se logro recuperar las clases no pagadas de este alumno." });
            } else {
                let sum = 0;
                for (var r of results) {
                    sum += r.charge;
                }
                res.status(200).send({ totalDebt: sum });
            }
        });
    }
}

function payLesson(req, res) {
    let params = req.body;

    if (!params.id) {
        res.status(500).send({ message: "Indique la clase a pagar" });
    } else {
        PaymentCharge.findById(params.id, (err, toPay) => {
            if (!err) {
                if (!toPay) {
                    res.status(500).send({ message: "No se encontro la clase a pagar." });
                } else {
                    console.log(toPay);

                    if (toPay.paidOut) {
                        res.status(500).send({ message: "Esta clase se encuntra pagada." });
                    } else {
                        PaymentCharge.findByIdAndUpdate(params.id, { paidOut: true, date: new Date() }, (err, result) => {
                            if (err) {
                                console.log(err);
                                res.status(500).send({ message: "No se logro aplicar el pago." });
                            } else {
                                res.status(200).send({ message: "Clase pagada con éxito." });
                            }
                        });

                    }
                }
            } else {
                console.log(err);
                res.status(500).send({ message }, "Ocurrio un error inesperado.");
            }

        })
    }
}


function payMonth(req, res) {

    let params = req.body;
    if (!params.id) {
        res.status(400).send({ message: "Indique el alumno." });
    } else {
        let month = params.month;
        let year = params.year;
        let paymentMount = params.payment;

        PaymentCharge.findOne({ student: params.id, year: year, month: month }, (err, monthPayment) => {
            if (!err && monthPayment) {
                res.status(500).send({ message: "Ya se cuenta con un pago para este mes." });
            } else if (err) {
                console.log(err);
                res.status(500).send({ message: "Ocurrio un error inesperado." });
            } else {
                let payment = new PaymentCharge();
                payment.isMonthly = true;
                payment.paidOut = true;
                payment.month = month;
                payment.year = year;
                payment.date = new Date();
                payment.payment = paymentMount;
                payment.student = params.id;

                payment.save((err, paymentSaved) => {
                    if (err) {
                        console.log(err);
                        res.status(500).send({ message: "Ocurrio un error al agregar el pago mensual." });
                    } else {
                        console.log(paymentSaved);
                        res.status(200).send({ message: "Se aplico el pago correctamente." });
                    }
                });
            }
        });

    }
}


function getAllPaymentsCharges(req, res) {
    let params = req.body;
    let from = params.from;
    let to = params.to;
    PaymentCharge.find({
        date: {
            $gte: new Date(from),
            $lte: new Date(to)
        }
    }).populate({ path: 'concept' }).populate({ path: 'student' }).sort('date').exec((err, paymentsCharges) => {
        if (!err) {
            res.status(200).send(paymentsCharges);
        } else {
            res.status(404).send({ message: "No se obtuvieron resultados." });
        }
    });
}


function plantillaFecha(fecha) {
    let date = fecha;
    if (typeof fecha === "string") {

        if (fecha.trim() !== "") {
            try {
                date = new Date(fecha);
            } catch (error) {
                return "";
            }

        } else {
            return "";
        }

    }



    let diaSemana = date.getDay();
    let mes = date.getMonth();
    //let dia = date.getDate();
    let dia = date.getDate();
    let anio = date.getFullYear();

    var weekday = new Array(7);
    weekday[0] = "Lunes";
    weekday[1] = "Martes";
    weekday[2] = "Miercoles";
    weekday[3] = "Jueves";
    weekday[4] = "Viernes";
    weekday[5] = "Sabado";
    weekday[6] = "Domingo";

    var month = new Array(12);
    month[0] = "Enero";
    month[1] = "Febrero";
    month[2] = "Marzo";
    month[3] = "Abril";
    month[4] = "Mayo";
    month[5] = "Junio";
    month[6] = "Julio";
    month[7] = "Agosto";
    month[8] = "Septiembre";
    month[9] = "Octubre";
    month[10] = "Noviembre";
    month[11] = "Diciembre";



    //return weekday[diaSemana] + " "+dia + " de " +month[mes] + " del " + anio;
    return dia + " de " + month[mes] + " del " + anio;

}


function pdfPaymentsCharges(req, res) {

    let params = req.body;
    let data = params.data;
    let from = params.from;
    let to = params.to;

    console.log(from);
    console.log(to);
    var contenido = `
<center><h5> Abonos Academia de Gladiadores</center>
<center><label style="font-size:12px">Información generada de ${plantillaFecha(from)} al ${plantillaFecha(to)}</label></center>
`;

    contenido += `
<br/>
<table style="border:solid 1px;width:100% ">
<thead>
  <tr style="font-size:10px">
  <th style="background-color:#63b24b;color:white;border:solid 1px black;">ID</th>
      <th style="background-color:#63b24b;color:white;border:solid 1px black;">Alumno</th>
      <th style="background-color:#63b24b;color:white;border:solid 1px black;">Concepto</th>
      <th style="background-color:#63b24b;color:white;border:solid 1px black;">Abono</th>
      <th style="background-color:#63b24b;color:white;border:solid 1px black;">Fecha</th>
  </tr>
</thead>

<tbody style="border:solid 1px;">`;

    data.forEach((value, index) => {

        let concepto = false;
        let isWeekend = false;

        let charge = value.charge;
        let payment = value.payment;

        if (value.concept) {
            concepto = value.concept.concept
        }

        if (value.isMonthly) {
            var month = new Array(12);
            month[1] = "Enero";
            month[2] = "Febrero";
            month[3] = "Marzo";
            month[4] = "Abril";
            month[5] = "Mayo";
            month[6] = "Junio";
            month[7] = "Julio";
            month[8] = "Agosto";
            month[9] = "Septiembre";
            month[10] = "Octubre";
            month[11] = "Noviembre";
            month[12] = "Diciembre";

            concepto = `Pago mes ${month[value.month]}`;
        }

        if (value.isWeekend) {
            isWeekend = true;
        }

        if (value.paidOut && value.isLesson) {
            charge = false;
            payment = value.charge;
        }

        if (!charge && !isWeekend) {



            contenido += `
    <tr style="font-size:10px">
    <td><center>${value.student.consecutivo}</center></td>
    <td>${value.student.name}</td>
    <td>${concepto ? concepto : `Clase${isWeekend ? " Fin de semana" : ""}`}</td>
    <td><center>${payment ? "$" + parseFloat(Math.round(payment * 100) / 100).toFixed(2) : ""}</center></td>
    <td>${plantillaFecha(value.date)}</td>
  </tr>
    ` ;
        }
    });



    contenido += `
</tbody>
</table>`;


    pdf.create(contenido).toStream((err, stream) => {
        if (err) return res.end(err.stack)
        res.setHeader('Content-type', 'application/pdf');
        console.log(stream.path);
        stream.pipe(res)
    })

}


module.exports = {
    savePayment,
    getPaymentCharguesByStudent,
    getOnlyLessonPayments,
    getOnlyExtrasPayments,
    getAllPaymentsCharge,
    getPaymentsByDateRange,
    getPaymentsDateRangeByStudent,
    getPaymentChargeClass,
    getLessonsNoPaid,
    getAssistances,
    getTotalDebtLessons,
    payLesson,
    payMonth,
    getAllPaymentsCharges,
    pdfPaymentsCharges
}