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

app.get('/yelp/:userId', function(request, response) {
    var lat = 30.289;
    var lon = -97.752;
    latlon = lat.toString() + "," + lon.toString();
    // See http://www.yelp.com/developers/documentation/v2/search_api
    yelp.search({ term: 'Japanese food', cll: latlon })
    .then(function (data) {
      console.log(data);
      response.send(data);
    })
    .catch(function (err) {
      console.error(err);
    });


});

app.get('/geocode', function(request, response) {
    var latitude = request.query.lat;
    var longitude = request.query.long;
    console.log(latitude);
    console.log(longitude);

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
            var jsonObject = JSON.parse(str);
            response.send(jsonObject);
        });
    }

    http.request(options, callback).end();
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
