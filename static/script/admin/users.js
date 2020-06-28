$(function () {
    $.get("/api/admin/users", res => {
        $(".project-list").empty()
        res.sort((a, b) => b.account.localeCompare(a.account))
        res.forEach(ele => {
            $(".project-list").append(`
            <div class="checkbox">
              <div class="projects-item text-dark ">
                <input id="${ele._id}" type="checkbox" class="mx-3 ">
                <label for="${ele._id}">${ele.account} ${ele.name}</label>
                <button type="button" class="btn btn-light btn-sm edit">
                  <a href="/admin/user/edit/${ele._id}" style="color:black;text-decoration:none;"><i class="fas fa-file-signature"></i> 編輯使用者資訊</button></a>
              </div>
            </div>`)
        });
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
                    url: `/api/admin/user/${$(this).attr("id")}`,
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
        $("button#select").click(function () {
            let allchecked = true;
            $(`input[type="checkbox"]`).each(function () {
                if (!$(this).prop(`checked`)) allchecked = false
            });
            $(`input[type="checkbox"]`).prop(`checked`, !allchecked);
        })

        $("button#new").click(function(){
            let empty = false
            let obj = {}
            $("#addingUser input").each(function(){
                if($(this).val()=="") empty = true
                else obj[$(this).attr("name")] = $(this).val()
            })
            if(!empty){
                console.log(obj)
                $.ajax({
                    url:"/api/admin/user",
                    method:"PUT",
                    data:obj,
                    success:()=>window.location.reload(),
                    error:()=>window.location.reload()
                })
            }
        })
    })
})