'use-strict'

var fs = require('fs');
var path = require('path');

var mongoosePaginate = require('mongoose-pagination');


var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');


function getSong(req,res){
	var songId = req.params.id;

	Song.findById(songId)
		.populate({path: 'album'}).exec((err,song)=>{
			if(err){
				res.status(500).send({
					message: 'Ocurrio un error en la petición'
				});
			}else{
				if(!song){
					res.status(404).send({
						message: 'La canción no existe'
					});
				}else{
					res.status(200).send({
						song
					});
				}
			}
		});
}

function getSongs(req, res){
	var albumId = req.params.album;

	if(!albumId){
		var find = Song.find({}).sort('number');
	}else{
		var find = Song.find({album: albumId}).sort('number');
	}

	find.populate({
		path: 'album', 
		populate: {
			path: 'artist',
			model: 'Artist'
		}
	}).exec((err,songs)=>{
		if(err){
			res.status(500).send({
				message: 'Ocurrio un error en la petición'
			});
		}else{
			if(!songs){
				res.status(404).send({
					message: 'No hay canciones'
				});
			}else{
				res.status(200).send({
					songs
				});
			}
		}
	})
}

function saveSong(req,res){
	var song = new Song();
	var params = req.body;

	song.number = params.number;
	song.name = params.name;
	song.duration = params.duration;
	song.file = null;
	song.album = params.album;

	song.save((err,songStored)=>{
		if(err){
			res.status(500).send({
				message: 'Error en la petición'
			});
		}else{
			if(!songStored){
				res.status(404).send({
					message: 'Error al guardar la canción'
				});
			}else{
				res.status(200).send({
					song: songStored
				});
			}
		}
	});
}

function updateSong(req, res){
	var songId = req.params.id;
	var update = req.body;

	Song.findByIdAndUpdate(songId,update,(err,songUpdated)=>{
		if(err){
			res.status(500).send({
				message: 'Error en la petición'
			});
		}else{
			if(!songUpdated){
				res.status(404).send({
					message: 'La canción no existe'
				});
			}else{
				res.status(200).send({
					song: songUpdated
				});
			}
		}
	});
}

function deleteSong(req, res){
	var songId = req.params.id;

	Song.findByIdAndRemove(songId,(err,removeSong)=>{
		if(err){
			res.status(500).send({
				message: 'Error en la petición'
			});
		}else{
			if(!removeSong){
				res.status(404).send({
					message: 'La canción no existe'
				});
			}else{
				res.status(200).send({
					song: removeSong
				})
			}
		}

	});
}

function uploadFile(req, res){
	var songId = req.params.id;
	var file_name = 'No subido...';

	if(req.files){
		var file_path = req.files.file.path;
		var file_split = file_path.split('\/');
		var file_name=file_split[2];
		var ext_split = file_name.split('.');
		console.log(ext_split);
		var file_ext = ext_split[1];

		if(file_ext == 'mp3' || file_ext == 'ogg'){
			
			Song.findByIdAndUpdate(songId,{file: file_name},
				(err,songUpdated)=>{
					if(!songUpdated){
						res.status(404).send({
							message: 'No se ha podido actualizar la canción'
						});
					}else{
						res.status(200).send({
							song: songUpdated
						});
					}
		
				});
		}else{
			res.status(200).send({
				message: 'Extensión del archivo no valida'
			});
		}


		console.log(ext_split);
	}else{
		res.status(200).send({
			message: 'No has subido ninguna imagen...'
		});
	}
}

function getFile(req, res){
	var file = req.params.file;
	var path_file='./uploads/songs/'+file;

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


module.exports={
	getSong,
	saveSong,
	getSongs,
	updateSong,
	deleteSong,
	uploadFile,
	getFile
};