var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../../models/user.js');
var Restaurant = require('../../models/restaurant.js');
var yelp_credentials = require('../../credentials.js');

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

    var limit = 20;
    // console.log("request.query.limit = " + request.query.limit);
    if (request.query.limit) {
        limit = request.query.limit;
    }

    yelp.search(
        {   term: term,
            // location: location,
            ll: latlng,
            limit: limit,
            sort: sort_mode
    })
    .then(function (data) {
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
                    console.log("user.restaurants.length = " + user.restaurants.length);
                    for (var i = 0; i < user.restaurants.length; ++i) {
                        restaurants.push(user.restaurants[i]);
                    }

                    console.log("restaurants length = " + restaurants.length);

                    for (var i = 0, len = data.businesses.length; i < len; ++i) {
                        var temp = {};
                        temp.yelp_id = data.businesses[i].id;
                        console.log("temp.yelp_id == " + temp.yelp_id);

                        temp.in_list = false;
                        for (var j = 0; j < restaurants.length; ++j) {
                            // console.log("obj.yelp_id == " + restaurants[j].yelp_id);
                            if (temp.yelp_id === restaurants[j].yelp_id) {
                                temp.in_list = true;
                                break;
                            }
                        }

                        console.log("in list? " + temp.in_list);

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
                }
            });

        } else {
            console.log('not request.body.email');
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
        }




    })
    .catch(function (err) {
        console.error(err);
    });

});

module.exports = router;
