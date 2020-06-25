// $.get("/api/conference", function (data) {
//   console.log(data);
// });
var id
fetch("/api/conference")
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json.result) {
      id = json.id
    }
  });
console.log(id)
const socket = io(document.location.href);
socket.on("userin", (e) => {
  document.querySelector("#messages").innerHTML =
    `
      <div class="alert alert-primary" role="alert">
        <a href="/user/${e.uid}">${e.name}</a> 已加入公共廣場
        </div>
        ` + document.querySelector("#messages").innerHTML;
});
socket.on("userout", (e) => {
  document.querySelector("#messages").innerHTML =
    `
      <div class="alert alert-secondary" role="alert">
          <a href="/user/${e.uid}">${e.name}</a> 已離開公共廣場
        </div>
        ` + document.querySelector("#messages").innerHTML;
});
socket.on("message", (m) => {
  console.log(new Date(m.time * 1000));
  if(id == m.uid){
    document.querySelector("#messages").innerHTML =
    `
      <div class="media m-3">
          <a href="/user/${m.uid}"><img src="${
      m.picture
    }" class="mr-0 ml-auto messageicon" alt="avatar"></a>
          <div class="media-body">
            <h5 class="m-0"><a href="/user/${m.uid}">${m.name}</a></h5>
            <div style="font-size:0.2rem">${new Date(
              m.time * 1000
            ).toLocaleString()}</div>
            <span></span>
          </div>
        </div>
      ` + document.querySelector("#messages").innerHTML;
    document
      .querySelector("#messages")
      .firstElementChild.querySelector("span").innerText = m.message;
    }
  else{
    document.querySelector("#messages").innerHTML =
    `
      <div class="media m-3">
          <a href="/user/${m.uid}"><img src="${
      m.picture
    }" class="ml-0 mr-auto messageicon" alt="avatar"></a>
          <div class="media-body">
            <h5 class="m-0"><a href="/user/${m.uid}">${m.name}</a></h5>
            <div style="font-size:0.2rem">${new Date(
              m.time * 1000
            ).toLocaleString()}</div>
            <span></span>
          </div>
        </div>
      ` + document.querySelector("#messages").innerHTML;
    document
      .querySelector("#messages")
      .firstElementChild.querySelector("span").innerText = m.message;
  }
  
});
document.querySelector("#button").onclick = () => {
  console.log("fuck")
  if (document.querySelector("#input").value != "")
    socket.send(document.querySelector("#input").value);
  document.querySelector("#input").value = "";

};
let handleEnter = (event) => {
  if (event.keyCode == 13 && !event.shiftKey) {
    document.querySelector("#inputbox > button").click();
    event.preventDefault();
  }
};
document.querySelector("#input").addEventListener("keydown", handleEnter);
document.querySelector("#input").addEventListener("keypress", handleEnter);
