

let canvas = document.querySelector("canvas#blackboard")
var img = new Image()
img.src = "/static/images/blackboard.png"
img.onload = function(){

    canvas.width = img.width
    canvas.height = img.height
    var ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    
}