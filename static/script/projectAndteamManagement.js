var memberNum = 0;
var member = document.getElementById("addingMembers");

member.addEventListener("keypress", addInputBar);
member.addEventListener("click", deleteInputBar);

function addInputBar(e) {
  if (e.key === "Enter") {
    var div = document.createElement("div");
    div.setAttribute("class", "col-3 pb-2");
    div.setAttribute("style","margin-left: 119px;")
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("style", "width: 150px;");
    input.setAttribute("class", "form-control");
    input.setAttribute("placeholder", "專題名稱");
    var i = document.createElement("i");
    i.setAttribute("class", "far fa-times-circle");
    div.appendChild(input);
    div.appendChild(i);
    member.appendChild(div);
    memberNum++;
  }
}
function deleteInputBar(e) {
  if (memberNum != 0 && e.target.nodeName == "I") {
    var parentnode = e.target.parentNode;
    member.removeChild(parentnode);
    memberNum--;
  }
}
