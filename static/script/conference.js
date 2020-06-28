$(function () {
  var socket = io();
  $("#inputbox > button").click((e) => {
    if ($("#input").val() != "") socket.emit("message", $("#input").val());
    $("#input").val("");
  });

  socket.on("userin", (e) => {
    document.querySelector("#messages").innerHTML =
      `
    <div class="alert alert-primary" role="alert">
      <a href="/profile/${e.id}">${e.name}</a> 已加入會議
      </div>
      ` + document.querySelector("#messages").innerHTML;
  });

  socket.on("userout", (e) => {
    document.querySelector("#messages").innerHTML =
      `
    <div class="alert alert-secondary" role="alert">
        <a href="/profile/${e.id}">${e.name}</a> 已離開會議
      </div>
      ` + document.querySelector("#messages").innerHTML;
  });

  socket.on("message", (m) => {
    if (m.id == id) {
      document.querySelector("#messages").innerHTML =
        `
          <div class="media my-3 mr-0 ml-auto text-right">
            <div class="media-body">
              <h5 class="m-0"><a href="/profile/${m.id}">${m.name}</a></h5>
              <div style="font-size: 0.2rem;">
                ${new Date().toLocaleString()}
              </div>
              <span></span>
            </div>
            <a href="/profile"
              ><img src="${m.picture}" class="ml-3 messageicon" alt="avatar"
            /></a>
          </div>
    ` + document.querySelector("#messages").innerHTML;

    } else {
      document.querySelector("#messages").innerHTML =
        `
          <div class="media my-3 ml-0 mr-auto text-left">
            <a href="/profile/${m.id}"
              ><img src="${m.picture}" class="mr-3 messageicon" alt="avatar"
            /></a>
            <div class="media-body">
              <h5 class="m-0"><a href="/profile/${m.id}">${m.name}</a></h5>
              <div style="font-size: 0.2rem;">
                ${new Date().toLocaleString()}
              </div>
              <span></span>
            </div>
          </div>
    ` + document.querySelector("#messages").innerHTML;
    }
    document
      .querySelector("#messages")
      .firstElementChild.querySelector("span").innerText = m.message;
  });

  let handleEnter = (event) => {
    if (event.keyCode == 13 && !event.shiftKey) {
      document.querySelector("#inputbox > button").click();
      event.preventDefault();
    }
  };
  $("#input").on("keydown", handleEnter).on("keypress", handleEnter);
});
