var express = require('express');
var multer = require('multer');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');

// File upload setup
var upload = multer({ dest: './uploads' });

// Rute
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', {
    'title': 'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login', {
    'title': 'Log In'
  });
});

router.post('/register', upload.single('profileimage'), function(req, res, next) {
  // Vrijednosti
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  // Slika
  if(req.file){
    console.log('Slika se uploada...');

    // Info o datoteci
    var profileImageOriginalName = req.file.originalname;
    var profileImageName = req.file.name;
    var profileImageMime = req.file.mimetype;
    var profileImagePath = req.file.path;
    var profileImageExt = req.file.extension;
    var profileImageSize = req.file.size;
  } else {
    // Default slika
    var profileImageName = 'noimage.png';
  }

  // Validacija
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  // Error provjere
  var errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors: errors,
      name: name,
      email: email,
      username: username,
      password: password,
      password2: password2
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileImageName
    });

    // Create User
    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    // Success poruka
    req.flash('success','You are now registered and may log in');
    
    res.location('/users/login');
    res.redirect('/users/login');
  }
});

// used to serialize the user for the session
passport.serializeUser(function(user, done) {
    done(null, user.id); 
   // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function(username, password, done){
  User.getUserByUsername(username, function(err, user){
    if(err) {return done(err);}
    if(!user){
      console.log('Unknown user');
      return done(null, false, {message: 'Unknown user'});
    }
    User.comparePassword(password, user.password, function(err, isMatch) {
      if (err) throw err;
      if(isMatch) {
        return done(null, user);
      } else {
        console.log('Invalid password');
        return done(null, false, {message: 'Invalid password'});
      }
    });
  });
}));

router.post('/login', passport.authenticate('local', { successRedirect: '/',
  failureRedirect: '/users/login', successFlash: 'Logged in',
  failureFlash: 'Username or password invalid' }));

router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You have logged out');
  res.location('/users/login');
  res.redirect('/users/login');
});

module.exports = router;
