$("button#delete").click((e) => {
    let list = $("input:checked ~ label")
    if (list.length == 0) return
    $(".modal-body > ul").empty()
    $("input:checked ~ label").each(
        function () {
            $(".modal-body > ul").append(`<li>${$(this).text()}</li>`)
        }
    )
    $("#confirmDelete").modal()
})
$("button#confirm").click(e => {
    let length = $("input:checked").length
    $("input:checked").each(async function () {
        await $.ajax({
            url: `/api/admin/projectTeam/${$(this).attr("id")}`,
            type: 'DELETE',
            success: () => length--,
            error: () => length--
        })
    })
    setInterval(() => {
        if (length == 0) window.location.reload()
    }, 100);
})
$("input.search").on('input', function () {
    const query = $(this).val()
    $(`input[type="checkbox"]`).each(function () {
        if ($(this).siblings("label").text().search(query) == -1) {
            $(this).prop(`checked`, false)
            $(this).parent().hide()
        } else {
            $(this).parent().show()
        }
    })
});