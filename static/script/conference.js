$(function () {
  var socket = io();
  $("button#submit").click((e) => {
    if ($("#message").val() != "") socket.emit("message", $("#message").val());
    $("#message").val("");
  });

  socket.on("userin", (e) => {
    $("#messages").prepend(`
    <div class="alert alert-primary" role="alert">
      <a href="/profile/${e.id}">${e.name}</a> 已加入會議
    </div>
    `)
    $("#messages-container").animate({"scrollTop":$("#messages-container").prop("scrollHeight")},500)
  });

  socket.on("userout", (e) => {
    $("#messages").prepend(`
    <div class="alert alert-secondary" role="alert">
        <a href="/profile/${e.id}">${e.name}</a> 已離開會議
      </div>
      `)
    $("#messages-container").animate({"scrollTop":$("#messages-container").prop("scrollHeight")},500)
  });
  socket.on("history", (me) => {
    me.forEach((m) => {
      if (m.id == id) {
      $("#messages").prepend(`
            <div class="media my-3 mr-0 ml-auto text-right">
              <div class="media-body">
                <h5 class="m-0"><a href="/profile/${m.id}">${m.name}</a></h5>
                <div style="font-size: 0.2rem;">
                  ${new Date().toLocaleString()}
                </div>
                <span>${m.message}</span>
              </div>
              <a href="/profile"
                ><img src="${m.picture}" class="ml-3 messageicon" alt="avatar"
              /></a>
            </div>
      `)
  
      } else {
      $("#messages").prepend(`
            <div class="media my-3 ml-0 mr-auto text-left">
              <a href="/profile/${m.id}"
                ><img src="${m.picture}" class="mr-3 messageicon" alt="avatar"
              /></a>
              <div class="media-body">
                <h5 class=""><a href="/profile/${m.id}">${m.name}</a></h5>
                <div style="font-size: 0.2rem;">
                  ${new Date().toLocaleString()}
                </div>
                <span>${m.message}</span>
              </div>
            </div>
      `)
      }
    })
  })

  socket.on("message", (m) => {
    if (m.id == id) {
    $("#messages").prepend(`
          <div class="media my-3 mr-0 ml-auto text-right">
            <div class="media-body">
              <h5 class=""><a href="/profile/${m.id}">${m.name}</a></h5>
              <div style="font-size: 0.2rem;">
                ${new Date().toLocaleString()}
              </div>
              <span>${m.message}</span>
            </div>
            <a href="/profile"
              ><img src="${m.picture}" class="ml-3 messageicon" alt="avatar"
            /></a>
          </div>
    `)

    } else {
    $("#messages").prepend(`
          <div class="media my-3 ml-0 mr-auto text-left">
            <a href="/profile/${m.id}"
              ><img src="${m.picture}" class="mr-3 messageicon" alt="avatar"
            /></a>
            <div class="media-body">
              <h5 class="m-0"><a href="/profile/${m.id}">${m.name}</a></h5>
              <div style="font-size: 0.2rem;">
                ${new Date().toLocaleString()}
              </div>
              <span>${m.message}</span>
            </div>
          </div>
    `)
    }
    $("#messages-container").animate({"scrollTop":$("#messages-container").prop("scrollHeight")},500)
  });

  let handleEnter = (event) => {
    if (event.keyCode == 13 && !event.shiftKey) {
      document.querySelector("#submit").click();
      event.preventDefault();
    }
  };
  $("#message").on("keydown", handleEnter).on("keypress", handleEnter);
});
