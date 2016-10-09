var lat, lng;
var zipcode = "";

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
            term: $('#term_input').val()
        },
         success: function(data) {
             $('#yelp_table>tbody tr').remove();
             toastr.info("Found total of " + data.total + " results.");
             var items = [];
             for (var i = 0; i < data.results.length; ++i) {
                 items.push( "<tr> ");
                 items.push( "<td>" + data.results[i].name +"</td>");
                 items.push( "<td>" + data.results[i].rating +"</td>");
                 items.push( "<td>");
                 for (var j = 0; j < data.results[i].categories.length; ++j) {
                     if (j < data.results[i].categories.length - 1) {
                         items.push(data.results[i].categories[j] + ", ");
                     } else {
                         items.push(data.results[i].categories[j]);
                     }
                 }
                 items.push("</td>");
                 items.push( "<td>" + data.results[i].address +"</td>");

                 items.push(" </tr> ");
             }

             $('#yelp_table > tbody:last-child').append(items.join('\n'));
         }
    });
});

$(document).on('click', '#find_btn', function(event) {

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

});
