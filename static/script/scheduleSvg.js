//基本底圖
var draw = SVG().addTo('#timeline').size('100%', '500px')
TimeLine=document.getElementById("timeline")
var TWidth=TimeLine.clientWidth
var TWmax=TWidth*0.95
var mainline = draw.line(60, 350, TWmax, 350)
mainline.stroke({ color: '#494949', width: 8, linecap: 'round',dasharray:"15 " })
var arraw1=draw.line(TWmax, 350, TWmax-30, 320).stroke({ color: '#494949', width: 8, linecap: 'round'})
var arraw2=draw.line(TWmax, 350, TWmax-30, 380).stroke({ color: '#494949', width: 8, linecap: 'round'})
var circle = draw.circle(40).attr({ cx: 60, cy: 350 }).fill("red")
var EventList=[]

class EventInfo{
    constructor(name,year,month,day) {
        this.name=name
        this.year=year
        this.month=month
        this.day=day
    }
}
addEvent("希望",1,2,2)
addEvent("可以",2,3,2)
addEvent("畢業",2,2,2)
addEvent("八",2,4,2)



//加入事件
function addEvent(name,year,month,day){
    var newEvent=new EventInfo(name,year,month,day)
    EventList.push(newEvent)
    sortEvent()
    drawEvent()
}
//將所有事件加入
function drawEvent(){
    //清空SVG 並將主要線重畫
    draw.clear()
    draw.line(60, 350, TWmax, 350).stroke({ color: '#494949', width: 8, linecap: 'round',dasharray:"15 " })
    draw.line(TWmax, 350, TWmax-30, 320).stroke({ color: '#494949', width: 8, linecap: 'round'})
    draw.line(TWmax, 350, TWmax-30, 380).stroke({ color: '#494949', width: 8, linecap: 'round'})
    draw.circle(40).attr({ cx: 60, cy: 350 }).fill("red")
    len=EventList.length
    var xPos=60
    var interval=((TWmax)-60)/(len+1)
    for(i in EventList){
        xPos=xPos+interval
        yPos=200
        if (i%2==0){
            yPos=250
        }else{
            yPos=150
        }
        //畫上每個事件
        draw.line(xPos, 350, xPos, yPos).stroke({ color: '#18BCDB', width: 5, linecap: 'round' })
        draw.circle(30).attr({ cx: xPos, cy: yPos }).fill("#49A3E7")
        var Name=draw.text(EventList[i].name)
        .font({ fill: '#364156', family: 'Microsoft JhengHei',size: 20 })
        Name.move(xPos-Name.length()/2,yPos-80)
        var Data=draw.text(EventList[i].month+"/"+EventList[i].day)
        .font({ fill: '#364156', family: 'Microsoft JhengHei',size: 20 })
        Data.move(xPos-Data.length()/2,yPos-50)

    }
}
//排序
function sortEvent(){
    len=EventList.length
    for(var i=0;i<len;i++){
        for(var j=0;j<len-1;j++){
            var days1=EventList[j].year*365+EventList[j].month*32+EventList[j].day
            var days2=EventList[j+1].year*365+EventList[j+1].month*32+EventList[j+1].day
            if(days1>days2){
                tempOne=EventList[j]
                tempTwo=EventList[j+1]
                EventList[j]=tempTwo
                EventList[j+1]=tempOne
            }
        }
    }
}
//按下確認按鈕
function newEventBtn(){
    var Input=document.getElementById("addEvent").querySelectorAll("input")
    if(Input[0].value=="" || Input[1].value=="" ||Input[2].value==""||Input[3].value==""){
        alert('輸入不可為空白');
    }else{
        name=Input[0].value
        year=parseInt(Input[1].value)
        month=parseInt(Input[2].value)
        day=parseInt(Input[3].value)
        if(isNaN(year)|| isNaN(month) ||isNaN(day)){
            alert('日期不可輸入字元');
        }else{
            addEvent(Input[0].value,year,month,day)
            document.getElementById("addEvent").querySelectorAll("button")[1].click()
        }
        
    }
    
}
//按下刪除按鈕
function deleteEventBtn(){
    console.log("delet")
}


//送被刪除的事件回後端
function sendDeleteEvent(eventList){
    data1={name:"name_test",year:"106",month:"2",day:"5"}
    $.ajax({
        url: "/api/team/newSchedule",   //後端的URL
        type: "POST",   //用POST的方式
        dataType: "json",   //response的資料格式
        cache: true,   //是否暫存
        data: data1, //傳送給後端的資料
        success: function(response) {
            console.log(response);  //成功後回傳的資料
        }
    });
}