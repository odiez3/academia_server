'use-strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3977;


app.get("/",(req,res)=>{
	res.status(200).send("SERVICIOS ACTIVOS");
});

mongoose.Promise = global.Promise;
let local = 'mongodb://localhost:27017/academia';
//let local = 'mongodb://localhost:27017/academia';

mongoose.connect(local,(err,res)=>{
	if(err){
		throw err;
	}else{
		console.log("La conexión a la base de datos está funcionando correctamente...");
		app.listen(port,function(){
			console.log("Servidor del api rest de academia gladiadores en http://localhost:"+port);
		});
	}
});