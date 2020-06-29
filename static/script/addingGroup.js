var member = document.getElementById("addingMembers");

$(".mem input").on("input", onInput)

function onInput(e) {
  if ($(this).val() == "" && $(".mem input").length > 2) {
    $(this).remove()
    return
  }
  if ($(".mem input").last().val() != "") {
    addInputBar().on("input", onInput)
  }
}

function addInputBar() {
  return $(`<input type="text" style="width: 150px;" placeholder="成員學號" class="form-control mt-1">`).appendTo(".mem")
}