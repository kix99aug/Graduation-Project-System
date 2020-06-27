var member = document.getElementById("member");

$(".row.mb-2.px-3 input").on("input", onInput);

function onInput(e) {
  if ($(this).val() == "" && $(".row.mb-2.px-3 input").length > 1) {
    $(this).parent().remove();
    return;
  }
  if ($(".row.mb-2.px-3 input").last().val() != "") {
    $(addInputBar()).on("input", onInput);
  }
}

function addInputBar() {
  var div = document.createElement("div");
  div.setAttribute("class", "row mb-2 px-3");
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control w-50");
  div.appendChild(input);
  member.appendChild(div);
  return input;
}
function appendChilds(teamMate) {
  if (teamMate.group == 2) {
    return;
  }
  var rec = document.getElementById("rec");
  var div = document.createElement("div");
  div.setAttribute("class", "row d-flex flex-row justify-content-center");
  var i = document.createElement("i");
  i.setAttribute("class", "fas fa-arrow-right mt-2");
  var p1 = document.createElement("p");
  p1.setAttribute("class", "px-3");
  p1.setAttribute("style", "font-size: 24px;");
  var p2 = document.createElement("p");
  p2.setAttribute("class", "px-3");
  p2.setAttribute("style", "font-size: 24px;");
  var p3 = document.createElement("p");
  p3.setAttribute("class", "px-3");
  p3.setAttribute("style", "font-size: 24px;");
  div.appendChild(i);

  p1.innerHTML = teamMate.account;
  div.appendChild(p1);
  p2.innerHTML = teamMate.name;
  div.appendChild(p2);
  if (teamMate.score == null) teamMate.score = 0;
  p3.innerHTML = teamMate.score + "分";
  div.appendChild(p3);

  rec.appendChild(div);
}
var length;
fetch("/api/team/judge")
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json.result) {
      for (var i = 0; i < json.teamMate.length; i++) {
        appendChilds(json.teamMate[i]);
      }
    }
  });
