var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favoriteSchema = Schema({
  restaurant: {type: Schema.Types.ObjectId, ref: 'Restaurant', required: true},
  time: {type:Date, default: Date.now}
});

var Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
