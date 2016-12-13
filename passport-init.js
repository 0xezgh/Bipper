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

            // find a user in mongo with provided username
            Model.User.findOne({ 'username' :  username }, function(err, user) {
                // In case of any error, return using the done method
                if (err){
                    console.log('Error in SignUp: '+err);
                    return done(err);
                }
                // already exists
                if (user) {
                    console.log('User already exists with username: '+username);
                    return done(null, false);
                } else {
                    // if there is no user, create the user
                    var newUser = new Model.User();

                    // set the user's local credentials
                    newUser.username = username;
                    newUser.password = createHash(password);

                    // save the user
                    newUser.save(function(err) {
                        if (err){
                            console.log('Error in Saving user: '+err);
                            throw err;
                        }
                        console.log(newUser.username + ' Registration successful');
                        return done(null, newUser);
                    });
                }
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