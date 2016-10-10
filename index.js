var express = require('express');
var http = require('http');
var app = express();

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
            limit: 5
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
            limit: limit
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
