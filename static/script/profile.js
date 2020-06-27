var edit = document.getElementById("edit")
edit.addEventListener("click",editor)
var textarea = document.getElementById("textarea")
function editor(){
    console.log(textarea.disabled)
    textarea.disabled = false
    console.log(textarea.disabled)
}
