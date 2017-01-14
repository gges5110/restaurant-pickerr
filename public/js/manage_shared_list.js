$(document).ready(function() {

});

$(document).on('click', '#add_shared_list_btn', function(event) {
    if ($('#add_shared_list_input').val() == "") {
        toastr.warning('Please provide a name!');
        return;
    }

    // Get all the inputs.
    var name = $('#add_shared_list_input').val();

    $.ajax({
        url: '/db/shared_list/create',
        method: "POST",
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            name: name,
        }),
        contentType: 'application/json',
        success: function(data) {
            if (data.status === 'error') {
                toastr.warning(data.message);
            } else {
                toastr.success(data.message);
                var items = [];
                var rowCount = $('#shared_list_table tbody tr').length;

                items.push("<tr tabindex='" + rowCount + "' class='list_table_row'>");
                items.push("<td hidden id='list_id_" + rowCount + "'>" + data.list_id + "</td>");
                items.push("<td><a href='/shared_list?list_id=" + data.list_id + "' id='list_name_" + rowCount + "'>" + name + "</a></td>");
                items.push("<td>");
                items.push("<form action='javascript:void(0);'>");
                items.push("<button type='submit' class='btn btn-outline-danger' tabindex='" + rowCount + "' id='remove_list_btn'>Remove</button>");
                items.push("</form>");
                items.push("</td>");
                items.push( "</tr> ");

                $('#shared_list_table_own > tbody:last-child').append(items.join('\n'));
            }
        }
    });
});

var table_id, index;

$(document).on('click', '#leave_group_modal_btn', function(event) {
    $('#myModal').modal('hide');
    console.log('table_id = ' + table_id);

    NProgress.start();
    $.ajax({
        url: '/db/shared_list/delete',
        method: 'POST',
        data: JSON.stringify({
            email: $('#nav_email').attr('title'),
            list_id: $('#' + table_id + '_id_' + index).text()
        }),
        contentType: 'application/json',
        success: function(data) {
            if (data.status == 'error') {
                toastr.warning(data.message);
            } else {
                toastr.success(data.message);
                $('#' + table_id + ' > tbody > tr[tabindex=' + index + ']').remove();
            }
            NProgress.done(true);
        }
    });
})

$(document).on('click', '#remove_list_btn', function(event) {
    table_id = $(this).closest('table').attr('id');
    index = $(this).attr('tabindex');

    $('#myModal').modal('show');
});
