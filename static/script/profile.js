var edit = document.getElementById("edit");
edit.addEventListener("click", editor);

function editor() {
  var textarea = document.getElementById("textarea");
  var text = textarea.value;
  if (textarea.disabled == true) {
    textarea.disabled = false;
  } else {
    let ele = {};
    ele.content = text;
    $.post(`/api/profile`, ele, (res) => window.location.reload());

  }
}
