// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var restaurantSchema = Schema({
    yelp_id: {type: String, required: true, unique: true},
    name: { type: String, required: true },
    categories: [{type: String}],
    address: {type: String, required: true},
    rating_img_url: {type: String, required: true},
    rating: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
});

var Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
