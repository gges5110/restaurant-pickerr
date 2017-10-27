// Load the mongoose module
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var exports = module.exports = {};

exports.load_database = function() {
  if (process.env.MONGODB_URI === undefined || process.env.MONGODB_URI == null ) {
    throw "Please provide a process.env.MONGODB_URI variable that points to the URL of the database.";
  } else {
    // Lets connect to our database using the DB server URL.
    mongoose.connect(process.env.MONGODB_URI, function(err) {
      if (err) {
        console.log(err);
        throw "The process.env.MONGODB_URI provided is not valid.";
      } else {
        console.log('Database load successfully.');
      }
    });
  }
}

exports.close = function() {
  mongoose.disconnect(() => {
    console.log('disconnect from mongoose');
  });
}
