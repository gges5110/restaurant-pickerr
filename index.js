var express = require('express');
var http = require('http');
var app = express();

//Lets load the mongoose module in our program

// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// // Lets connect to our database using the DB server URL.
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/test');
//
// var User = require('./models/user.js');
// var Restaurant = require('./models/restaurant.js');

// app.use(express.cookieParser());
// app.use(express.session({secret: '1234567890QWERTY'}));

var Yelp = require('yelp');

var yelp = new Yelp({
  consumer_key: 'BDDpqRi_l39ukI1xzZvYZg',
  consumer_secret: 'KJ8PaIX5h__k3eALmFxg4FWDe_Q',
  token: '41qYetCOIEc90c8suCTr9X0OL1YSUmyT',
  token_secret: 'SmTq0fSDC5Z8ICgSSLTHd3r7efU',
});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//------------------------------------
//          TEMPLATE ROUTING
//------------------------------------

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/geolocation', function(request, response) {
    response.render('pages/geolocation');
});

app.get('/getGeocode', function(request, response) {
    response.render('pages/getGeocode');
});

app.get('/yelp', function(request, response) {
    response.render('pages/yelp');
});

app.get('/bucketlist', function(request, response) {
    response.render('pages/bucketlist');
});

app.get('/login', function(request, response) {
    response.render('pages/login.ejs');
});

//------------------------------------
//       DATABASE OPERATIONS
//------------------------------------

app.get('/db/user/create', function(request, response) {
    var name = request.query.name;
    var email = request.query.email;
    var password = request.query.password;

    var new_user = new User({
        name: name,
        username: email,
        password: password,
    });

    new_user.save(function(err) {
        if(err) {
            console.log(err);
            response.send({
                message: err.errmsg
            });
        } else {
            response.send({
                message:'success'
            });
        }
    });
});

app.get('/db/user/get', function(request, response) {
    var email = request.query.email;

    // get the user starlord55
    User.find({ username: email }, function(err, user) {
      if (err) throw err;

      response.send({
          message :'success',
          name: user.name,
          password: user.password
      });

      // object of the user
      console.log(user);
    });

});

//------------------------------------
//              API ENDPOINT
//------------------------------------

app.get('/api/yelp_detailed', function(request, response) {
    var lat = request.query.lat;
    var lng = request.query.lng;
    latlng = lat.toString() + "," + lng.toString();
    var location = request.query.zipcode;

    // See http://www.yelp.com/developers/documentation/v2/search_api
    yelp.search(
        {   term: 'Japanese food',
            location: location,
            cll: latlng,
    })
    .then(function (data) {
        response.send(data);
    })
    .catch(function (err) {
        console.error(err);
    });


});

app.get('/api/yelp', function(request, response) {
    var lat = 0;
    var lng = 0;

    if (request.query.lat) {
        lat = request.query.lat;
    }
    if (request.query.lng) {
        lng = request.query.lng
    }

    var sort_mode = 0;
    if (request.query.sort_mode) {
        sort_mode = request.query.sort_mode;
    }

    latlng = lat.toString() + "," + lng.toString();

    var location = request.query.zipcode;
    // See http://www.yelp.com/developers/documentation/v2/search_api
    var term = 'Japanese food';
    if (request.query.term) {
        term = request.query.term;
        console.log("New term: " + term);
    }

    var limit = 5;
    // console.log("request.query.limit = " + request.query.limit);
    if (request.query.limit) {
        limit = request.query.limit;
    }

    yelp.search(
        {   term: term,
            location: location,
            cll: latlng,
            limit: limit,
            sort: sort_mode
    })
    .then(function (data) {
        // TODO: parse JSON here.

        var myObject = {};
        myObject.total = data.total;

        items = [];
        for (var i = 0, len = data.businesses.length; i < len; ++i) {
            var temp = {};
            temp.rating = data.businesses[i].rating;
            temp.name = data.businesses[i].name;
            temp.categories = [];
            for (var j = 0, len_cat = data.businesses[i].categories.length; j < len_cat; ++j) {
                temp.categories.push(data.businesses[i].categories[j][0]);
            }
            temp.address = "";
            for (var j = 0; j < data.businesses[i].location.display_address.length; ++j) {
                temp.address += data.businesses[i].location.display_address[j] + " ";
            }

            temp.rating_img_url = data.businesses[i].rating_img_url;
            temp.url = data.businesses[i].url;

            items.push(temp);
        }
        myObject.results = items;

        // console.log(data);
        response.send(myObject);
    })
    .catch(function (err) {
        console.error(err);
    });


});

app.get('/api/geocode', function(request, response) {
    var latitude = request.query.lat;
    var longitude = request.query.long;
    console.log("/api/geocode: latitude = " + latitude);
    console.log(", longitude = " + longitude);

    var options = {
        host: 'maps.googleapis.com',
        path: '/maps/api/geocode/json?latlng=' + latitude + "," + longitude
    };

    callback = function(res) {
        var str = '';

        res.on('data', function(chunk) {
            str += chunk;
        });

        res.on('end', function () {
            // TODO: parse JSON here.
            var jsonObject = JSON.parse(str);
            response.send(jsonObject);
        });
    }

    http.request(options, callback).end();
});



app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
