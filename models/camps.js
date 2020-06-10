var mongoose= require("mongoose")
// SETTING THE SCHEMA-----START 
var camp_schema=new mongoose.Schema({
	name: String,
	img: String,
	description: String,
	comments:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref : "comment"
		}
	],
	user: {
		id:{
			type: mongoose.Schema.Types.ObjectId  ,
			ref: "user"
		},
		username : String
	} 
})
// SETTING THE SCHEMA-----END 

// CREATING A COLLECTION IN DATABASE------START
module.exports = mongoose.model("camp", camp_schema)
// CREATING A COLLECTION IN DATABASE------END