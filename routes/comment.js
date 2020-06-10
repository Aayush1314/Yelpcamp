var express = require("express"),
	router = express.Router({mergeParams: true}),
	camps = require("../models/camps.js"),
	Comment = require("../models/comments.js")
// COMMENTS ROUTE
router.get("/new", isLoggedIn ,function(req, res){
	camps.findById(req.params.id, function(err, camp){
		if (err){
			console.log(err)
		}
		else{
			res.render("comments/newComment", {camp: camp})
		}
	})
})

router.post("/", isLoggedIn ,function(req, res){
	camps.findById(req.params.id, function(err, camp){
		if (err){
			console.log(err)
			res.redirect("/campgrounds")
		}
		else{
			Comment.create(req.body.comment, function(err, comment){
				if (err){
					console.log (err)
				}
				else{
					comment.author.id = req.user._id
					comment.author.username = req.user.username
					comment.save()
					camp.comments.push(comment)
					camp.save();
					res.redirect("/campgrounds/"+ camp._id)
				}
			})
		}
	})
	
})
// ===================
function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next()
	}
	else{
		res.redirect("/login")
	}
}

module.exports =  router