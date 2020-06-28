// function searchBtn(){
//     searchInput=document.querySelector("#search").value
//     console.log(searchInput)
//     $.ajax({
//         url: "/search",   //後端的URL
//         type: "POST",   //用POST的方式
//         dataType: "json",   //response的資料格式
//         cache: true,   //是否暫存
//         data: {'searchInput':searchInput}, //傳送給後端的資料
//         success: function(response) {
//             console.log(response)
//             document.location.href=response.redirect
//         }
//     });
// }