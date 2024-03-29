const express= require('express');
const bodyParse= require('body-parser');

const leaderRouter =express.Router();
const mongoose= require('mongoose');
const Leaders= require('../models/leaders');
var authenticate= require('../authenticate');
var cors= require('./cors');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

leaderRouter.use(bodyParse.json());

leaderRouter.route('/')
.options(cors.corsWithOptions, (req, res)=>{res.statuscode(200);})
.get(cors.cors, (req, res, next) =>{

	Leaders.find({})
	.then((leaders)=>{
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(leaders);

	}, (err)=> next(err))
	.catch((err)=> next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	Leaders.create(req.body)
	.then((leader)=>{
		console.log("Leader created: ", leader);

		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(leader);

	}, (err)=> next(err))
	.catch((err)=> next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	res.statuscode=403;
	res.end('PUT is not supported in /leaders');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	Leaders.remove({})
	.then((resp)=>{

		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(resp);

	}, (err)=> next(err))
	.catch((err)=> next(err));
});


leaderRouter.route('/:leaderId')
.options(cors.corsWithOptions, (req, res)=>{res.statuscode(200);})
.get(cors.cors, (req, res, next) =>{
	
	Leaders.findById(req.params.leaderId)
	.then((leaders)=>{
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(leaders);

	}, (err)=> next(err))
	.catch((err)=> next(err));	
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	res.statuscode=403;
	res.end('POST is not supported here in /leaders/'+req.params.leaderId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	Leaders.findByIdAndUpdate(req.params.leaderId,{

		$set: req.body

	},{new : true})
	.then((leader)=>{
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(leader);

	}, (err)=> next(err))
	.catch((err)=> next(err));	
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	Dishes.findByIdAndRemove(req.params.leaderId)
	.then((resp)=>{
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(resp);

	}, (err)=> next(err))
	.catch((err)=> next(err));	

});


module.exports= leaderRouter;
