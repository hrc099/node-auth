var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var db = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/nodeauth');

// Schema
var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String, required: true, bcrypt: true
    },
    email: {
        type: String
    },
    name: {
        type: String
    },
    profileimage: {
        type: String
    }
}, { collection: 'users' });

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if (err) return callback(err);
        callback(null, isMatch);
    });
};

module.exports.getUserByUsername = function(username, callback){
    var query = { 'username': username };
    User.findOne(query, callback);
};

module.exports.createUser = function(newUser, callback){
    bcrypt.hash(newUser.password, 10, function(err, hash){
        if(err) throw err;
        // Postavljanje hash pw-a
        newUser.password = hash;
        // Save usera
        newUser.save(callback);
    });
};