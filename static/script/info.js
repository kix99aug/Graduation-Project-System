
var projectName = document.getElementById("projectName")
var edit = document.getElementById("edit")
var textarea = document.getElementById("textarea")

edit.addEventListener("click",editor)

function editor(){
    let ele = {};
    ele.projectName = projectName.value
    ele.info = textarea.value
    $.post(`/api/team/info`, ele, (res) => console.log(ele));

    
}