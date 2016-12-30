// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    admin: Boolean,
    restaurants: [{type: Schema.Types.ObjectId, ref: 'Restaurant'}],
    sharedLists_own: [{type: Schema.Types.ObjectId, ref: 'SharedList'}],
    sharedLists_edit: [{type: Schema.Types.ObjectId, ref: 'SharedList'}]
});

// var restaurantSchema = Schema({
//     restaurant_name    : { type: String, required: true },
//     user: {type: Schema.Types.ObjectId, ref: 'User'}
// });

// var Restaurant = mongoose.model('Restaurant', restaurantSchema);
var User = mongoose.model('User', userSchema);


// make this available to our users in our Node applications
module.exports = User;
