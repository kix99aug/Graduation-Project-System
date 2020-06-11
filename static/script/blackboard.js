let notes = document.querySelectorAll("div.note");

let listenerDown = function (e) {
  let note = e.currentTarget
  noteX = $(note).css("left");
  noteY = $(note).css("top");
  console.log(noteX, noteY);
  originX = e.clientX;
  originY = e.clientY;
  let listenerMove = function (e) {
    e.preventDefault();
    offsetX = e.clientX - originX;
    offsetY = e.clientY - originY;
    $(note).css("left", parseInt(noteX.split("px")[0]) + offsetX);
    $(note).css("top", parseInt(noteY.split("px")[0]) + offsetY);
  };
  let listenerUp = function (e) {
    window.removeEventListener("pointermove", listenerMove);
    window.removeEventListener("pointerup", listenerUp);
  };
  window.addEventListener("pointermove", listenerMove);
  window.addEventListener("pointerup", listenerUp);
};

$(".note")
  .find("p")
  .click(function () {
    $(this).hide().siblings("textarea").show().focus().select();
  $(this).parent()[0].removeEventListener("pointerdown", listenerDown)
});

notes.forEach((note) => {
  note.addEventListener("pointerdown", listenerDown);
});

$("textarea").on("blur", function () {
  $(this).hide().siblings("p").text($(this).val()).show();
  $(this).parent()[0].addEventListener("pointerdown", listenerDown)
});

// let canvas = document.querySelector("canvas#blackboard")
// var img = new Image()
// img.src = "/static/images/blackboard.png"
// var note = new Image();
// note.src = "/static/images/note.png"
// img.onload = function () {

//     canvas.width = img.width
//     canvas.height = img.height
//     var ctx = canvas.getContext('2d')
//     ctx.drawImage(img, 0, 0)
//     noteX = 200,noteY=200
//     ctx.drawImage(note, noteX, noteY , 500,500)
//     canvas.onmousedown = function (e) {
//         console.log("???")
//         originX = e.clientX
//         originY = e.clientY
//         canvas.onmousemove = function (e) {
//             offsetX = e.clientX-originX
//             offsetY = e.clientY-originY
//             // console.log(e)
//             ctx.clearRect(0, 0, canvas.width, canvas.height);
//             ctx.drawImage(img,0,0);
//             ctx.drawImage(note, noteX + offsetX , noteY + offsetY, 500, 500);
//         };

//         canvas.onmouseup = function (e) {
//             noteX = e.clientX
//             noteY = e.clientY
//             canvas.onmousemove = null;
//             canvas.onmouseup = null;
//         };
//     }
// }
