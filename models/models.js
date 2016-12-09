/**
 * Created by mohamedezzedine on 08/12/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new mongoose.Schema({
    username: String,
    password: String,
    created_at: {type: Date, default: Date.now}
});

var Beep = new mongoose.Schema({
    created_by: String,
    created_at: { type: Date, default: Date.now},
    text: String
});


//declaration of models with respective schemas
var User = mongoose.model('User', User);
var Beep = mongoose.model('Beep', Beep);

module.exports={
    User:User,
    Beep:Beep
}