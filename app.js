var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session= require('express-session');
var passport= require('passport');
var fileStore= require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter= require('./routes/dishRouter');
var leaderRouter = require('./routes/leaderRouter');
var promoRouter =require('./routes/promoRouter');


const mongoose= require('mongoose');
const Dishes= require('./models/dishes');
var authenticate= require('./authenticate');

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

//var fileStoreOptions = {};
app.use(session({

	name:'session-id',
	secret:'12346-21141-00010-98711',
	saveUninitialized: false,
	resave: false,
	store: new fileStore({path: './sessions'})

}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

function auth(req, res, next){

	console.log(req.user);

	if(!req.user){

		err= new Error("You seem to be unauthorized");
			
		err.status= 403;
		next(err);
	}
	else
		next();
}
	

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));


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
