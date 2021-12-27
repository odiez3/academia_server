'use-strict'

var fs = require('fs');
var path = require('path');
var Student = require('../models/student');
var PaymentCharge = require('../models/paymentCharge');
var mongoosePaginate = require('mongoose-pagination');

function pruebaStudent(req, res) {
	var student = new Student();
    var params = req.body;


    Student.count().then((rs)=>{
        console.log(rs);
        res.status(200).send(`${rs}`);	
    })
  
}


function saveStudent(req, res) {
	var student = new Student();
    var params = req.body;

    Student.count().then((conteo)=>{
       
        student.name = params.name.trim();
        student.image = !params.image?'null':params.image;
        student.tel = params.tel;
        student.emergency = params.emergency;
        student.birthday = params.birthday;
        student.priceLesson = params.priceLesson;
        student.debtLimit = params.debtLimit;
        student.observations = params.observations;
		student.methodPayment = params.methodPayment;
		student.nameUpper = params.name.trim().toUpperCase();

		
		
		if(params.id){
			Student.findByIdAndUpdate(params.id,req.body,(err,studentUpdated)=>{
				if(!err){ 
					res.status(200).send(studentUpdated);
				}else{
					console.log(err);
					res.status(500).send({message:"No se logro actualizar al estudiante."});
				}
			})
		}else{
			if(params.consecutivo){
				//Revisa que el consecutivo no exista;
				Student.findOne({consecutivo:params.consecutivo},(err,studiante)=>{
					if(studiante){
						res.status(500).send({message:`Ya existe un alumno con el ID ${params.consecutivo}`});
					}else{
						student.consecutivo = params.consecutivo;
						storeStudent(student,res);
					}
				});
		
			}else{
				student.consecutivo = conteo+1;
				storeStudent(student,res);
			}
			
			
	
		}

        
    });
}

function storeStudent(student,res){
	student.save((error,studentStored)=>{
		if(!error){ 
			res.status(200).send(studentStored);
		}else{
			console.log(error);
			res.status(500).send({message:"No se logro agregar al estudiante."});
		}
	});
}


function getStudentByID(req, res) {
    var params = req.body;

    Student.findOne({consecutivo:params.consecutivo},(err, student)=>{
        if(student){
			if(student.methodPayment === 1){
				//Revisa que la fecha no sea 6 
				let currentDate = new Date();
				let currentDay = currentDate.getDate();
				let month = currentDate.getMonth() +1;
				let year = currentDate.getUTCFullYear();

				//Revisa que ya tenga la mensualidad pagada.
				console.log("M",month);
				console.log("Y",year);
				PaymentCharge.findOne({student:student._id,month,year},(err,payment)=>{
					console.log(payment);
					if(payment){
						res.status(200).send(student);
					}else{
						console.log(currentDay);
						let studentM = JSON.parse(JSON.stringify(student));
						if(currentDay > 6){
							studentM['monthPayless']=true;
							res.status(200).send(studentM);
						}else{
							res.status(200).send(studentM);
						}
					}
				});

			}else{
				res.status(200).send(student);
			}
           
        }else{  
            console.log(err);
            res.status(404).send({message:`El estudiante con ID ${params.consecutivo} no existe.`});
        }
    }).catch((error)=>{
        console.log(error);
        res.status(500).send({message:"No se pudo recuperar los datos del estudiante."});
    });
}

function getStudentByName(req,res){
	var params = req.body;
	var name = params.name.trim().toUpperCase();
	console.log(name);
	Student.find({"nameUpper": { $regex: '.*' + name + '.*' } }).then((students)=>{
			if(students.length){
				res.status(200).send({students});
			}else{
				res.status(404).send({message:"No se encontraron resultados."});
			}
	});
}

function uploadImage(req, res) {
	var userId = req.params.id;
	var file_name = 'No subido...';
	if (req.files) {
		var file_path = req.files.image.path;
		var file_split = file_path.split('\\'); //Es porque en windows debe llevar este caracter \
		var file_name = file_split[2];
	
		var ext_split = file_name.split('.');
		var file_ext = ext_split[1];

		if (file_ext == 'png' || file_ext == 'jpg' ||
			file_ext == 'gif') {

			Student.findByIdAndUpdate(userId, { image: file_name },
				(err, studentUpdated) => {
					if (!studentUpdated) {
						res.status(404).send({
							message: 'No se ha podido actualizar el estudiante'
						});
					} else {
						res.status(200).send({
							image: file_name,
							student: studentUpdated
						});
					}

				});
		} else {
			res.status(200).send({
				message: 'Extensión del archivo no valida (PNG,JPG,GIF)'
			});
		}


		console.log(ext_split);
	} else {
		res.status(200).send({
			message: 'No has subido ninguna imagen...'
		});
	}
}

function getImageFile(req, res){
	var imageFile = req.params.imageFile;
	var path_file='./uploads/students/'+imageFile;

	fs.exists(path_file, function(exitsts){
		if(exitsts){
			res.sendFile(path.resolve(path_file));
		}else{
			res.status(200).send({
				message: 'No existe la imagen'
			});
		}
	});
}

function getStudents(req, res){
	if(req.params.page){
		var page = req.params.page;
	}else{
		var page=1;
	}
	var itemsPerPage = req.body.limit;

	Student.find().sort('consecutivo')
	.paginate(page,itemsPerPage,(err,students,total)=>{
		if(err){
			res.status(500).send({
				message: 'Error en la petición'
			});
		}else{
			if(!students){
				res.status(404).send({
					message: 'No hay estudiantes.'
				});
			}else{
				return res.status(200).send({
					total_items: total,
					students: students
				});
			}
		}
	});
}


module.exports={
    saveStudent,
    pruebaStudent,
    getStudentByID,
    uploadImage,
	getImageFile,
	getStudentByName,
	getStudents
}