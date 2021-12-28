'use-strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar rutas
var user_routes = require('./routes/user');
// var artist_routes = require('./routes/artist');
// var album_routes = require('./routes/album');
// var song_routes = require('./routes/song');
var student_routes = require('./routes/students');
var assistance_routes = require('./routes/assistance');
var extra_routes = require('./routes/extras');
var paymentCharge_routes = require('./routes/paymentCharge');
var prueba_route = require('./routes/prueba');

app.use(bodyParser.urlencoded({ limit: "4mb" ,extended: true }));
app.use(bodyParser.json({limit: "4mb"}));

// Configurar cabeceras http
app.use((req, res, next)=>{
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods','GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow','GET, POST, OPTIONS, PUT, DELETE');
	next();
});

// rutas base
app.use('/api',user_routes);
// app.use('/api',artist_routes);
// app.use('/api',album_routes);
// app.use('/api',song_routes);
app.use('/api',student_routes);
app.use('/api',assistance_routes);
app.use('/api',extra_routes);
app.use('/api',paymentCharge_routes);
app.use('/api',prueba_route);
module.exports = app;