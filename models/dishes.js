const mongoose= require('mongoose');
const schema= mongoose.Schema;

require('mongoose-currency').loadType(mongoose);

const currency= mongoose.Types.Currency;
const commentSchema= new schema({

	rating:{
		type: Number,
		min: 1,
		max: 5,
		required: true
	},
	author:{
		type: schema.Types.ObjectId,
		ref:'user'
	},
	comment:{
		type: String,
		required: true
	}
},{

	timestamps: true
});

const dishSchema= new schema({

	name:{
		type: String,
		required: true,
		unique: true
	},
	description:{
		type: String,
		required: true
	}, 
	image:{
		type: String,
		required: true
	},
	category:{
		type: String,
		required: true
	},
	label:{
		type: String,
		default: ''
	},
	price:{

		type: currency,
		required: true, 
		min: 0
	},
	featured:{
		type: Boolean,
		default: false

	},
	comments:[commentSchema]
},{
		timestamps: true

});

const Dishes= mongoose.model('Dish', dishSchema);

module.exports= Dishes;