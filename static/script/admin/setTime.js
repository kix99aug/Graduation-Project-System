function backUpTime(){
    inputDays=document.getElementById('backup').querySelector('input').value
    document.getElementById('backup').querySelector('input').value=""
    document.getElementById('backup').querySelector('.close').click()
    var now=new Date()
    var year=now.getFullYear()
    var month=now.getMonth()
    var day=now.getDate()
    var setDay=new Date(year,month,day+parseInt(inputDays))
    year=setDay.getFullYear()
    month=setDay.getMonth()
    document.getElementById('showBackUpTime').innerHTML=year+"年"+(month+1)+"月"+day+"日"
}

$(function(){
    $("button#delete").click(e => {
        let length = $("input:checked").length
        $("input:checked").each(async function () {
            await $.ajax({
                url: `/api/admin/time/deleteBackUp/${$(this).attr("id")}`,
                type: 'DELETE',
                success: () => length--,
                error: () => length--
            })
        })
        setInterval(() => {
            if (length == 0) window.location.reload()
        }, 100);
    })
})