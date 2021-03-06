var express = require('express');
var router = express.Router();

var User = require('../../../models/user.js');
var Restaurant = require('../../../models/restaurant.js');
var SharedList = require('../../../models/sharedList.js');
var Favorite = require('../../../models/favorite');
var helper = require('../../../helper.js');

router.post('/db/restaurant/add_to_list', function(request, response) {
  // Create a restaurant and add to user list.
  if (!helper.check_session_email(request, response)) {
    return;
  }

  var email = request.body.email;

  User.find({email: email}).populate('sharedLists_own').populate('sharedLists_edit').exec(function(err, user) {
    if (user.length == 0) {
        helper.send_response(response, 'Cannot find this user in database.', 0);
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
      var list_id = request.body.list_id;

      var using_default_list = false;

      if (list_id == 'default') {
        using_default_list = true;
      }

      if (using_default_list) {
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
                    helper.send_response(response, 'Error occurred when saving user!', 0);
                    return;
                  } else {
                    helper.send_response(response, name + ' is added!', 1);
                    // Create favorite record.
                    createFavoriteRecord(restaurant[0], response);
                    return;
                  }
                });
              } else {
                // The restaurant is already in user list.
                helper.send_response(response, 'This restaurant is already in your bucket list!', 0);
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
                  helper.send_response(response, 'Error occurred when creating new restaurant!', 0);
                  return;
                } else {
                  // Restaurant saved. Link to user.
                  my_user.restaurants.push(new_restaurant);
                  my_user.save(function(err) {
                    if (err) {
                      helper.send_response(response, 'Error occurred when saving user!', 0);
                      return;
                    } else {
                      helper.send_response(response, name + ' is added!', 1);
                      // Create favorite record.
                      createFavoriteRecord(restaurant[0], response);
                      return;
                    }
                  });
                }
              })
            }
          }
        });
      } else {
        Restaurant.find({yelp_id: yelp_id}).exec(function(err, restaurant) {
          if (err) {
            console.log("Error in finding restaurant.");
          } else {
            if (restaurant.length != 0) {
              // Found existing restaurant.
              // Check if this restaurt is already added.
              SharedList.findById(list_id, function(err, sharedList) {
                if (sharedList.restaurants.indexOf(restaurant[0]._id) == -1) {
                  // Just add to user list.
                  sharedList.restaurants.push(restaurant[0]);
                  sharedList.markModified('restaurants');
                  sharedList.save(function(err) {
                    if (err) {
                      helper.send_response(response, 'Error occurred when saving user!', 0);
                      return;
                    } else {
                      helper.send_response(response, name + ' is added to ' + sharedList.name + '!', 1);
                      // Create favorite record.
                      createFavoriteRecord(restaurant[0], response);
                      return;
                    }
                  });
                } else {
                  // The restaurant is already in user list.
                  helper.send_response(response, 'This restaurant is already in your bucket list!', 0);
                  return;
                }
              });
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
                  helper.send_response(response, 'Error occurred when creating new restaurant!', 0);
                  return;
                } else {
                  // Restaurant saved. Link to user.
                  SharedList.findById(list_id, function(err, sharedList) {
                    sharedList.restaurants.push(new_restaurant);
                    sharedList.markModified('restaurants');
                    sharedList.save(function(err) {
                      if (err) {
                        helper.send_response(response, 'Error occurred when saving user!', 0);
                        return;
                      } else {
                        helper.send_response(response, name + ' is added to ' + sharedList.name + '!', 1);
                        // Create favorite record.
                        createFavoriteRecord(restaurant[0], response);
                        return;
                      }
                    });
                  });
                }
              })
            }
          }
        });
      }
    }
  });
});

var createFavoriteRecord = function(restaurant, response) {
  var new_favorite = new Favorite({
    restaurant: restaurant
  });
  new_favorite.save(function(err) {
    if (err) {
      console.log('Error occurred when saving favorite');
      console.log(err);
    }
  })
}

module.exports = router;
