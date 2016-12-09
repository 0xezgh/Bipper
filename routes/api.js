var express = require('express');
var router = express.Router();
var mongoose = require( 'mongoose' );
var Model = require('../models/models');

//Used for routes that must be authenticated.
function isAuthenticated (req, res, next) {
    // if user is authenticated in the session, call the next() to call the next request handler


    //allowing everybody to see the beeps
    if(req.method === "GET"){
        return next();
    }
    //authenticated user can keep going
    if (req.isAuthenticated()){
        return next();
    }

    // if the user is not authenticated then redirect him to the login page
    return res.redirect('/#login');
};

//Register the authentication middleware
router.use('/beeps', isAuthenticated);

//api for all beeps (beeps are equivalent of tweets, posts, messages ...)
router.route('/beeps')

    //create a new beep
    .post(function(req, res){

        var beep = new Model.Beep();
        beep.text = req.body.text;
        beep.created_by = req.body.created_by;
        beep.save(function(err, beep) {
            if (err){
                console.log(err);
                return res.send(500, err);
            }
            return res.json(beep);
        });
    })
    //return all beeps
    .get(function(req, res){

        Model.Beep.find()

            .populate('user')
            .exec(function (err, data) {
                if (err) {
                    return res.send(500, err);
                }
                return res.send(data);
            });
    })

//api for a specific beep
router.route('/beeps/:id')

    //getting an existing beep
    .get(function(req, res){
        Model.Beep.findById(req.params.id, function(err, beep){
            if(err)
                res.send(err);
            res.json(beep);
        });
    })
    //updating an existing beep
    .put(function(req, res){
        Model.Beep.findById(req.params.id, function(err, beep){
            if(err)
                res.send(err);

            beep.created_by = req.body.created_by;
            beep.text = req.body.text;

            beep.save(function(err, beep){
                if(err)
                    res.send(err);

                res.json(beep);
            });
        });
    })
    //deleting an existing beep
    .delete(function(req, res) {
        Model.Beep.remove({
            _id: req.params.id
        }, function(err) {
            if (err)
                res.send(err);
            res.json("deleted :(");
        });
    });

module.exports = router;