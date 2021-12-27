'use-strict'

var Extra = require('../models/extras');
var PaymentCharge = require('../models/paymentCharge');


function addExtra(req, res) {
    let params = req.body;
    var extra = new Extra();

    if (!params.id) {
        res.status(400).send({ message: "Falta indicar el alumno." });
    } else {
        extra.student = params.id;
        extra.amount = params.monto;
        extra.concept = params.concepto;
        extra.date = new Date();
        extra.canceled = false;
        extra.finished = false;

        var newCharge = new PaymentCharge();

        newCharge.student = params.id;
        newCharge.charge = params.monto;
        newCharge.date = extra.date;

        extra.save((err, extraStored) => {

            newCharge.concept = extraStored._id;

            newCharge.save((err,newChargeStored)=>{
                
            });
            if (!err) {
                res.status(200).send({ message: "Pago Adicional Agregado Correctamente." });
            } else {
                console.log(err);
                res.status(500).send({ message: "No se logro agregar el pago adicional." });
            }
        }).catch((error) => {
            console.log(error);
            res.status(500).send({ message: "Ocurrio un error al agregar un pago adicional." });
        });
    }
}

function getExtrasByStudend(req, res) {
    let params = req.body;
    if (!params.id) {
        res.status(400).send({ message: "Falta indicar el alumno." });
    } else {
        Extra.find({ student: params.id }).sort({ "date": "desc" }).exec((err, extras) => {
            if (!err) {
                res.status(200).send(extras);
            } else {
                res.status(500).send({ message: "No se logro recuperar los pagos adicionales." });
            }
        })
            .catch((error) => {
                console.log(error);
                res.status(500).send({ message: "Ocurrio un error al obtener los pagos adicionales." });
            })
    }
}

function cancelExtra(req,res){
    let params = req.body;
    if(!params.id){
        res.status(400).send({ message: "Falta indicar el concepto a cancelar." });
    }else{
        Extra.findById(params.id,(error,extra)=>{
            if(!extra){
                res.status(404).send({message:"No se encontro el concepto a cancelar."});
            }else{
                Extra.findByIdAndUpdate(params.id,{canceled:true},(error,extraUpdated)=>{
                    if(!error){
                        res.status(200).send({message:"Concepto Cancelado Correctamente."});
                    }else{
                        console.log(error);
                        res.status(500).send({message:"Ocurrio un error al cancelar el concepto."});
                    }
                });
            }
        })
    }
}
module.exports = {
    addExtra,
    getExtrasByStudend,
    cancelExtra
}
