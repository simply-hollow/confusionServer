var express = require('express');
var router = express.Router();
const bodyParser= require('body-parser');

const users= require('../models/user');
var passport= require('passport');
var authenticate= require('../authenticate');
var cors= require('./cors');

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next) {
  	users.find({})
  	.then((user)=>{

  		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(user);

  	}, (err)=> next(err))
  	.catch((err)=> next(err));
});

router.post('/signup', cors.corsWithOptions, (req, res, next)=>{
		users.register(new users({username: req.body.username}), req.body.password, (err, user)=>{
			if(err)
			{
				res.statusCode=500;
				res.setHeader('content-Type', 'application/json');
				res.json({err:err, status: 'first block error'});
			}
			else{
				if(req.body.firstname)
					user.firstname=req.body.firstname;
				if(req.body.lastname)
					user.lastname=req.body.lastname;
				
				user.save((err, user)=>{

					if(err){
						res.statusCode=500;
						res.setHeader('content-Type', 'application/json');
						res.json({err:err});
						return;
					}
					passport.authenticate('local')(req, res, ()=>{
						res.statusCode=200;
						res.setHeader('content-Type', 'application/json');
						res.json({success: "true",status:"Registration successful..!!"});
					});
				});
			}
		});
});

router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res)=>{

	var token= authenticate.getToken({_id: req.user._id});
	res.statusCode=200;
	res.setHeader('content-Type', 'application/json');
	res.json({success: "true",token: token, status:"You are successfully logged in..!!"});

});

router.get('/logout', cors.corsWithOptions, (req, res, next)=>{

	if(req.session)
	{
		req.session.destroy();
		res.clearCookie('session-id');
		res.redirect('/');
	}
	else{
		var err= new Error("You are not logged in!!");
		err.status= 403;
		return next(err);
	}
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res)=>{
	if(req.user){

		var token= authenticate.getToken({_id: req.user._id});
		res.statusCode=200;
		res.setHeader('content-Type', 'application/json');
		res.json({success: "true",token: token, status:"You are successfully logged in..!!"});

	}
});



module.exports = router;
