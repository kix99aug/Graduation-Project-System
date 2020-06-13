var member = document.getElementById("member");

$("col-3 pb-2 input").on("input", onInput)

function onInput(e) {
  if ($(this).val() == "" && $(".row.mb-2 input").length > 1) {
    $(this).parent().remove()
    return
  }
  if ($("col-3 pb-2 input").last().val() != "") {
    $(addInputBar()).on("input", onInput)
  }
}

function addInputBar() {
  var div = document.createElement("div");
  div.setAttribute("class", "col-3 pb-2");
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control w-50");
  div.appendChild(input);
  member.appendChild(div);
  return input
}
