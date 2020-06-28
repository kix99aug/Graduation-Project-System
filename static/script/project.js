$(() => {
    $('a[href="#forum"]').click(() => {
        let int = setInterval(() => {
            if ($('#forum_content').is(':visible')) {
                $("#forum_content").animate({ scrollTop: $("#forum_content").height() }, 500)
                clearInterval(int);
            }
        }, 100);
    })
    let handleEnter = (event) => {
        if (event.keyCode == 13 && !event.shiftKey) {
          document.querySelector("#submit").click();
          event.preventDefault();
        }
      };
      $("#message").on("keydown", handleEnter).on("keypress", handleEnter);
})

start = location.href.lastIndexOf("ject/")
projectID = location.href.substring(start + 5, location.href.length)
console.log(projectID)
function commentBtn() {
    forum = document.getElementById("forum")
    input = forum.querySelector('input').value
    forum.querySelector('input').value = ""
    console.log(input)
    comment = { 'content': input, 'teamId': projectID }
    $.ajax({
        url: "/api/team/discuss",   //後端的URL
        type: "POST",   //用POST的方式
        dataType: "json",   //response的資料格式
        cache: true,   //是否暫存
        data: comment, //傳送給後端的資料
        success: function (response) {
            //console.log(response)
            console.log(response)  //成功後回傳的資料
        }
    });
    //新增留言到畫面

    $("#forum_content").append(`
    <div class="content">
        <div class="media m-3">
            <a ><img src="${$("#logoutMenu img").attr("src")}" class="mr-3 messageicon"
                    alt="avatar"></a>
            <div class="media-body">
                <h5 class="m-0"><a href="/profile">${$("#logoutMenu span").text()}</a></h5>
                <div id='time' style="font-size:0.2rem">${new Date().toLocaleString()}</div>
                <span>${input}</span>
            </div>
        </div>
    </div>
    `)

    $("#forum_content").animate({ scrollTop: $("#forum_content").height() }, 100);
}
