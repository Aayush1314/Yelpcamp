var express = require("express")
var router = express.Router()
var camps = require("../models/camps.js")
var methodOverride = require("method-override")

router.use(methodOverride("_method"))
//LIST OF CAMPS

router.get("/", function(req,res){
	camps.find({}, function(err, campgrounds){
		if (err){
			console.log("ERROR")
		}
		else{	
		res.render("camps/campgrounds",{campgrounds:campgrounds})
		} 
	})
})

//ENTRIES TO ADD NEW CAMP(FORM PAGE)
router.get("/new", isLoggedIn ,function(req,res){
	res.render("camps/addcampground")
})

//ADDING NEW CAMP
router.post("/", isLoggedIn ,function(req,res){
	// GET DATA FROM FORM-------START
	var name = req.body.groundName
	var Img = req.body.groundImg
	var campDecs= req.body.groundDecs
	// GET DATA FROM FORM-------END
	camps.create({
		name: name,
		img: Img,
		description: campDecs
	}, function(err, camps){
		if (err){
			console.log("ERROR")
		}
		else{
			camps.user.id = req.user._id
			camps.user.username = req.user.username
			camps.save()
			console.log(camps)
			console.log("CAMPGROUND ADDED")
		}
	})
	
	
	res.redirect("/campgrounds")
})
 

//SHOW PAGE 
router.get("/:id", function(req,res){
/* 	  var id= req.params.id
	  camps.find({_id: id}, function(err, desc){
		if (err){
			console.log("ERROR")
		}
		else{
			console.log(desc[0].description)
			res.render("show", {description: desc[0].description})			
		}
	    })  */
	camps.findById(req.params.id).populate("comments").exec(function(err, selectedCamp){
		if(err){
			console.log(err)
		}
		else{
			res.render("camps/show", {selectedCamp: selectedCamp})			
		}
	})
})

//EDIT ROUTES
router.get("/:id/edit", campAuthorization ,function(req, res){
	camps.findById(req.params.id, function(err, camp){
		res.render("camps/edit", {camp: camp})
		
	})
})

//UPDATE ROUTE
router.put("/:id", campAuthorization ,function(req, res){
	camps.findByIdAndUpdate(req.params.id, req.body.camp, function(err, updatedCamp){
		if (err){
			console.log(err)
		}
		else{
			console.log("updatedCamp")
			console.log(updatedCamp)
			console.log("updatedCamp")
			res.redirect("/campgrounds/"+ req.params.id)
		}
	})
})
//DELETE ROUTE
router.delete("/:id", campAuthorization ,function(req,res){
	camps.findByIdAndDelete(req.params.id, function(err){
		if (err){
			console.log(err)
		}
		else{
			res.redirect("/campgrounds")
		}
	})
})

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next()
	}
	else{
		req.flash("error", "Oopss!! Seems like you are not logged in.")
		res.redirect("/login")
	}
}

function campAuthorization(req,res, next){
	if(req.isAuthenticated()){
		camps.findById(req.params.id , function(err, selectedCamp){
			if(err){
				console.log(err)
			}
			else{
				if (selectedCamp.user.id.equals(req.user._id)){
					next()	
					}	
				else{
					res.redirect("back")
				}
			}
		})		
	}
	else{
		res.redirect("back")
	}

	
}
module.exports = router