// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var restaurantSchema = Schema({
    restaurant_name    : { type: String, required: true },
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});

var Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
