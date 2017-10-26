var express = require('express');
var http = require('http');

var session = require('express-session');
var cookieParser = require('cookie-parser');

var bodyParser = require('body-parser');

var load_database = require('./load_database');
load_database();

//------------------------------------
//          TEMPLATE ROUTING
//------------------------------------
var routes_index = require('./routes/index.js');
var routes_login = require('./routes/login.js');
var routes_logout = require('./routes/logout.js');
var routes_user_settings = require('./routes/user_settings.js');
var routes_yelp = require('./routes/yelp.js');
var routes_bucketlist = require('./routes/bucketlist.js');
var router_shared_list = require('./routes/shared_list.js');
var router_manage_shared_list = require('./routes/manage_shared_list.js');
var router_invite = require('./routes/invite.js');

var router_db_user_create = require('./routes/db/user/create.js');
var router_db_user_login = require('./routes/db/user/login.js');
var router_db_user_update_info = require('./routes/db/user/update_info.js');
var router_db_user_delete = require('./routes/db/user/delete.js');

var router_db_restaurant_add_to_list = require('./routes/db/restaurant/add_to_list.js');
var router_db_restaurant_remove_from_user_list = require('./routes/db/restaurant/remove_from_user_list.js');
var router_db_restaurant_remove_from_shared_list = require('./routes/db/restaurant/remove_from_shared_list.js');

var router_api_yelp = require('./routes/api/yelp.js');

var router_db_shared_list_create = require('./routes/db/shared_list/create.js');
var router_db_shared_list_delete = require('./routes/db/shared_list/delete.js');

var env = process.env.NODE_ENV || 'development';

var forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
 };



var app = express();


if (env === 'production') {
    app.use(forceSsl);
}

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

app.use(routes_index);
app.use(routes_login);
app.use(routes_logout);
app.use(routes_user_settings);
app.use(routes_yelp)
app.use(routes_bucketlist);
app.use(router_shared_list);
app.use(router_manage_shared_list);
app.use(router_invite);

//------------------------------------
//       DATABASE OPERATIONS
//------------------------------------
app.use(router_db_user_create);
app.use(router_db_user_login);
app.use(router_db_user_update_info);
app.use(router_db_user_delete);

//------------------------------------
//       DATABASE OPERATIONS: Restaurants
//------------------------------------
app.use(router_db_restaurant_add_to_list);
app.use(router_db_restaurant_remove_from_user_list);
app.use(router_db_restaurant_remove_from_shared_list);

//------------------------------------
//       DATABASE OPERATIONS: Shared Lists
//------------------------------------
app.use(router_db_shared_list_create);
app.use(router_db_shared_list_delete);

//------------------------------------
//              API ENDPOINT
//------------------------------------
app.use(router_api_yelp);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = server;
