$("input,textarea").change(function(){
  console.log(this.value)
  let ele = {}
  ele[this.name] = this.value
  $.post(`/api/profile`, ele)
})