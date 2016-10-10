$(document).ready(function () {
    $(".nav li").removeClass("active");//this will remove the active class from
                           //previously active menu item
    $('#nav_li_yelp').addClass('active');
});

var lat, lng;
var zipcode = "";
var user_city = "";

var geocode_callback = (function() {
    $.ajax({
        url: "/api/geocode",
        data: {
            lat: lat,
            long: lng
        },
        success: function(data) {
           var found = false;
        //    console.log(data);
           if (!data.results[0] || data.status === "ZERO_RESULTS") {
               toastr.warning("No zipcode results found!")
           } else {
               $.each(data.results[0].address_components, function(key, val) {
                   if (val.types.indexOf("postal_code") != -1) {
                       zipcode = val.long_name;
                       found = true;
                   } else if (val.types.indexOf("locality") != -1) {
                       user_city = val.long_name;
                   }
               });
               //    toastr.success('zipcode = ' + zipcode);
               yelp_query();
           }
         }
     });
});

var yelp_query = (function() {
    $.ajax({
        url: "/api/yelp",
        data: {
            lat: lat,
            lng: lng,
            zipcode: zipcode,
            term: $('#term_input').val(),
            limit: $('#limit_input').val(),
            sort_mode: $('#sort_mode_input').val()
        },
         success: function(data) {
             $('#yelp_table>tbody tr').remove();
             toastr.info("Found total of " + data.total + " results.");
             $('#number_of_results').text(data.total);

             if (!$('#term_input').val()) {
                 $('#category_label').text("Japanese Food");
             } else {
                 $('#category_label').text($('#term_input').val());
             }

             if (user_city != "") {
                 $('#location_label').text(user_city);
             }

             var items = [];
             for (var i = 0; i < data.results.length; ++i) {
                 items.push( "<tr> ");
                 items.push( "<td>" + data.results[i].name +"</td>");
                 items.push( "<td> <img src=" + data.results[i].rating_img_url + "> </td>");
                 items.push( "<td>");
                 for (var j = 0; j < data.results[i].categories.length; ++j) {
                     if (j < data.results[i].categories.length - 1) {
                         items.push(data.results[i].categories[j] + ", ");
                     } else {
                         items.push(data.results[i].categories[j]);
                     }
                 }
                 items.push("</td>");
                 items.push( "<td><a href='https://www.google.com/maps?q=" + encodeURIComponent(data.results[i].address) + "' target='_blank'>" + data.results[i].address +"</a></td>");

                 items.push(" </tr> ");
             }

             $('#yelp_table > tbody:last-child').append(items.join('\n'));
         }
    });
});

$(document).on('click', '#find_btn', function(event) {
    zipcode = $('#location_input').val();

    if (zipcode == "") {
        // Check if the browser has support for the Geolocation API
        if (!navigator.geolocation) {
            toastr.warning('Your browser does not support location finding!');
        } else {
            navigator.geolocation.getCurrentPosition(function(position) {
                // Get the coordinates of the current possition.
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                // toastr.success('Your latitude is ' + lat + ', ' + ' longitude is ' + lng);

                // Get zipcode.
                geocode_callback();

            });
        }
    } else {
        toastr.success("You specified the location: " + zipcode);
        // Location is already specified by the user, use it.
        yelp_query();
    }



});
