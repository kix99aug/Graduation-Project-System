$(function () {
    $.get("/api/admin/users", res => {
        console.log(res)
        res.sort((a, b) => b.account.localeCompare(a.account))
        res.forEach(ele => {
            $("form").append(`
            <div class="checkbox">
              <label class="projects-item ">
                <input name="${ele._id}" type="checkbox" class="mx-3 ">
                ${ele.account} ${ele.name}
                <button type="button" class="btn btn-light btn-sm edit">
                  <a href="/admin/user/edit/${ele._id}" style="color:black;text-decoration:none;"><i class="fas fa-file-signature"></i> 編輯使用者資訊</button></a>
              </label>
            </div>`)
        });
        $("form").submit(function (e) {
            e.preventDefault();
            console.log($(this).serialize());
        })
        // $("button#delete").click((e) => {
        //     $("form").submit()
        // })
    })
})