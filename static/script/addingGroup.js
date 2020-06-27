var member = document.getElementById("addingMembers");

$(".col-3.pb-2.mem input").on("input", onInput)

function onInput(e) {
  if ($(this).val() == "" && $(".col-3.pb-2.mem input").length > 1) {
    $(this).parent().remove()
    return
  }
  if ($(".col-3.pb-2.mem input").last().val() != "") {
    $(addInputBar()).on("input", onInput)
  }
}

function addInputBar() {
  var div = document.createElement("div");
  div.setAttribute("class", "col-3 pb-2 mem");
  div.setAttribute("style","margin-left: 119px;");
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control");
  input.setAttribute("style", "width: 150px;");
  input.setAttribute("placeholder","成員學號");
  div.appendChild(input);
  member.appendChild(div);
  return input
}