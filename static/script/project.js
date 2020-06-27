
start=location.href.lastIndexOf("ject/")
projectID=location.href.substring(start+5,location.href.length)
console.log(projectID)
function commentBtn(){
    forum=document.getElementById("forum")
    input=forum.querySelector('input').value
    forum.querySelector('input').value=""
    console.log(input)
    comment={'content':input,'teamId':projectID}
    $.ajax({
        url: "/api/team/discuss",   //後端的URL
        type: "POST",   //用POST的方式
        dataType: "json",   //response的資料格式
        cache: true,   //是否暫存
        data: comment, //傳送給後端的資料
        success: function(response) {
            //console.log(response)
            console.log(response)  //成功後回傳的資料
        }
    });
    //新增留言到畫面
 
    forum=document.getElementById('forum_content')
    copyDiv=forum.querySelector(".content").cloneNode(true)
    //改 連結 時間 姓名 內容
    copyDiv.querySelector('span').innerHTML=input
    copyDiv.querySelector('#time').innerHTML=new Date()
    namePart=copyDiv.querySelector('.m-0').querySelector('a')
    namePart.innerHTML=document.getElementById('name').innerHTML
    forum.appendChild(copyDiv)
}
