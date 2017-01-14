$(document).ready(function() {
    new Clipboard('.btn');
    $('[data-toggle="tooltip"]').tooltip();
});

$(document).on('click', '#remove_from_list_btn', function(event) {
    NProgress.start();

    var index = $(this).attr('tabindex');
    $.ajax({
        url: '/db/restaurant/remove_from_shared_list',
        method: 'POST',
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            yelp_id: $('#list_yelp_id_' + index).text(),
            list_id: $('#list_id').text()
        }),
        contentType: 'application/json',
        success: function(data) {
            if (data.status == 'error') {
                toastr.warning(data.message);
            } else {
                toastr.success(data.message);
                $('.list_table_row[tabindex=' + index + ']').remove();
            }

        }
    })

    NProgress.done(true);
});


$(document).on('click', '#pick_btn', function(event) {
    var rowCount = $('#yelp_table tbody tr').length;
    if (rowCount == 0) {
        toastr.warning('Your list is empty, please add some items.');
    } else {
        var randomnumber = Math.floor(Math.random() * rowCount);
        toastr.success($('#list_yelp_name_' + randomnumber).text(), "The restaurant is: ", {
            onclick: function() {
                window.open($('#list_yelp_name_' + randomnumber).attr('href'));
            }
        });
    }
});
