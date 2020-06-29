var mA = document.querySelectorAll(".mA");
var origin_ma = {};
for(var i = 0; i < mA.length; i++){
    origin_ma[i] = mA[i].value
}
var btn = document.getElementById("btn")
btn.addEventListener("click",function(){
    var pN = document.querySelector(".pN").value;
    var tN = document.querySelector(".tN").value;
    var lA = document.querySelector(".lA").value;
    var mA = document.querySelectorAll(".mA");
    var pI = document.querySelector(".pI").value; 

    let ele = {}
    let ma = {}
    ele.tN = tN
    ele.pI = pI
    ele.pN = pN
    ele.lA = lA
    ele.grade = $("input[name='grade']").val()

    for(var i = 0; i < mA.length; i++){
        ma[i] = mA[i].value
    }

    ma[mA.length] = lA
    ele.mas = ma
    $.post(`/api/admin/editPI${window.location.pathname.substr(window.location.pathname.lastIndexOf("/"))
    }`, ele, (res) =>{
        if(res.result){
            $( ".alert-light.success" ).show( "slow" );
            setTimeout(()=>$(".alert-light.success").slideUp(),1500)
            setTimeout(()=>window.location.reload(),2000)
        }
       
    });
})