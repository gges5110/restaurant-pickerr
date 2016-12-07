var express = require('express');
var http = require('http');

var session = require('express-session');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.use(cookieParser('ssshhhhh'));
app.use(session({
    secret: 'ssshhhhh',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        maxAge: 6000000
    }
}));
// var my_session;

//Lets load the mongoose module in our program

var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// // Lets connect to our database using the DB server URL.
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://gges5110:gges5110@ds031975.mlab.com:31975/heroku_dm7pmptx' || 'mongodb://localhost/test');

var User = require('./models/user.js');
var Restaurant = require('./models/restaurant.js');
var SharedList = require('./models/sharedList.js');

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
    var login = false;
    var email, name;
    console.log("in!");
    if (request.session && request.session.email && request.session.email != null) {
        console.log("session: " + request.session);
        console.log("email: " + request.session.email);
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

  response.render('pages/index', {
      login: login,
      email: email,
      name: name
  });
});

app.get('/geolocation', function(request, response) {
  response.render('pages/geolocation', {});
});

app.get('/getGeocode', function(request, response) {
    response.render('pages/getGeocode');
});

app.get('/user_settings', function(request, response) {
    var login = false;
    var email, name;
    if (request.session && request.session.email) {
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

    response.render('pages/user_settings', {
        login: login,
        email: email,
        name: name
    });
})

app.get('/yelp', function(request, response) {
    var login = false;
    var email, name;
    if (request.session && request.session.email) {
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

    response.render('pages/yelp', {
        login: login,
        email: email,
        name: name
    });
});

app.get('/bucketlist', function(request, response) {
    var login = false;
    var email, name;
    if (request.session && request.session.email) {
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

    var restaurants = [];
    // Query database and get bucket restaurants
    User.findOne({email: email}).populate('restaurants').exec(function(err, user) {
        if (err) {
            console.log('err');
        } else if(!user) {
            response.render('pages/bucketlist', {
                login: login,
                email: email,
                name: name
            });
            return;
        } else {
            console.log("user res len = " + user.restaurants.length);
            for (var i = 0; i < user.restaurants.length; ++i) {
                restaurants.push(user.restaurants[i]);
            }

            response.render('pages/bucketlist', {
                login: login,
                email: email,
                name: name,
                restaurants: user.restaurants
            });
        }
    });

});

app.get('/manage_shared_list', function(request, response) {
    var login = false;
    var email, name;
    if (request.session && request.session.email) {
        login = true;
        email = request.session.email;
        name = request.session.name;
    }

    response.render('pages/manage_shared_list', {
        login: login,
        email: email,
        name: name
    });
});

app.get('/login', function(request, response) {
    my_session = request.session;

    var login = false;
    var email, name;
    if (my_session && my_session.email) {
        login = true;
        email = my_session.email;
        name = my_session.name;
    }

    response.render('pages/login.ejs', {
        login: login,
        email: email,
        name: name
    });
});

app.post('/logout', function(request, response) {
    my_session = request.session;

    request.session.destroy(function(err) {
        if (err) {
            response.send({
                msg: err
            });
        } else {

            response.redirect('/login');
        }
    });
    // request.logout();
    request.session = null;

});

//------------------------------------
//       DATABASE OPERATIONS
//------------------------------------

app.post('/db/user/create', function(request, response) {
    var name = request.body.name;
    var email = request.body.email;
    var password = request.body.password;

    console.log(email);

    // Find if the user exist.
    User.find({email: email}).exec(function(err, data) {
        if (data.length != 0) {
            console.log("User found: " + data.length);
            response.send({
                message: 'You have already signed up before.',
                status: 'error',
            });
        } else {
            console.log("email is unique");

            var new_user = new User({
                name: name,
                email: email,
                password: password
            });

            new_user.save(function(err) {
                if(err) {
                    console.log(err);
                    response.send({
                        message: err.errmsg
                    });
                } else {
                    request.session.email = email;
                    request.session.name = name;
                    response.send({
                        message:'success'
                    });
                }
            });
        }
    });
});

app.post('/db/user/login', function(request, response) {
    // my_session = request.session;
    var email = request.body.email;
    var password = request.body.password;

    // get the user
    User.find({ email: email }, function(err, user) {
      if (user.length == 0) {
          console.log("user.length: " + user.length);
          // Could not find the user.
          response.send({
              message :'Could not find the user or the password is incorrect.',
              status: "error"
          });
      } else {
          if (user[0].password === password) {
              // Successfully login!
              request.session.email = user[0].email;
              request.session.name = user[0].name;

              response.redirect('/yelp');
          } else {
              // Wrong password.
              console.log(user[0].password);
              console.log(password);
              response.send({
                  message :'Could not find the user or the password is incorrect.',
                  status: "error"
              });
          }
      }
    });
});

app.post('/db/user/update_info', function(request, response) {
    if (!check_session_email(request, response)) {
        return;
    }
    var email = request.body.email;
    var name = request.body.name;
    var password = request.body.password;

    User.findOne({email: email}).exec(function(err, user) {
        if (!user) {
            send_response(response, 'Cannot find this user!', 0);
            return;
        } else {
            var name_changed = false;
            var password_changed = false;
            if (user.name != name) {
                name_changed = true;
            }
            if (user.password != password) {
                password_changed = true;
            }
            user.name = name;
            user.password = password;

            user.save(function(err) {
                if (err) {
                    send_response(response, 'Error when saving user!', 0);
                    return;
                } else {
                    if (password_changed && name_changed) {
                        send_response(response, 'Password and Username are changed!', 1);
                    } else if (password_changed) {
                        send_response(response, 'Password is changed!', 1);
                    } else if (name_changed) {
                        send_response(response, 'Username is changed!', 1);
                    } else {
                        send_response(response, 'Nothing is changed!', 1);
                    }
                    return;
                }
            })
        }
    });
});

app.post('/db/user/delete', function(request, response) {
    if (!check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;

    User.findOne({email: email}).exec(function(err, user) {
        if (!user) {
            send_response(response, 'No user is found.', 0);
            return;
        } else {
            if(user.password != request.body.password) {
                send_response(response, 'Password is incorrect.', 0);
                return;
            } else {
                user.remove();
                send_response(response, 'User deleted.', 1);
                return;
            }
        }
    });

});

app.post('db/shared_list/new_list', function(request, response) {
    // Create a restaurant and add to user list.
    if (!check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;

    User.find({email: email}).exec(function(err, user) {
        if (user.length == 0) {
            send_response(response, 'Cannot find this user in database.', 0);
            return;
        } else {
            my_user = user[0];
            // TODO: Check request body data
            var name = request.body.name;

            var newUsers = [];
            newUsers.push(my_user);
            var newSharedList = new Restaurant({
                name: name,
                restaurants: [],
                users: newUsers
            });

            newSharedList.save(function(err) {
                if (err) {
                    send_response(response, 'Error occurred when creating new restaurant!', 0);
                    return;
                } else {
                    send_response(response, name + ' is added!', 1);                    
                }
            })
        }
    });
});


app.post('/db/restaurant/add_to_list', function(request, response) {
    // Create a restaurant and add to user list.
    if (!check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;


    User.find({email: email}).exec(function(err, user) {
        if (user.length == 0) {
            send_response(response, 'Cannot find this user in database.', 0);
            return;
        } else {
            my_user = user[0];
            // TODO: Check request body data
            var yelp_id = request.body.yelp_id;
            var name = request.body.name;
            var url = request.body.url;
            var rating = request.body.rating;
            var rating_img_url = request.body.rating_img_url;
            var categories = request.body.categories.slice();
            var address = request.body.address;

            Restaurant.find({yelp_id: yelp_id}).exec(function(err, restaurant) {
                if (err) {
                    console.log("Error in finding restaurant.");
                } else {
                    if (restaurant.length != 0) {
                        // Found existing restaurant.
                        // Check if this restaurt is already added.
                        if (my_user.restaurants.indexOf(restaurant[0]._id) == -1) {
                            // Just add to user list.
                            my_user.restaurants.push(restaurant[0]);
                            my_user.save(function(err) {
                                if (err) {
                                    send_response(response, 'Error occurred when saving user!', 0);
                                    return;
                                } else {
                                    send_response(response, name + ' is added!', 1);
                                    return;
                                }
                            });
                        } else {
                            // The restaurant is already in user list.
                            send_response(response, 'This restaurant is already in your bucket list!', 0);
                            return;
                        }
                    } else {
                        for (var i = 0; i < categories.length; ++i) {
                            categories[i] = categories[i].trim();
                        }

                        // Not found in database, create a new restaurant.
                        var new_restaurant = new Restaurant({
                            yelp_id: yelp_id,
                            name: name,
                            categories: categories,
                            address: address,
                            url: url,
                            rating_img_url: rating_img_url,
                            rating: rating
                        });

                        new_restaurant.save(function(err) {
                            if (err) {
                                send_response(response, 'Error occurred when creating new restaurant!', 0);
                                return;
                            } else {
                                // Restaurant saved. Link to user.
                                my_user.restaurants.push(new_restaurant);
                                my_user.save(function(err) {
                                    if (err) {
                                        send_response(response, 'Error occurred when saving user!', 0);
                                        return;
                                    } else {
                                        send_response(response, name + ' is added!', 1);
                                        return;
                                    }
                                });
                            }
                        })
                    }
                }
            });
        }
    });
});



app.post('/db/restaurant/remove_from_user_list', function(request, response) {
    if (!check_session_email(request, response)) {
        return;
    }

    var email = request.body.email;

    User.findOne({email: email}).exec(function(err, user) {
        if (!user) {
            send_response(response, 'Cannot find this user in database.', 0);
            return;
        } else {
            my_user = user;
            // TODO: Check request body data
            var yelp_id = request.body.yelp_id;

            Restaurant.findOne({ yelp_id: yelp_id }).remove( function(msg) {
                // Not sure if there is any msg being passed back from remove. Blindly send success?
                send_response(response, 'Removed!', 1);
            });

        }
    });
});

app.get('/db/restaurant/get', function(request, response) {

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

//------------------------------------
//          HELPER FUNCTIONS
//------------------------------------

var send_response = function(response, message, status) {
    var send_status = '';
    if (status == 1) {
        send_status = 'success';
    } else if (status == 0) {
        send_status = 'error';
    }

    response.send({
        message: message,
        status: send_status
    });
}

var check_session_email = function(request, response) {
    if (!request.body.email) {
        send_response(response, 'Please login first!', 0);
        return false;
    }

    if (!request.session.email || request.session.email != request.body.email) {
        send_response(response, 'Wrong credential! Please login again!', 0);
        return false;
    }
    return true;
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
