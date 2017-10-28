var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../models/user.js');
var Restaurant = require('../../models/restaurant.js');

var yelp_credentials;
if (process.env.YELP_CREDENTIALS_CONSUMER_KEY != null &&
  process.env.YELP_CREDENTIALS_CONSUMER_SECRET != null &&
  process.env.YELP_CREDENTIALS_TOKEN != null &&
  process.env.YELP_CREDENTIALS_TOKEN_SECRET != null) {
  yelp_credentials = {};
  yelp_credentials.consumer_key = process.env.YELP_CREDENTIALS_CONSUMER_KEY;
  yelp_credentials.consumer_secret = process.env.YELP_CREDENTIALS_CONSUMER_SECRET;
  yelp_credentials.token = process.env.YELP_CREDENTIALS_TOKEN;
  yelp_credentials.token_secret = process.env.YELP_CREDENTIALS_TOKEN_SECRET;
  console.log('Using Yelp credentials from env variables.')
} else {
  throw 'Please put Yelp credentials in .env, learn more in README.md';
}

var Yelp = require('yelp');

var yelp = new Yelp({
  consumer_key: yelp_credentials.consumer_key,
  consumer_secret: yelp_credentials.consumer_secret,
  token: yelp_credentials.token,
  token_secret: yelp_credentials.token_secret,
});

router.get('/api/yelp', function(request, response) {
    var lat = 0;
    var lng = 0;
    var latlng = "";
    var sort_mode = 0;
    var term = 'Japanese food';
    var location = "";

    if (request.query.lat && request.query.lng) {
        lat = request.query.lat;
        lng = request.query.lng;
        latlng = lat.toString() + "," + lng.toString();
    }

    if (request.query.sort_mode) {
        sort_mode = request.query.sort_mode;
    }

    if (request.query.zipcode) {
        var location = request.query.zipcode;
    }

    console.log("location: " + location);

    // See http://www.yelp.com/developers/documentation/v2/search_api

    if (request.query.term) {
        term = request.query.term;
        console.log("New term: " + term);
    }

    var limit = 20;
    if (request.query.limit) {
        limit = request.query.limit;
    }



    var yelpSearchCallback = function (data) {
        // TODO: parse JSON here.

        var myObject = {};
        myObject.total = data.total;
        items = [];

        if (request.session.email) {
            console.log('request.session.email = ' + request.session.email);

            // The user has logged in, check if there's any restaurant that's in the list
            var restaurants = [];

            User.findOne({email: request.session.email}).populate('restaurants').exec(function(err, user) {
                console.log("searching ");
                if (err) {
                    console.log('err');
                } else if(user) {
                    for (var i = 0; i < user.restaurants.length; ++i) {
                        restaurants.push(user.restaurants[i]);
                    }

                    for (var i = 0, len = data.businesses.length; i < len; ++i) {
                        var temp = {};
                        temp.yelp_id = data.businesses[i].id;

                        temp.in_list = false;
                        for (var j = 0; j < restaurants.length; ++j) {
                            // console.log("obj.yelp_id == " + restaurants[j].yelp_id);
                            if (temp.yelp_id === restaurants[j].yelp_id) {
                                temp.in_list = true;
                                break;
                            }
                        }

                        temp.rating = data.businesses[i].rating;
                        temp.name = data.businesses[i].name;
                        temp.categories = [];
                        for (var j = 0, len_cat = data.businesses[i].categories.length; j < len_cat; ++j) {
                            temp.categories.push(data.businesses[i].categories[j][0]);
                        }
                        temp.address = "";
                        for (var j = 0; j < data.businesses[i].location.address.length; ++j) {
                            temp.address += data.businesses[i].location.address[j] + " ";
                        }
                        temp.display_address = "";
                        for (var j = 0; j < data.businesses[i].location.display_address.length; ++j) {
                            temp.display_address += data.businesses[i].location.display_address[j] + " ";
                        }

                        temp.rating_img_url = data.businesses[i].rating_img_url;
                        temp.url = data.businesses[i].url;

                        items.push(temp);
                    }

                    myObject.results = items;

                    // console.log(data);
                    response.send(myObject);
                }
            });

        } else {
            console.log('User did not log in.');
            for (var i = 0, len = data.businesses.length; i < len; ++i) {
                var temp = {};
                temp.yelp_id = data.businesses[i].id;
                temp.rating = data.businesses[i].rating;
                temp.name = data.businesses[i].name;
                temp.categories = [];
                for (var j = 0, len_cat = data.businesses[i].categories.length; j < len_cat; ++j) {
                    temp.categories.push(data.businesses[i].categories[j][0]);
                }
                temp.address = "";
                for (var j = 0; j < data.businesses[i].location.address.length; ++j) {
                    temp.address += data.businesses[i].location.address[j] + " ";
                }
                temp.display_address = "";
                for (var j = 0; j < data.businesses[i].location.display_address.length; ++j) {
                    temp.display_address += data.businesses[i].location.display_address[j] + " ";
                }

                temp.rating_img_url = data.businesses[i].rating_img_url;
                temp.url = data.businesses[i].url;

                items.push(temp);
            }

            myObject.results = items;

            // console.log(data);
            response.send(myObject);
        }
    };

    if (request.query.lat && request.query.lng) {
        yelp.search(
            {   term: term,
                ll: latlng,
                limit: limit,
                sort: sort_mode
        })
        .then(yelpSearchCallback)
        .catch(function (err) {
            console.error(err);
        });
    } else {
        yelp.search(
            {   term: term,
                location: location,
                limit: limit,
                sort: sort_mode
        })
        .then(yelpSearchCallback)
        .catch(function (err) {
            console.error(err);
        });
    }

});

module.exports = router;
