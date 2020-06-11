var EventList=[] //事件的集合
var canva = document.getElementById('timeline');
var ctx = canva.getContext("2d");
var canvasWidth=1200
var canvasHeight=500

basicTimeLine()


function basicTimeLine(){//畫基本的時間線元素
       //中間虛線
    ctx.moveTo(50,canvasHeight/2)
    ctx.lineTo(canvasWidth-50,canvasHeight/2)
    ctx.lineWidth=5
    ctx.setLineDash([15,5])
    ctx.strokeStyle="#494949"
    ctx.stroke()
    //三角形
    ctx.beginPath()
    ctx.moveTo(1150,230)
    ctx.lineTo(1150,270)
    ctx.lineTo(1180,250)
    ctx.lineTo(1150,230)
    ctx.fillStyle="#494949"
    ctx.fill()
    //紅色點
    ctx.beginPath()
    ctx.setLineDash([10,5])
    ctx.arc(50,250,15,0,2*Math.PI)
    ctx.fillStyle='red'
    ctx.lineWidth=3
    ctx.fill()
    ctx.stroke() 
}

class Event {
    constructor(year,month,day, name) {
      this.year = year
      this.month=month
      this.day=day
      this.name = name
    }
}

EventList.push(new Event(2020,3,10,'考試'))
EventList.push(new Event(2020,4,22,'考試2'))
EventList.push(new Event(2020,5,17,'考試2'))
EventList.push(new Event(2020,5,18,'考試2'))
EventList.push(new Event(2020,6,17,'CPEa'))
EventList.push(new Event(2020,7,17,'CPEb'))

function drawEvent(Event,interval,i){
    var pointX=i*interval+100 //x位置
    i=i%2+1 //讓奇數在下 偶數在上
    var lineHight=70*i
    var name=Event.name
    var date=Event.month+'/'+Event.day
    //畫線
    ctx.beginPath()
    ctx.moveTo(pointX,250)
    ctx.lineTo(pointX,250-lineHight)
    ctx.lineWidth=5
    ctx.setLineDash([10,0])
    ctx.strokeStyle = '#92B6EC'
    ctx.stroke()
    //畫點
    ctx.beginPath()
    ctx.arc(pointX,250-lineHight,10,0,2*Math.PI)
    ctx.fillStyle='#92B6EC'
    ctx.lineWidth=3
    ctx.fill()
    //上字
    ctx.fillStyle = "black"
    ctx.font = "20px Microsoft JhengHei"
    ctx.fillText(name,pointX-ctx.measureText(name).width/2, 250-lineHight-20)
    ctx.fillText(date,pointX-ctx.measureText(date).width/2,250-lineHight-20*2)
}

Interval=1000/(EventList.length-1) //計算每個點之間需要幾多少的間隔
for(var i=0;i<EventList.length;i++){
    drawEvent(EventList[i],Interval,i)
}