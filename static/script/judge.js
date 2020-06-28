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
  if (teamMate.score == null) p3.innerHTML = "尚未評分";
  else p3.innerHTML = teamMate.score + "分";
  div.appendChild(p3);
  rec.appendChild(div);
}

function appendChilds2(teamMate) {
  if (teamMate.group == 2) {
    return;
  }
  var hiderec = document.getElementById("hiderec");
  var div = document.createElement("div");
  div.setAttribute("class", "row d-flex flex-row justify-content-center py-1");
  var i = document.createElement("i");
  i.setAttribute("class", "fas fa-arrow-right mt-2");
  var p1 = document.createElement("p");
  p1.setAttribute("class", "px-3");
  p1.setAttribute("style", "font-size: 24px;");
  var p2 = document.createElement("p");
  p2.setAttribute("class", "px-3");
  p2.setAttribute("style", "font-size: 24px;");
  var p3 = document.createElement("input");
  p3.setAttribute("class", "form-control ");
  p3.setAttribute("type", "text");
  if(teamMate.score == null) p3.setAttribute("placeholder", "分數");
  else p3.setAttribute("value", teamMate.score);
  p3.setAttribute("style", "width:15%");
  div.appendChild(i);
  p1.innerHTML = teamMate.account;
  div.appendChild(p1);
  p2.innerHTML = teamMate.name;
  div.appendChild(p2);
  div.appendChild(p3);
  hiderec.appendChild(div);
  var id = teamMate._id;
  
}

var length;
fetch("/api/team/judge")
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json.result) {
      let ele = {};

      for (var i = 0; i < json.teamMate.length; i++) {
        appendChilds(json.teamMate[i]);
        appendChilds2(json.teamMate[i]);

      }

      if (json.group == 3) {
        var refreshbtn = document.getElementById("refreshbtn");
        refreshbtn.style.visibility = "hidden";
      } else {
        var refreshbtn = document.getElementById("refreshbtn");
        refreshbtn.style.visibility = "visible";
      }

      var push = document.getElementById("push");
      push.addEventListener("click", function () {
        var input = document.querySelectorAll("#hiderec input");
        let score = {}
        for(var i = 0; i < input.length; i++){
            score[i] = input[i].value
            ele[i] = score[i]
        }

        var teamMateScore = document.getElementById("teamscore");
      
        ele.teamscore = teamMateScore.value;
        $.post(`/api/team/judge/score`, ele, (res) => window.location.reload());

      });
    }
  });
