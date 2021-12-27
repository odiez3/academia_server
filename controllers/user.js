'use-strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require('../models/user');
var jwt = require('../services/jwt');


function pruebas(req, res) {
	res.status(200).send({
		message: 'Probando una acción del controlador de usuarios del api rest con Node y Mongo'
	});
}


function saveUser(req, res) {
	var user = new User();
	var params = req.body;
	//console.log(params);
	user.name = params.name;
	user.surname = params.surname;
	user.email = params.email;
	user.role = params.rol;
	user.image = 'null';
	console.log(user);
	User.findOne({ email: params.email.toLowerCase() }, (err, u) => {
		if (u) {
			res.status(500).send({message:`Ya existe un usuario registrado con ${params.email}.`});
		} else {
			if (params.password) {
				// Encriptar contraseña 
				bcrypt.hash(params.password, null, null, function (error, hash) {
					user.password = hash;
					if (user.name != null && user.surname != null && user.email != null) {
						// guarde el usuario
						user.save((err, userStored) => {
							if (err) {
								res.status(500).send({ message: 'Error al guardar el usuario' });
							} else {
								if (!userStored) {
									res.status(404).send({ message: 'No se ha registrado el usuario' });
								} else {
									res.status(200).send({ user: userStored });
								}
							}
						});
					} else {
						res.status(200).send({ message: 'Introduce todos los campos' });
					}
				});
			} else {
				res.status(200).send({ message: 'Introduce la contraseña' });
			}
		}
	});
}

function getUsers(req,res){
	User.find({},(err,documents)=>{
		if(err){
			res.status(500).send({message:"No se lograron recuperar los usuarios."});
		}else{
			res.status(200).send(documents);
		}
	});
}

function loginUser(req, res) {
	var params = req.body;
	var email = params.email;

	var password = params.password;


	User.findOne({ email: email.toLowerCase() }, (err, user) => {
		if (err) {
			res.status(500).send({ message: 'Error en la petición.' })
		} else {
			//comprobar si existe 
			if (!user) {
				res.status(404).send({ message: 'El usuario no existe.' });
			} else {
				//comprobar la contraseña
				bcrypt.compare(password, user.password, function (err, check) {
					if (check) {
						//devolver los datos del usuario logueado
						if (params.gethash) {
							//devolver un token de jwt
							res.status(200).send({
								token: jwt.createToken(user),
								name: `${user.name} ${user.surname}`,
								email: user.email,
								rol: user.role
							});

						} else {
							res.status(200).send({ user });
						}
					} else {
						res.status(404).send({ message: 'Correo electrónico ó Contraseña incorrecto.' });
					}
				});
			}
		}
	});
}

function updateUser(req, res) {
	var userId = req.params.id;
	var update = req.body;

	let data = {
		name: update.name,
		surname: update.surname,
		email: update.email,
		rol: update.rol
	}
	console.log("id",userId);
	console.log(update)
	
	bcrypt.hash(update.password, null, null, function (error, hash) {
		console.log("METE EL HASh");
		console.log(userId);
		data.password = hash;
		User.findByIdAndUpdate(userId, data, (err, userUpdated) => {
			if (err) {
				res.status(500).send({
					message: 'Error al actualizar el usuario'
				});
			} else {
				if (!userUpdated) {
					res.status(404).send({
						message: 'No se ha podido actualizar el usuario'
					});
				} else {
					res.status(200).send({
						user: userUpdated
					});
				}
			}
		});
	});	

	
}

function uploadImage(req, res) {
	var userId = req.params.id;
	var file_name = 'No subido...';

	if (req.files) {
		var file_path = req.files.image.path;
		var file_split = file_path.split('\/');
		var file_name = file_split[2];
		var ext_split = file_name.split('.');
		var file_ext = ext_split[1];

		if (file_ext == 'png' || file_ext == 'jpg' ||
			file_ext == 'gif') {

			User.findByIdAndUpdate(userId, { image: file_name },
				(err, userUpdated) => {
					if (!userUpdated) {
						res.status(404).send({
							message: 'No se ha podido actualizar el usuario'
						});
					} else {
						res.status(200).send({
							image: file_name,
							user: userUpdated
						});
					}

				});
		} else {
			res.status(200).send({
				message: 'Extensión del archivo no valida'
			});
		}


		console.log(ext_split);
	} else {
		res.status(200).send({
			message: 'No has subido ninguna imagen...'
		});
	}
}

function getImageFile(req, res) {
	var imageFile = req.params.imageFile;
	var path_file = './uploads/users/' + imageFile;

	fs.exists(path_file, function (exitsts) {
		if (exitsts) {
			res.sendFile(path.resolve(path_file));
		} else {
			res.status(200).send({
				message: 'No existe la imagen'
			});
		}
	});
}

module.exports = {
	pruebas,
	saveUser,
	loginUser,
	updateUser,
	uploadImage,
	getImageFile,
	getUsers
};