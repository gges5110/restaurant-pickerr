// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var sharedListSchema = Schema({
    name: { type: String, required: true },
    owner: {type: Schema.Types.ObjectId, ref: 'User'},
    users:  [{type: Schema.Types.ObjectId, ref: 'User'}],
    restaurants: [{type: Schema.Types.ObjectId, ref: 'Restaurant'}]
});

var SharedList = mongoose.model('SharedList', sharedListSchema);

module.exports = SharedList;
