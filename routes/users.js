var express = require('express');
var multer = require('multer');
var router = express.Router();

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
    var profileImageName = 'noimage.png'
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
    /*User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });*/

    // Success poruka
    req.flash('success','You are now registered and may log in');
    
    res.location('/');
    res.redirect('/');
  }
});

module.exports = router;
