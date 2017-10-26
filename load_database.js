//Load the mongoose module in our program
var mongoose = require('mongoose');
// // Lets connect to our database using the DB server URL.
mongoose.Promise = global.Promise;

var load_database = function() {
  if (process.env.MONGODB_URI === undefined || process.env.MONGODB_URI === null ) {
    throw "Please provide a process.env.MONGODB_URI variable that points to the URL of the database.";
  } else {
    mongoose.connect(process.env.MONGODB_URI, function(err) {
      if (err) {
        throw "The process.env.MONGODB_URI provided is not valid.";
      } else {
        console.log('Database load successfully.');
      }
    });
  }
}

module.exports = load_database;
