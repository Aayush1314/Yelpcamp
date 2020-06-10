var mongoose= require("mongoose")
var passportLocalMongoose= require("passport-local-mongoose")

// SETTING THE SCHEMA-----START 
var user_schema=new mongoose.Schema({
	username: {type: String, unique: true, required: true},
	password: String,
	email: {type: String, unique: true, required: true},
	resetPasswordToken : String,
    resetPasswordExpires :  Date // 1 hour
})
// SETTING THE SCHEMA-----END 

user_schema.plugin(passportLocalMongoose)

// CREATING A COLLECTION IN DATABASE------START
module.exports = mongoose.model("user", user_schema)
// CREATING A COLLECTION IN DATABASE------END