$(document).ready(function () {
    $(".nav li").removeClass("active");//this will remove the active class from previously active menu item
    $('#nav_li_yelp').addClass('active');

    var app1 = new Vue({
      el: '#app1',
      data: {
        foodType: 'Japanese',
        lastName: '<%= user.name %>',
        url: 'http://google.com'
      },
      methods: {
        say: function (message) {
          alert(message)
        }
      },
      computed: {
        fullName: function () {
          return this.firstName + ' ' + this.lastName
        }
      }
    })
});

var lat, lng;
var zipcode = "";
var user_city = "";

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
             toastr.success("Found total of " + data.total + " results.");

             if ($('#limit_input').val() != "") {
                 $('#number_of_results').text($('#limit_input').val());
             } else {
                 $('#number_of_results').text(20);
             }

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
                 items.push( "<td hidden id='result_yelp_id_" + i + "'>" + data.results[i].yelp_id + "</td>");
                 items.push( "<td hidden id='result_rating_" + i + "'>" + data.results[i].rating + "</td>");
                 items.push( "<td> <a id='result_name_" + i + "' href='" + data.results[i].url + "' target='_blank'>" + data.results[i].name +"</a></td>");
                 items.push( "<td> <img id='result_rating_img_url_" + i + "' src=" + data.results[i].rating_img_url + "> </td>");
                 items.push( "<td id='result_categories_" + i + "'>");
                 for (var j = 0; j < data.results[i].categories.length; ++j) {
                     if (j < data.results[i].categories.length - 1) {
                         items.push(data.results[i].categories[j] + ", ");
                     } else {
                         items.push(data.results[i].categories[j]);
                     }
                 }
                 items.push( "</td>");
                 items.push( "<td><a id='result_address_" + i + "' href='https://www.google.com/maps?q=" + encodeURIComponent(data.results[i].display_address) + "' target='_blank'>" + data.results[i].display_address +"</a></td>");

                 items.push( "<td>");
                 if (!data.results[i].in_list) {
                     items.push( "<form action='javascript:void(0);'><button id='add_to_list_btn_" + i + "' type='submit' tabindex='" + i + "' class='btn btn-primary result_add_submit'>Add</button><form>")
                 } else {
                     items.push( "<form action='javascript:void(0);'><button id='add_to_list_btn_" + i + "' type='submit' tabindex='" + i + "' class='btn btn-warning result_add_submit'>Add</button><form>")
                 }

                 items.push( "</tr>");
             }


             $('#yelp_table > tbody:last-child').append(items.join('\n'));
             NProgress.done(true);
         }
    });
});

$(document).on('click', '.dropdown-item', function(event) {
    $('#select_list_btn').text($(this).text());
    $('#selected_list_id').text($(this).attr('id'));
});

$(document).on('click', '.result_add_submit', function(event) {
    var index = $(this).attr('tabindex');

    // Get all the inputs.
    var yelp_id = $('#result_yelp_id_' + index).text();
    var name = $('#result_name_' + index).text();
    var url = $('#result_name_' + index).attr('href');
    var rating = $('#result_rating_' + index).text();
    var rating_img_url = $('#result_rating_img_url_' + index).attr('src');
    var categories_text = $('#result_categories_' + index).text();
    var address = $('#result_address_' + index).text();
    var list_id = $('#selected_list_id').text();

    var categories = categories_text.split(',');
    // Process categories_text.
    for (var i = 0; i < categories.length; ++i) {
        categories[0] = categories[0].trim();
    }

    $.ajax({
        url: '/db/restaurant/add_to_list',
        method: "POST",
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            yelp_id: yelp_id,
            name: name,
            url: url,
            rating: rating,
            rating_img_url: rating_img_url,
            categories: categories,
            address: address,
            list_id: list_id
        }),
        contentType: 'application/json',
        success: function(data) {
            if (data.status === 'error') {
                toastr.warning(data.message);
            } else {
                $('#add_to_list_btn_' + index).removeClass("btn-primary");
                $('#add_to_list_btn_' + index).addClass("btn-warning");
                toastr.success(data.message);
            }
        }
    });
});

$(document).on('click', '#find_btn', function(event) {
    if (($('#limit_input').val() > 20 || $('#limit_input').val() < 1) && $('#limit_input').val() != "") {
        toastr.warning("The number of search results is incorrect.");
    } else {
        NProgress.start();
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

                    yelp_query();
                });
            }
        } else {
            toastr.success("You specified the location: " + zipcode);
            // Location is already specified by the user, use it.
            yelp_query();
        }
    }
});
