var projectName = document.getElementById("projectName")
var edit = document.getElementById("edit")
var textarea = document.getElementById("textarea")
var member = document.getElementById("member")
edit.addEventListener("click",editor)

function editor(){
    let ele = {};
    ele.projectName = projectName.value
    ele.info = textarea.value
    $.post(`/api/team/info`, ele, (res) => console.log(ele));
}

function appendChilds(teamMate){
    var name_rec = document.getElementById("name_rec");
    var div = document.createElement("div");
    div.setAttribute("class", "d-inline-flex px-1");
    var p = document.createElement("p");
    p.setAttribute("class","mb-1");
    p.innerHTML = teamMate.name;
    div.appendChild(p);
    name_rec.appendChild(div);
}
fetch("/api/team/info_2")
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json.result) {
        console.log("json.teamMate")
      for (var i = 0; i < json.teamMate.length; i++) {
        if(json.teamMate[i].group == 2 ) continue;
        else appendChilds(json.teamMate[i]);
      }
    }
  });