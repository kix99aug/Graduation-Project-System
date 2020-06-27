$(function () {
    $.get("/api/team/storage", res => {
        res.forEach(ele => {
            let div = document.createElement('div')
            $(div).attr("class", "card")
            makeCard(ele, div)
            $(".card-columns").append(div)
        })
    })
})

function makeCard(ele, div) {
    let fa = mimetype2fa(mime.getType(ele.filename.substr(ele.filename.lastIndexOf("."))))
    if (fa == "file-image") {
        $(div).html(`
                <img src="/api/team/storage/${ele.id}" class="card-img-top" alt="...">
                <div class="card-body d-flex">
                    <i class="fas fa-${fa} mr-3"></i>
                    <h6>${ele.filename}</h6>
                </div>
                <div class="h-100 w-100 position-absolute selection" style="display: none;">
                    <div class="download h-100 w-50 d-flex justify-content-center align-items-center"><i
                            class="fas fa-download"></i></div>
                    <div class="delete h-100 w-50 d-flex justify-content-center align-items-center"><i
                            class="fas fa-trash"></i></div>
                </div>
            `)
    } else if (fa == "file-video") {
        $(div).html(`
            <video src="/api/team/storage/${ele.id}" class="card-img-top" autoplay muted loop></video>
            <div class="card-body d-flex">
                <i class="fas fa-${fa} mr-3"></i>
                <h6>${ele.filename}</h6>
            </div>
            <div class="h-100 w-100 position-absolute selection" style="display: none;">
                <div class="download h-100 w-50 d-flex justify-content-center align-items-center"><i
                        class="fas fa-download"></i></div>
                <div class="delete h-100 w-50 d-flex justify-content-center align-items-center"><i
                        class="fas fa-trash"></i></div>
            </div>
        `)
    } else {
        $(div).html(`
            <div class="card-body d-flex">
                <i class="fas fa-${fa} mr-3"></i>
                <h6>${ele.filename}</h6>
            </div>
            <div class="h-100 w-100 position-absolute selection" style="display: none;">
                <div class="download h-100 w-50 d-flex justify-content-center align-items-center"><i
                        class="fas fa-download"></i></div>
                <div class="delete h-100 w-50 d-flex justify-content-center align-items-center"><i
                        class="fas fa-trash"></i></div>
            </div>
        `)
    }
    $(div).hover(function () {
        $(this).find(".selection").fadeIn(100)
    }, function () {
        $(this).find(".selection").fadeOut(100)
    })
    $(div).find(".selection > .download").click(e => {
        var a = document.createElement('a');
        var filename = ele.filename;
        a.href = "/api/team/storage/" + ele.id;
        a.download = filename;
        a.click();
    })
    $(div).find(".selection > .delete").click(e => {
        $.ajax({
            url: `/api/team/storage/${ele.id}`,
            type: 'DELETE',
            success: function () {
                $(div).fadeOut(300, () => $(div).remove())
            }
        });
    })
}

$(".card").each(function () {
    $(this).hover(function () {
        $(this).find(".selection").fadeIn(100)
    }, function () {
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
                $(div).attr("class", "card")
                $(div).html(`
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
                `)
                $(".card-columns").append(div)

                var formdata = new FormData()
                formdata.append("file", e.originalEvent.dataTransfer.files[i])

                $.ajax({
                    url: '/api/team/storage',
                    type: 'PUT',
                    data: formdata,
                    contentType: false,
                    processData: false,
                    success: function (res) {
                        if (res.result == true) {
                            makeCard(res, div)
                        }
                    },
                    error: function (err) {
                        $(div).find(".card-body").html(`
                            <div class="d-flex w-100 h-100 justify-content-center align-items-center">
                            <i class="fas fa-times mr-3 text-danger"></i>
                                <h6 class="m-0">Failed</h6>
                            </div>
                        `)
                        setTimeout(() => {
                            $(div).fadeOut(300, () => $(div).remove())
                        }, 500)
                    }
                });
            }
        }
    })


var mapping = [
    // Images
    ['file-image', /^image\//],
    // Audio
    ['file-audio', /^audio\//],
    // Video
    ['file-video', /^video\//],
    // Documents
    ['file-pdf', 'application/pdf'],
    ['file-alt', 'text/plain'],
    ['file-code', [
        'text/html',
        'text/javascript'
    ]],
    // Archives
    ['file-archive', [
        /^application\/x-(g?tar|xz|compress|bzip2|g?zip)$/,
        /^application\/x-(7z|rar|zip)-compressed$/,
        /^application\/(zip|gzip|tar)$/
    ]],
    // Word
    ['file-word', [
        /ms-?word/,
        'application/vnd.oasis.opendocument.text',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]],
    // Powerpoint
    ['file-powerpoint', [
        /ms-?powerpoint/,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]],
    // Excel
    ['file-excel', [
        /ms-?excel/,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]],
    // Default, misc
    ['file']
]

var mappingV4 = {
    'file-alt': 'file-text'
}

function match(mimetype, cond) {
    if (Array.isArray(cond)) {
        return cond.reduce(function (v, c) {
            return v || match(mimetype, c)
        }, false)
    } else if (cond instanceof RegExp) {
        return cond.test(mimetype)
    } else if (cond === undefined) {
        return true
    } else {
        return mimetype === cond
    }
}

var cache = {}

function resolve(mimetype) {
    if (cache[mimetype]) {
        return cache[mimetype]
    }

    for (var i = 0; i < mapping.length; i++) {
        if (match(mimetype, mapping[i][1])) {
            cache[mimetype] = mapping[i][0]
            return mapping[i][0]
        }
    }
}

function mimetype2fa(mimetype, options) {
    options = Object.assign({ version: 5 }, options)
    var icon = resolve(mimetype)

    if (icon && options.prefix) {
        icon = options.prefix + icon
    }
    if (icon && options.version < 5) {
        if (mappingV4[icon]) {
            icon = mappingV4[icon]
        }
        icon = icon + '-o'
    }
    return icon
}