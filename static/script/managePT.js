$("button#delete").click((e) => {
    let list = $("input:checked")
    if (list.length == 0) return
    $(".modal-body > ul").empty()
    $("input:checked").each(
        function () {
            $(".modal-body > ul").append(`<li>${$(this).parent().text().split("編輯專題團隊內容")[0]}</li>`)
        }
    )
    $("#confirmDelete").modal()
})
$("button#confirm").click(e => {
    let length = $("input:checked").length
    $("input:checked").each(async function () {
        await $.ajax({
            url: `/api/admin/projectTeam/${$(this).attr("id")}`,
            type: 'DELETE',
            success: () => length--,
            error: () => length--
        })
    })
    setInterval(() => {
        if (length == 0) window.location.reload()
    }, 100);
})
$("input.search").on('input', function () {
    const query = $(this).val()
    $(`input[type="checkbox"]`).each(function () {
        if ($(this).parent().text().split("編輯專題團隊內容")[0].search(query) == -1) {
            $(this).prop(`checked`, false)
            $(this).parent().hide()
        } else {
            $(this).parent().show()
        }
    })
});
$("button#select").click(function () {
    let allchecked = true
    $(`input[type="checkbox"]`).each(function () {
      if (!$(this).prop(`checked`)) allchecked = false
    })
    $(`input[type="checkbox"]`).prop(`checked`, !allchecked)
})
$('.newTeam').click(evt=>{
    var members = [];
    $(".mem input").each(function(){
      if($(this).val() != "") members.push($(this).val())
    })
    $.ajax({
      method:'POST',
      url:'/api/admin/newTeam',
      type:'json',
      cache:true,
      data:{
        name:`${$("input[name='grade']").val()} ${$("input.teacher").val()} ${members}`,
        grade:$("input[name='grade']").val(),
        teacher:$("input.teacher").val(),
        members:members
      },
      success:msg=>{
        console.log(msg)
      if(msg.result){
        $('#addingTeam').modal('hide');
        $( ".alert-light.success" ).show( "slow" );
        setTimeout(()=>$(".alert-light.success").slideUp(),1500)
        setTimeout(()=>window.location.reload(),2000)
      }
      else{
        $('#addingTeam').modal('hide');
        $(".alert-light.danger").show( "slow" );
        setTimeout(()=>{
          $(".alert-light.danger").slideUp();
        },1500)
        setTimeout(()=>{
          window.location.href = "/admin/managePT";
        },2000)
      }
    }
    })
})
