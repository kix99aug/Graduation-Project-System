let notes;

let noteW, noteH;

let listenerDown = function (e) {
  let note = e.currentTarget;
  let key = $(this).data("noteid");
  let ele = notes[key];
  noteX = parseInt($(note).css("left").split("px")[0]);
  noteY = parseInt($(note).css("top").split("px")[0]);
  originX = e.clientX;
  originY = e.clientY;
  let listenerMove = function (e) {
    e.preventDefault();
    newX = noteX + e.clientX - originX;
    newY = noteY + e.clientY - originY;
    let x =
      (newX - 0.1 * $(".blackboard").width()) /
      (0.8 * $(".blackboard").width() - noteW);
    let y =
      (newY - 0.15 * $(".blackboard").height()) /
      (0.7 * $(".blackboard").height() - noteH);
    if (x >= 0 && x <= 1) {
      ele.x = x;
      $(note).css("left", newX);
    }
    if (y >= 0 && y <= 1) {
      ele.y = y;
      $(note).css("top", newY);
    }
  };
  let listenerUp = function (e) {
    $.post(`/api/team/blackboard/modify/${key}`, ele, (res) => console.log(res));
    window.removeEventListener("pointermove", listenerMove);
    window.removeEventListener("pointerup", listenerUp);
  };
  window.addEventListener("pointermove", listenerMove);
  window.addEventListener("pointerup", listenerUp);
};

function newNote(key) {
  let ele = notes[key];
  let note = document.createElement("div");
  let text = document.createElement("div");
  let input = document.createElement("textarea");
  $(text).text(ele.content);
  $(input).text(ele.content);
  $(note)
    .attr("class", "note")
    .data("noteid", key)
    .append(text)
    .append(input)
    .css(
      "left",
      parseFloat(ele.x) * ($(".blackboard").width() * 0.8 - noteW) +
        $(".blackboard").width() * 0.1
    )
    .css(
      "top",
      parseFloat(ele.y) * ($(".blackboard").height() * 0.7 - noteH) +
        $(".blackboard").height() * 0.15
    );
  $(".blackboard").append(note);
  note.addEventListener("pointerdown", listenerDown);
  $(input).on("blur", function () {
    if ($(this).val() == "") {
      if (key != -1) $.get(`/api/team/blackboard/remove/${key}`);
      delete notes[key];
      $(note).remove();
    } else {
      $(this).parent()[0].addEventListener("pointerdown", listenerDown);
      if ($(this).val() == $(this).siblings("div").text()) {
        $(this).hide().siblings("div").show();
        return;
      }
      $(this).hide().siblings("div").text($(this).val()).show();
      ele.content = $(this).val();
      if (key == -1) {
        $.post(`/api/team/blackboard/new`, ele, (res) => {
          $(this).parent().data("noteid", res.id);
          notes[res.id] = ele;
          delete notes[-1];
        });
      } else
        $.post(`/api/team/blackboard/modify/${key}`, ele, (res) => console.log(res));
    }
  });
  $(text).click(function (e) {
    e.preventDefault();
    $(this).hide().siblings("textarea").show().focus().select();
    $(this).parent()[0].removeEventListener("pointerdown", listenerDown);
  });
  if (key == -1) $(text).click();
}

function run() {
  $(".blackboard").empty();
  $(".blackboard").dblclick((e) => {
    e.preventDefault();
    let x =
      (e.offsetX - 0.1 * $(".blackboard").width()) /
      (0.8 * $(".blackboard").width() - noteW);
    let y =
      (e.offsetY - 0.15 * $(".blackboard").height()) /
      (0.7 * $(".blackboard").height() - noteH);
    if (x >= 0 && x <= 1 && y >= 0 && y <= 1) {
      notes[-1] = { x: x, y: y, content: "", created: false };
      newNote(-1);
    }
  });
  for (let key in notes) {
    newNote(key);
  }
}

function resetNoteSize() {
  let tmp = document.createElement("div");
  $(tmp).attr("class", "note");
  $(tmp).hide();
  $(".blackboard").append(tmp);
  (noteW = $(tmp).width()), (noteH = $(tmp).height());
  $(tmp).remove();
}

$(window).resize(function () {
  $(".note").each(function () {
    resetNoteSize();
    let ele = notes[$(this).data("noteid")];
    $(this)
      .css(
        "left",
        parseFloat(ele.x) * ($(".blackboard").width() * 0.8 - noteW) +
          $(".blackboard").width() * 0.1
      )
      .css(
        "top",
        parseFloat(ele.y) * ($(".blackboard").height() * 0.7 - noteH) +
          $(".blackboard").height() * 0.15
      );
  });
});

fetch("/api/team/blackboard/all")
  .then((res) => {
    return res.json();
  })
  .then((json) => {
    if (json.result) {
      resetNoteSize();
      console.log(json.data);
      notes = json.data;
      run();
    }
  });
