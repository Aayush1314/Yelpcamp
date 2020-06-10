// PACKAGES REQUIRE---------------START
var express = require("express"),
	app = express(),
	mongoose = require("mongoose"),
	bodyParser = require("body-parser"),
	flash = require("connect-flash"),
	methodOverride = require("method-override"),
	passport = require("passport"),
	localStrategy = require("passport-local"),
	seedDB = require("./seed.js"),
	user = require("./models/users.js"),
	camps = require("./models/camps.js"),
	Comment = require("./models/comments.js")


	//comments = require("./models/comments.js")

var commentsRoute = require("./routes/comment"),
	campsRoute = require("./routes/camps"),
	indexRoute = require("./routes/index")

// PACKAGES REQUIRE----------------END


// CONNECTING TO DATABASE-------START
mongoose.connect("mongodb://localhost/YelpCamp", {useNewUrlParser: true, useUnifiedTopology: true})
// CONNECTING TO DATABASE-------END

//seedDB();

//app.set, app.use etc SECTION-----START
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static( __dirname + "/styles"))
app.use(methodOverride("_method"))
app.use(flash())
//app.set, app.use etc SECTION-----EN



//PASSPORT CONFIG-----------
app.use(require("express-session")({
	secret: "I am aayush",
	resave: false,
	saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrategy(user.authenticate()))
passport.serializeUser(user.serializeUser())
passport.deserializeUser(user.deserializeUser())

app.use(function(req,res,next){
	res.locals.currentUser= req.user
	res.locals.error= req.flash("error")
	res.locals.success= req.flash("success")
	next()
})


app.use("/",indexRoute);
app.use("/campgrounds", campsRoute);
app.use("/campgrounds/:id/comment", commentsRoute);




app.listen(3000, function(){
	console.log("SERVER STARTED")
})