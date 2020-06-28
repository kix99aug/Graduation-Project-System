$("button#delete").click((e) => {
    let list = $("input:checked")
    if (list.length == 0) return
    $(".modal-body > ul").empty()
    $("input:checked").each(
        function () {
            $(".modal-body > ul").append(`<li>${$(this).parent().text().split("編輯專題團隊內容")[0]}</li>`)
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
        if ($(this).parent().text().split("編輯專題團隊內容")[0].search(query) == -1) {
            $(this).prop(`checked`, false)
            $(this).parent().hide()
        } else {
            $(this).parent().show()
        }
    })
});