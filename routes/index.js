var express = require("express"),
	router = express.Router(),
	passport = require("passport"),
	user = require("../models/users.js"),
	camps = require("../models/camps.js"),
	async = require("async"),
	crypto = require("crypto"),
	nodemailer = require("nodemailer")
	
//INDEX ROUTE
router.get("/", function(req,res){
	res.render("camps/index")
	console.log(req.route.path)
})

//AUTH ROUTES
router.get("/register", function(req, res){
	res.render("auth/register")
})

router.post("/register", function(req, res){
	var newUser = new user({username:req.body.username, email: req.body.email})
	user.register( newUser, req.body.password, function(err, user){
		if (err){
			req.flash("error", err.message)
			return res.redirect("/register")
		}	
		passport.authenticate("local")(req,res,function(){
			console.log(user)
			req.flash("success", "Welcome to Yelpcamp " + user.username)
			res.redirect("/campgrounds")
		})
	})
})


router.get("/login", function(req, res){
	res.render("auth/login")
})

router.post("/login", passport.authenticate("local", {
	successRedirect: "/campgrounds",
	failureRedirect: "/login"
}) ,function(req, res){
})

router.get("/logout", function(req,res){
	req.logout()
	req.flash("success", "Logged You Out!!")
	res.redirect("/campgrounds")
})

router.get("/forgot", function(req, res){
	res.render("auth/forgotPassword")
})

router.post("/forgot", function(req, res){
	async.waterfall([
		
		function(done){
			crypto.randomBytes(20, function(err, buff){
				var token = buff.toString("hex")
				console.log(token)
				done(err, token)
			})
		},
		
		function(token, done){
			user.findOne({ email: req.body.email }, function(err, user) {
        		if (!user) {
          			req.flash('error', 'No account with that email address exists.');
          			return res.redirect('/forgot');
				}	
				user.resetPasswordToken = token;
        		console.log(token)
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
				user.save(function(err){
					done(err, token, user)
				})
			})		
		},
		
		function(token, user, done) {
      		var smtpTransport = nodemailer.createTransport({
       			service: 'gmail', 
       			host: 'smtp.gmail.com', 
       			auth: {
          			user: 'aayushjainchandwar@gmail.com',
          			pass: ********
        		}
      		});
      		var mailOptions = {
        		to: user.email,
        		from: 'aayushjainchandwar@gmail.com',
        		subject: 'Node.js Password Reset',
        		text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      	smtpTransport.sendMail(mailOptions, function(err) {
        	console.log('mail sent');
        	console.log(token);
        	req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        	done(err, 'done');
      });
    }
			
	], function(err){
		  if (err){
			return next(err)
		  } 
    		res.redirect('/forgot');  
	})
})

router.get("/reset/:token", function(req, res){
	user.findOne({resetPasswordToken: req.params.token ,resetPasswordExpires:{$gt:Date.now()}}, function(err, user){
		if (err){
			req.flash("'error', 'Password reset token is invalid or has expired.'")
			res.redirect("/forgot")
		}
		res.render("auth/reset", {token: req.params.token})
	})	
})

router.post("/reset/:token", function(req, res){
	async.waterfall([
    	function(done) {
      		user.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        		if (!user) {
          			req.flash('error', 'Password reset token is invalid or has expired.');
          			return res.redirect('back');
        		}
        		if(req.body.password === req.body.confirm) {
          			user.setPassword(req.body.password, function(err) {
            			user.resetPasswordToken = undefined;
            			user.resetPasswordExpires = undefined;
						user.save(function(err) {
              				req.logIn(user, function(err) {
               					done(err, user);
              				});
            			});
         			 })
        		} else {
            		req.flash("error", "Passwords do not match.");
            		return res.redirect('back');
        			}
    		});
    	},
    	function(user, done) {
      		var smtpTransport = nodemailer.createTransport({
        		service: 'gmail',
				host:"smtp.gmail.com",
        		auth: {
          			user: 'aayushjainchandwar@gmail.com',
          			pass: *********
        		}
      		});
      		var mailOptions = {
        		to: user.email,
        		from: 'aayushjainchandwar@gmail.com',
        		subject: 'Your password has been changed',
        		text: 'Hello,\n\n' +'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      		};
      		smtpTransport.sendMail(mailOptions, function(err) {
        		req.flash('success', 'Success! Your password has been changed.');
        		done(err);
      		});
    	}
  		],function(err) {
    		res.redirect('/campgrounds');
  		});	
})


function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next()
	}
	else{
		req.flash("error", "Please Login First!!")
		res.redirect("/login")
	}
}


//ALL THE ROUTES-------END

module.exports = router
