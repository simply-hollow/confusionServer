var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter= require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter =require('./routes/promoRouter');

const mongoose= require('mongoose');
const Dishes= require('./models/dishes');

const url="mongodb://localhost:27017/conFusion";

const connect= mongoose.connect(url);
connect.then((db)=>{

	console.log("Connection established successfully..!");

}, (err)=> console.log(err))
.catch((err)=> console.log(err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12346-21141-00010-98711')); //Passing the secret key to the server for signing the cookies.

function auth(req, res, next){

	console.log(req.signedCookies);

	if(!req.signedCookies.user){
		var authHeader= req.headers.authorization;

		if(!authHeader){

			err= new Error("You seem to be unauthorized");

			res.setHeader('WWW-authenticate', 'basic');
			err.status= 401;
			return next(err);
		}

		const auth= new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
		var username= auth[0];
		var password= auth[1];

		if(username==='admin' && password==='password'){
			res.cookie('user','admin',{signed:true});
			next();
		}
		else{

			err= new Error("You seem to be unauthorized");

			res.setHeader('WWW-authenticate', 'basic');
			err.status= 401;
			return next(err);
		}	
	}
	else{

			if(req.signedCookies.user==='admin')
				next();
			else{

				err= new Error("You seem to be unauthorized");
			
				err.status= 401;
				return next(err);
			}
	}
	
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
