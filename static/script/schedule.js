var canvas = document.getElementById('timeline');
var ctx = canvas.getContext("2d");
var canvasWidth=1200
var canvasHeight=500
//中間虛線
ctx.moveTo(50,canvasHeight/2)
ctx.lineTo(canvasWidth-50,canvasHeight/2)
ctx.lineWidth=5
ctx.setLineDash([10,5])
ctx.stroke()
//三角形
ctx.beginPath()
ctx.moveTo(900,230)
ctx.lineTo(900,270)
ctx.lineTo(930,250)
ctx.lineTo(900,230)
ctx.fillStyle='bule'
ctx.fill()