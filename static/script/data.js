$(".card").each(function () {
    $(this).hover(function () {
        console.log($(this), "in")
        $(this).find(".selection").fadeIn(100)
    }, function () {
        console.log($(this), "out")
        $(this).find(".selection").fadeOut(100)
    })
})

$(".content")
    .on('dragover', function (e) {
        e.preventDefault();
        e.stopPropagation();
    })
    .on('dragenter', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(".drop-prompt").fadeIn(100)
    })
    .on('drop', function (e) {
        if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) {
            e.preventDefault();
            e.stopPropagation();
            $(".drop-prompt").fadeOut(100)
            for (let i = 0; i < e.originalEvent.dataTransfer.files.length; i++) {
                let div = document.createElement('div')
                $(div).html(`
                <div class="card">
                    <div class="card-body d-flex">
                        <div class="d-flex w-100 h-100 justify-content-center align-items-center">
                            <div class="spinner-border mr-3" role="status">
                                <span class="sr-only">Loading...</span>
                            </div>
                            <h6 class="m-0">Uploading...</h6>
                        </div>
                    </div>
                    <div class="h-100 w-100 position-absolute selection" style="display: none;">
                        <div class="download h-100 w-50 d-flex justify-content-center align-items-center"><i
                                class="fas fa-download"></i></div>
                        <div class="delete h-100 w-50 d-flex justify-content-center align-items-center"><i
                                class="fas fa-trash"></i></div>
                    </div>
                </div>`)
                $(".card-columns").append(div)

                var formdata = new FormData()
                formdata.append("file", e.originalEvent.dataTransfer.files[i])

                $.ajax({
                    url: '/api/storage/upload',
                    type: 'POST',
                    data: {abc:123},
                    contentType: false,
                    processData: false,
                    success: function (response) {
                        if (response != 0) {
                            $(div).find(".card-body")
                        }
                    },
                    error: function (err) {
                        $(div).find(".card-body").html(`
                            <div class="d-flex w-100 h-100 justify-content-center align-items-center">
                            <i class="fas fa-times mr-3 text-danger"></i>
                                <h6 class="m-0">Failed</h6>
                            </div>
                        `)
                        setTimeout(()=>{
                            $(div).fadeOut(300,()=>$(div).remove())
                        },500)
                    }
                });
            }
        }
    })