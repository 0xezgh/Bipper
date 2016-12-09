/**
 * Created by mohamedezzedine on 07/12/2016.
 */
var mongoose = require('mongoose');
var Model = require('./models/models');
var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');


module.exports = function(passport){

    // Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user:', user._id);
        //return the unique id for the user (the default id provided by mongoDB)
        return done(null, user._id);
    });

//Desieralize user will call with the unique id provided by serializeuser
    passport.deserializeUser(function(id, done) {

        Model.User.findById(id, function(err, user){

            //in case there's a mongoDB error
            if (err){
                return done (err, false);
            }
            //If no user with this username is found
            if (!user){
                return done(null, false, { message: 'Incorrect username.' });
            }
            return done(null,user);
        });



    });

    passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {

            Model.User.findOne({username: username}, function(err,user){

                //In case there's a mongoDB error
                if (err){
                    return done(err, false);
                }
                //If no user with this username is found
                if (!user){
                    console.log('user '+ username + ' not found');
                    return done(null, false, { message: 'Incorrect username.' });
                }
                //If entered password is incorrect
                if (!isValidPassword(user, password)){
                    console.log('Incorrect password for '+ username);
                    return done(null, false, { message: 'Incorrect password.' });
                }
                //if everything is okay after all this statements (finally...)
                return done(null, user);
            });
        }
    ));

    passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {

            //Checking if there's already a user with the entered username
            Model.User.findOne({username: username}, function(err, user){

                //in case there's a mongoDB error
                if (err){
                    return done(err, false);
                }
                //displaying a message if the username is taken
                if (user){
                    return done('username already taken', false);
                }

            });

            //if not, we register the new user
            var user = new Model.User();
            //setting up the user's local credentials
            user.username = req.body.username;
            user.password = createHash(req.body.password);
            //saving the user
            user.save(function(err, user){

                if (err){
                    return done(err, false)
                }
                console.log('successfully registered user '+ username);
                return done(null,user);
            });

        })
    );

    var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    };
    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    };

};