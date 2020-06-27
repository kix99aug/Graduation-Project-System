var member = document.getElementById("member");

$(".row.mb-2.px-3.mem input").on("input", onInput);

function onInput(e) {
  if ($(this).val() == "" && $(".row.mb-2.px-3.mem input").length > 1) {
    $(this).parent().remove();
    return;
  }
  if ($(".row.mb-2.px-3.mem input").last().val() != "") {
    $(addInputBar()).on("input", onInput);
  }
}

function addInputBar() {
  var div = document.createElement("div");
  div.setAttribute("class", "row mb-2 px-3 mem");
  var input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("class", "form-control w-50");
  input.setAttribute("placeholder", "成員學號");
  div.appendChild(input);
  member.appendChild(div);
  return input;
}