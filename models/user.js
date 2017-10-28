// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    admin: Boolean,
    restaurants: [{type: Schema.Types.ObjectId, ref: 'Restaurant'}],
    sharedLists_own: [{type: Schema.Types.ObjectId, ref: 'SharedList'}],
    sharedLists_edit: [{type: Schema.Types.ObjectId, ref: 'SharedList'}]
});

var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;
