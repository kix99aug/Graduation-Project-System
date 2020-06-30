function backUpTime(){
    inputDays=document.getElementById('backup').querySelector('input').value
    $.post(`/api/admin/backupTimeSetting`, {routine:parseInt(inputDays)},res=>{
        $("#showBackUpTime").text(new Date(res.nextBackupDay).toLocaleDateString())
    });
}

// $(function(){
//     $("button#delete").click(e => {
//         let length = $("input:checked").length
//         $("input:checked").each(async function () {
//             await $.ajax({
//                 url: `/api/admin/time/deleteBackUp/${$(this).attr("id")}`,
//                 type: 'DELETE',
//                 success: () => length--,
//                 error: () => length--
//             })
//         })
//         setInterval(() => {
//             if (length == 0) window.location.reload()
//         }, 100);
//     })
// })