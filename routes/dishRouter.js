const express= require('express');
const bodyParse= require('body-parser');

const dishRouter =express.Router();

const mongoose= require('mongoose');
const Dishes= require('../models/dishes');
var authenticate= require('../authenticate');
var cors= require('./cors');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

dishRouter.use(bodyParse.json());

dishRouter.route('/')
.options(cors.corsWithOptions, (req, res)=>{res.statuscode(200);})
.get(cors.cors, (req, res, next) =>{
	Dishes.find({})
	.populate('comments.author')
	.then((dishes)=>{
		
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(dishes);

	}, (err)=> next(err))
	.catch((err)=> next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
	Dishes.create(req.body)
	.then((dish)=>{
		console.log("Dish created: ", dish);

		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(dish);

	}, (err)=> next(err))
	.catch((err)=> next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	res.statuscode=403;
	res.end('PUT is not supported in /dishes');
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req, res, next) =>{

	Dishes.remove({})
	.then((resp)=>{

		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(resp);

	}, (err)=> next(err))
	.catch((err)=> next(err));
});


dishRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res)=>{res.statuscode(200);})
.get(cors.cors, (req, res, next) =>{
	
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dishes)=>{
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(dishes);

	}, (err)=> next(err))
	.catch((err)=> next(err));	
})
.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin,(req, res, next) =>{

	res.statuscode=403;
	res.end('POST is not supported here in /dishes/'+req.params.dishId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	Dishes.findByIdAndUpdate(req.params.dishId,{

		$set: req.body

	},{new : true})
	.then((dish)=>{
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(dish);

	}, (err)=> next(err))
	.catch((err)=> next(err));	
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{

	Dishes.findByIdAndRemove(req.params.dishId)
	.then((resp)=>{
		res.statuscode=200;
		res.setHeader('content-Type', 'application/json');
		res.json(resp);

	}, (err)=> next(err))
	.catch((err)=> next(err));	

});

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions, (req, res)=>{res.statuscode(200);})
.get(cors.cors, (req, res, next) =>{

	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish)=>{
		if(dish!= null){
			res.statuscode=200;
			res.setHeader('content-Type', 'application/json');
			res.json(dish.comments);
		}
		else{
			err= new Error("Dish: "+ req.params.dishId+ " is not found");
			err.status=404;
			return next(err);
		}

	}, (err)=> next(err))
	.catch((err)=> next(err));
})

.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) =>{

	Dishes.findById(req.params.dishId)
	.then((dish)=>{
		if(dish!= null){
			req.body.author= req.user._id;
			dish.comments.push(req.body);
			dish.save()
			.then((dish)=>{
				Dishes.findById(dish._id)
				.populate('comments.author')
				.then((dish)=>{
					res.statuscode=200;
					res.setHeader('content-Type', 'application/json');
					res.json(dish);
				});

			}, (err)=> next(err))
			.catch((err)=> next(err));
			
		}
		else{
			err= new Error("Dish "+ req.params.dishId+ " is not found");
			err.status=404;
			return next(err);
		}

	}, (err)=> next(err))
	.catch((err)=> next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) =>{

	res.statuscode=403;
	res.end('PUT is not supported in /dishes/ '+req.params.dishId);
})

.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
	Dishes.findById(req.params.dishId)
	.then((dish)=>{

		if(dish!= null){

			for(var i=(dish.comments.length -1); i>=0; i--)
				dish.comments.id(dish.comments[i]._id).remove();

			dish.save()
			.then((dish)=>{

				res.statuscode=200;
				res.setHeader('content-Type', 'application/json');
				res.json(dish);

			}, (err)=> next(err))
			.catch((err)=> next(err));
		}
		else{
			err= new Error("Dish "+ req.params.dishId+ " is not found");
			err.status=404;
			return next(err);
		}

	}, (err)=> next(err))
	.catch((err)=> next(err));
});


dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions, (req, res)=>{res.statuscode(200);})
.get(cors.cors, (req, res, next) =>{
	Dishes.findById(req.params.dishId)
	.populate('comments.author')
	.then((dish)=>{

			if(dish!=null && dish.comments.id(req.params.commentId)!=null)
			{

					res.statuscode=200;
					res.setHeader('content-Type', 'application/json');
					res.json(dish.comments.id(req.params.commentId));

			}
			else if(dish==null){
				err= new Error("Dish "+ req.params.dishId+ " is not found");
				err.status=404;
				return next(err);
			}
			else{
				err= new Error("Comments "+ req.params.commentId+ " is not found");
				err.status=404;
				return next(err);
			}

	}, (err)=> next(err))
	.catch((err)=> next(err));	
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) =>{

	res.statuscode=403;
	res.end('POST is not supported here in /dishes/'+req.params.dishId+"/comments/"+req.params.commentId);
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) =>{
		Dishes.findById(req.params.dishId)
		.then((dish)=>{
			var id1= dish.comments.id(req.params.commentId).author._id;
	 		var id2= req.user._id;
			if(dish!=null && dish.comments.id(req.params.commentId)!=null && id1.equals(id2))
				{
					if(req.body.rating)
						dish.comments.id(req.params.commentId).rating= req.body.rating;	

					if(req.body.comment)
						dish.comments.id(req.params.commentId).comment= req.body.comment;
					dish.save()
					.then((dish)=>{
						Dishes.findById(dish._id)
						.populate('comments.author')
						.then((dish)=>{
							res.statuscode=200;
							res.setHeader('content-Type', 'application/json');
							res.json(dish);
						});
					}, (err)=>{
							err= new Error("value of id1= "+ id1 + " "+ id2);
						 	 return next(err);
						});

				}
				else if(dish==null){
					err= new Error("Dish "+ req.params.dishId+ " is not found");
					err.status=404;
					return next(err);
				}
				else if(dish.comments.id(req.params.commentId)==null){
					err= new Error("Comments "+ req.params.commentId+ " is not found");
					err.status=404;
					return next(err);
				}
				else{

					err= new Error("You are not authorized to perform this operation..!!");
					err.status=403;
					return next(err);
				}
		}, (err)=> next(err))
		.catch((err)=> next(err));
})

.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) =>{

		Dishes.findById(req.params.dishId)
		.then((dish)=>{
			if(dish!=null && dish.comments.id(req.params.commentId)!=null && (dish.comments.id(req.params.commentId).author._id).equals(req.user._id))
				{
					dish.comments.id(req.params.commentId).remove();

					dish.save()
					.then((dish)=>{

						Dishes.findById(dish._id)
						.populate('comments.author')
						.then((dish)=>{
							res.statuscode=200;
							res.setHeader('content-Type', 'application/json');
							res.json(dish);
						});

					}, (err)=> next(err))
					.catch((err)=> next(err))

				}
				else if(dish==null){
					err= new Error("Dish "+ req.params.dishId+ " is not found");
					err.status=404;
					return next(err);
				}
				else if(dish.comments.id(req.params.commentId)==null){
					err= new Error("Comments "+ req.params.commentId+ " is not found");
					err.status=404;
					return next(err);
				}
				else{

					err= new Error("You are not authorized to perform this operation..!!")
					err.status=403;
					return next(err);
				}

		}, (err)=> next(err))
		.catch((err)=> next(err));
});

module.exports= dishRouter;
