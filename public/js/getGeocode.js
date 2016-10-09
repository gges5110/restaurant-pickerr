$(document).on('click', '#submit_btn', function(event) {
    var lat = $("#lat_input").val();
    var lng = $("#lng_input").val();

    $.ajax({
        url: "/api/geocode",
        data: {
            lat: lat,
            long: lng
        },
        success: function(data) {
           var items = [];
           items.push( "<tr> ");
           items.push( "<td>" + data.results[0].formatted_address +"</td>");
           var arr = ["postal_code", "locality", "administrative_area_level_1"];

           for (var i = 0; i < 3; ++i) {
               var found = false;
               $.each(data.results[0].address_components, function(key, val) {
                   if (val.types.indexOf(arr[i]) != -1) {
                       found = true;
                       items.push( "<td>" + val.long_name + "</td>");
                   }
               });

               if (found == false) {
                   items.push( "<td>" + "Not found." +"</td>");
               }
           }

           items.push(" </tr> ");
           $('#geo_table > tbody:last-child').append(items.join('\n'));
         }
     });

    toastr.success(lat);


});
