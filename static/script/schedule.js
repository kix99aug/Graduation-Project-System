var EventList=[] //事件的集合
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
ctx.moveTo(1150,230)
ctx.lineTo(1150,270)
ctx.lineTo(1180,250)
ctx.lineTo(1150,230)
ctx.fillStyle='bule'
ctx.fill()

class Event {
    constructor(year,month,day, name) {
      this.year = year
      this.month=month
      this.day=day
      this.name = name
    }
}
var a = new Event(2020,3,10,'考試');
EventList.push(a)
console.log(EventList)

<canvas class="px-3" id="timeline" width="1200px" height="500px" >123</canvas> 