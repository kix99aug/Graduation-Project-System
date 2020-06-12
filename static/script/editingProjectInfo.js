var memberNum = 0;
var member = document.getElementById("member");

member.addEventListener("keypress", addInputBar);
member.addEventListener("click", deleteInputBar);

function addInputBar(e) {
  if (e.key === "Enter") {
    var div = document.createElement("div");
    div.setAttribute("class", "row mb-2");
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("style", "width: 50%;");
    input.setAttribute("class", "form-control");
    var i = document.createElement("i");
    i.setAttribute("class", "far fa-times-circle");
    i.setAttribute("style", "margin-left: -25px; margin-top: 12px;");
    div.appendChild(input);
    div.appendChild(i);
    member.appendChild(div);
    memberNum++;
  }
}
function deleteInputBar(e) {
  if (memberNum != 0 && e.target.nodeName == "I") {
    console.log(e.target.nodeName);
    var parentnode = e.target.parentNode;
    member.removeChild(parentnode);
    memberNum--;
  }
}
