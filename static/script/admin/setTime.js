function backUpTime(){
    inputDays=document.getElementById('backup').querySelector('input').value
    document.getElementById('backup').querySelector('input').value=""
    document.getElementById('backup').querySelector('.close').click()
    var now=new Date()
    var year=now.getFullYear()
    var month=now.getMonth()
    var day=now.getDate()
    console.log(now)
    var setDay=new Date(year,month,day+parseInt(inputDays))
    year=setDay.getFullYear()
    month=setDay.getMonth()
    day=setDay.getDate()
    console.log(setDay)
    document.getElementById('showBackUpTime').innerHTML=year+"年"+(month+1)+"月"+day+"日"
    
}