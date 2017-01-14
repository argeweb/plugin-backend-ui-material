// yooliang material backend
// 侑良管理後台
// Version 1.01 (2016/08/21)
// @requires jQuery v2 or later
// Copyright (c) 2016 Qi-Liang Wen 啟良
function ajax(url,data,successCallback,errorCallback,headers){$.ajax({url:url,type:"GET",headers: headers,cache: true,data:data,async:1,success:function(responseText){successCallback(responseText)},error:function(xhr,ajaxOptions,thrownError){if(errorCallback){errorCallback(xhr.responseText)}else{show_message(thrownError.message)}}})};
function json(url,data,successCallback,errorCallback){$.ajax({url:url,type:"POST",dataType:"json",data:data,async:!1,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?show_message(d.message):errorCallback(d.message)}})};
function json_async(url,data,successCallback,errorCallback){$.ajax({url:url,type:"POST",cache: false,dataType:"json",data:data,async:1,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?show_message(d.message):errorCallback(d.message)}})};
function replaceParam(a,b,c){a=a.replace("#/","");var d="";var m=a.substring(0,a.indexOf("?"));var s=a.substring(a.indexOf("?"),a.length);var j=0;if(a.indexOf("?")>=0){var i=s.indexOf(b+"=");if(i>=0){j=s.indexOf("&",i);if(j>=0){d=s.substring(i+b.length+1,j);s=a.replace(b+"="+d,b+"="+c)}else{d=s.substring(i+b.length+1,s.length);s=a.replace(b+"="+d,b+"="+c)}}else{s=a+"&"+b+"="+c}}else{s=a+"?"+b+"="+c}return s};
function getRandID(a){if(a==undefined){a="rand-id-"}var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(var i=0;i<5;i++)a+=b.charAt(Math.floor(Math.random()*b.length));return a};

var progress_bar = {
    "dom": $(".progress-bar"),
    "set": function(n){
        setTimeout(function(){ progress_bar.dom.width(n + "%"); }, 0);
        if (n==100){
            setTimeout(function(){ progress_bar.dom.width(0); }, 2500);
        }
    }
};
var affix = function(top){
    if (top >= 25){
        $("header.header").addClass("affix");
    }else{
        $("header.header").removeClass("affix");
    }
};
var pageDOD = function(evt){
    evt.preventDefault();
    evt.stopPropagation();
    content_iframe.focus();
};
var message = {
    "list": [],
    "snackbarText": 1,
    "quick_show": function(msg, timeout){
        if (timeout !== undefined){
            swal({
              title: "",
              html: msg,
              timer: timeout,
              showConfirmButton: false
            }).done();
        }else{
            swal(msg).done();
        }
    },
    "snackbar": function(msg, sec){
		$('body').snackbar({
            alive: sec,
			content: msg,
			show: function () {
				message.snackbarText++;
			}
		});
    },
    "showAll": function(target){
        $(target).find(".alert").each(function(){
            var kind = "info";
            var $alert = $(this);
            if ($alert.hasClass("alert-info")){ kind = "info"; }
            if ($alert.hasClass("alert-warning")){ kind = "warning"; }
            if ($alert.hasClass("alert-success")){ kind = "success"; }
            if ($alert.hasClass("alert-danger")){ kind = "danger"; }
            message.insert(kind, $alert.data("title"), $alert.html(), $alert.data("image"));
        });
    },
    "ui":{
        "show": function(autoHide){
            $(".alert-moment").each(function(){
                var d = $(this).data("create");
                $(this).text(moment(d).fromNow());
            });
            if ($(".msg").length > 25){
                $(".msg").last().remove();
            }
            if (autoHide != undefined && autoHide == true){
                clearTimeout(message.ui.hideTimer);
                message.ui.hideTimerCount = 5;
                message.ui.hideAuto();
            }
        },
        "hideAuto": function(){
            message.ui.hideTimerCount = parseInt(message.ui.hideTimerCount) - 1;
            if (message.ui.hideTimerCount <= 0){
                message.ui.hide();
            }else{
                message.ui.hideTimer = setTimeout(message.ui.hideAuto, 1000);
            }
        },
        "hide": function(){
            $("#message-box").parent("li").removeClass("open");
            message.ui.hideTimerCount = 0;
        }
    },
    "insert": function(kind, title, new_message, image, mini){
        var msg_id = getRandID("message-");
        if (new_message != undefined && new_message != ""){
            message.list.push({"kind": kind, "title": title, "text": new_message, "image": image, "message_id": msg_id, "mini": mini});
        }
        return msg_id;
    },
    "change": function(message_id, kind, title, new_message, image, mini){
        message.list.push({"kind": kind, "title": title, "text": new_message, "image": image, "message_id": message_id, "mini": mini});
    },
    "afterInsert": function(){
        if (message.list.length > 0){
            var p = message.list.pop();
            if (p != undefined && p.text != ""){
                var title = '';
                var tag = '';
                var image = '';
                switch (p.kind) {
                    case "info":
                        tag = '<i class="glyphicon glyphicon-bullhorn"></i>';
                        title = '訊息';
                        break;
                    case "warning":
                        tag = '<i class="glyphicon glyphicon-bell"></i>';
                        title = '注意';
                        break;
                    case "danger":
                        tag = '<i class="glyphicon glyphicon-info-sign"></i>';
                        title = '錯誤';
                        break;
                    case "success":
                        tag = '<i class="glyphicon glyphicon-ok"></i>';
                        title = '成功';
                        break;
                }
                if (p.image != undefined && p.image != ""){
                  tag = '<i class="glyphicon"></i>';
                  image = 'url(' + p.image  + ')';
                }else{
                  image = "none";
                }
                if (p.title != undefined && p.title != ""){ title = p.title; }
                var pid = "#" + p.message_id;
                if ($(pid).length == 0){
                    var insertHtml =
                        '<a class="tile waves-attach" id="' + p.message_id + '" href="javascript:void(0)">' +
                            '<div class="tile-side pull-left">' +
                                '<div class="avatar avatar-sm">' +
                                    '<div class="alert-tag" style="background-size: cover;"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="tile-inner text-black">' +
                                '<span class="alert-moment"></span>' +
                                '<span class="alert-title"></span>' +
                                '<span class="alert-text"></span>' +
                            '</div>' +
                        '</a>';
                    $("#message-box").prepend(insertHtml);
                }
                $(pid).find(".alert-tag").html(tag).removeClass("alert-info alert-warning alert-danger alert-success")
                    .addClass("alert-" + p.kind).css("background-image", image);
                $(pid).find(".alert-moment").data("create", moment().format());
                $(pid).find(".alert-title").text(title);
                $(pid).find(".alert-text").html(p.text);
                $("#message-count").text($("#message-box li").length -1);
                var mini = false;
                if (p.mini != undefined && p.mini == true){ mini = p.mini;}
                if (mini == false){ message.ui.show(true); }
            }
        }
    }
};
Object.defineProperty(message.list, "push", {
    configurable: false,
    enumerable: false, // hide from for...in
    writable: false,
    value: function () {
        for (var i = 0, n = this.length, l = arguments.length; i < l; i++, n++) {
            this[n] = arguments[i];
            message.afterInsert(); // assign/raise your event
        }
        return n;
    }
});

var uploader = {
    "init": function(){
        $(document).on('change','#image-file-picker' , function(){
            uploader.startUpload();
        });
    },
    "pickup_target": null,
    "pickup_target_is_editor": false,
    "pickup": function($target, ed){
        uploader.pickup_target = $target;
        uploader.pickup_target_is_editor = ed;
        if (ed != true){
            if ($target.hasClass("image")){
                $("#image-file-picker").attr("accept", "image/*");
            }else{
                $("#image-file-picker").attr("accept", "*");
            }
        }
        $("#image-file-picker").click();
    },
    "startUpload": function(){
        var fileInput = document.getElementById('image-file-picker');
        var file = fileInput.files[0];
        uploader.addFile(file, uploader.pickup_target, function(data){
            var url = data.response.url;
            var item_key = data.response.item.__key__;
            if (uploader.pickup_target_is_editor) {
                uploader.pickup_target.selection.setContent('<img src="' + url + '" />');
            }else{
                uploader.pickup_target.val(url).data("key", item_key).change();
            }
            $("#image-file-picker").val("");
        });
    },
    "addFile": function(file, target_id, callback){
        progress_bar.set(10);
        var message_id = message.insert("info", "準備上傳", "等待中....", undefined, true);
        json_async("/admin/user_file/user_file/get_url", null, function(data){
            progress_bar.set(20);
            uploader.upload({
                "message_id": message_id,
                "upload_url": data["url"],
                "file": file,
                "target_id": target_id,
                "callback": callback
            });
        }, function(data){
            progress_bar.set(0);
            message.change(message_id, "danger", "發生錯誤", "無法取得上傳的路徑，請稍候再試一次");
        });
    },
    "upload": function(upload_target){
        var reader = new FileReader();
        reader.reader_info = upload_target;
        reader.readAsDataURL(upload_target.file);
        reader.onload = function(e){
            this.reader_info.image = this.result;
            progress_bar.set(30);
            message.change(this.reader_info.message_id, "info", "正在上傳", "等待中....", this.reader_info.image, true);
            var fd = new FormData();
            var xhr = new XMLHttpRequest();
            xhr.xhr_info = this.reader_info;
            xhr.upload.upload_info = this.reader_info;
            xhr.open('POST', this.reader_info.upload_url);
            xhr.onload = function(data) {
                progress_bar.set(100);
                message.snackbar("上傳完成");
                message.change(this.xhr_info.message_id, "success", "上傳完成", "100 %, 上傳完成", this.xhr_info.image, true);
                if (typeof this.xhr_info.callback === "function"){
                    eval('var a = ' + data.currentTarget.response);
                    this.xhr_info.callback({
                        "response": a,
                        "target_id": this.xhr_info.target_id
                    });
                }
            };
            xhr.onerror = function(e) {
                message.change(this.xhr_info.message_id, "danger", "上傳失敗", "請重整頁面後再試一次", this.xhr_info.image, true);
                progress_bar.set(0);
            };
            xhr.upload.onprogress = function (evt) {
                if (evt.lengthComputable) {
                    var complete = (evt.loaded / evt.total * 100 | 0);
                    if(100==complete){
                        complete=99.9;
                    }
                    var the_xhr = this;
                    setTimeout(function(){
                        message.change(the_xhr.upload_info.message_id, "info", "正在上傳", complete + ' %', the_xhr.upload_info.image, true);
                    }, 0);
                    progress_bar.set(complete);
                }
            };
            fd.append('name', this.reader_info.file.name);
            fd.append('content_type', this.reader_info.file.type);
            fd.append('content_length', this.reader_info.file.size);
            fd.append('file', this.reader_info.file);
            xhr.send(fd);//開始上傳
        };
        if(/image\/\w+/.test(upload_target.file.type)){
        }
    }
};
var content_iframe = {
    "instance": null,
    "history": {},
    "last_url": null,
    "need_focus": false,
    "is_init": false,
    "loading_timer": null,
    "loading_lock": false,
    "init": function(selector){
        if (this.is_init) return;
        this.is_init = true;
        this.instance = $(selector).get(0);
        this.instance.contentWindow.setBodyClass("iframe");
        window.onpopstate = this.popState;
        var h = JSON.parse(localStorage.getItem('content_iframe.history'));
        if (h != null && h != [] && h != "null") content_iframe.history = h;
        //  常用項目 (利用本機儲存記錄各頁面查看次數，用以顯示為常用項目)
        //var sort_list = [];
        //var $menu_usually = $("#menu_usually");
        //$menu_usually.parent().addClass("hidden");
        //$.map(iframe.history, function(n) { if (n.visit > 10){ sort_list.push(n); }});
        //sort_list.sort(function(a, b) { return a.visit < b.visit; });
        //var count = 0;
        //$.map(sort_list, function(n){
        //    if (count < 5){
        //        count++;
        //        $menu_usually.append('<li><a class="waves-attach" href="'+ n.href +'" target="content_iframe">'+ n.text +'</a></li>');
        //        $menu_usually.parent().removeClass("hidden");
        //    }
        //});
        // ====
        var $linkList = $("a[target=content_iframe]");
        $linkList.click(function(event){
            var i_text = $(this).find(".icon").text() ? ($(this).find(".icon").length>0) : "";
            var t = $(this).text().replace(i_text, "").trim();
            if ($(this).hasClass("main-link")){ aside_iframe.closeUi(); }
            content_iframe.load($(this).attr("href"), t, content_iframe.last_url, true);
            event.preventDefault();
        });
        var b = $("body").data("dashboard-name");
        if(window.location.hash) {
            var hash = window.location.hash.replace("#", "");
            var last_page = this.getState(hash);
            if (last_page != null){
                content_iframe.load(hash, last_page.text, last_page.referer_page, false);
            }else{
                content_iframe.load(hash, "最後檢視", {}, false);
            }
        }else{
            content_iframe.load("/"+b+"/welcome", "Welcome");
        }
        $(".content").hover(function(){ }, function(){
            setTimeout(function(){
                if (content_iframe.need_focus == false){
                    $(".iframe_mask").show();
                }
            }, 800);
        });
        $(".iframe_mask").hover(content_iframe.focus, function(){ content_iframe.need_focus = false; }).mouseover(content_iframe.focus).mouseenter(content_iframe.focus).click(content_iframe.focus)
    },
    "focus": function(){
        $(".iframe_mask").hide();
        content_iframe.need_focus = true;
        content_iframe.instance.contentWindow.focus();
        var contents = null;
        try{
            contents = $(this.instance).contents();
        }catch(e){
            contents = this.instance.contents();
        }
        contents.find('body').click();
    },
    "removeMask": function(){
        content_iframe.need_focus = true;
        $(".iframe_mask").hide();
    },
    "reload": function(keep_aside){
        if (!(keep_aside && keep_aside == true)) aside_iframe.closeUi();
        var last_page = this.getState();
        if (last_page != null) {
            content_iframe.load(last_page.href, last_page.text, last_page.referer_page, false);
        }
    },
    "getUrl": function(){
        return this.last_url;
    },
    "load": function(url, text, referer_page, need_push){
        affix(0);
        if (this.loading_lock == true) return false;
        this.loading_lock = true;
        clearTimeout(this.loading_timer);
        this.loading_timer = setTimeout(function(){
            content_iframe.instance.contentWindow.showTimeout();
        }, 25000);
        this.last_url = url;
        console.log(need_push);
        if (typeof need_push === "undefined"){ need_push = true }
        if (need_push){ this.pushState(url , text, referer_page); }
        content_iframe.instance.contentWindow.showLoading(function(){
            ajax(url, null, function(page){
                var data = content_iframe.getState();
                if (need_push){
                    if (data) history.pushState(data, data.text, "#" + data.href);
                }
                clearTimeout(content_iframe.loading_timer);
                content_iframe.loading_lock = false;
                content_iframe.instance.contentWindow.pageInit(page);
            }, function(page){
                clearTimeout(content_iframe.loading_timer);
                content_iframe.loading_lock = false;
                content_iframe.instance.contentWindow.pageInit(page);
                return false;
            }, {
                "is_ajax": "true",
                "page_view": view.current
            });
        });
    },
    "getState": function(url) {
        if (typeof url === "undefined") url = content_iframe.getUrl();
        if (url in content_iframe.history){
            return content_iframe.history[url];
        }
        return null;
    },
    "pushState": function(url, text, referer_page){
        var referer_page_data = this.getState(referer_page);
        if (referer_page_data && referer_page_data.referer_page){
            referer_page = referer_page_data.referer_page;
        }
        var history_item = null;
        if (url in content_iframe.history){
            history_item = content_iframe.history[url];
            history_item.last_date = Date.now();
            if (history_item.visit){
                history_item.visit++;
            }else{
                history_item.visit = 1
            }
            localStorage.setItem('content_iframe.history', JSON.stringify(content_iframe.history));
            return false;
        }
        content_iframe.history[url] ={
            "href": url,
            "text": text,
            "visit": 1,
            "last_date": Date.now(),
            "referer_page": referer_page
        };
        localStorage.setItem('content_iframe.history', JSON.stringify(content_iframe.history));
    },
    "popState": function(event){
        var s = event.state;
        if (s){
            content_iframe.load(s.href, s.text, s.referer_page, false);
        }
    },
    "search": function(keyword){
        var url = "";
        var current = this.last_url;
        if (keyword != undefined && keyword != ""){
            url = replaceParam(current, "query", keyword);
            url = replaceParam(url, "cursor", "");
            url = url.replace("?cursor=none", "?");
            url = url.replace("&cursor=none", "");
            this.load(url);
        }
        if (keyword == ""){
            url = replaceParam(current, "query", "");
            url = url.replace("query=", "");
            this.load(url);
        }
    }
};
var aside_iframe = {
    "instance": null,
    "is_open": false,
    "last_url": null,
    "is_init": false,
    "loading_timer": null,
    "loading_lock": false,
    "init": function(selector){
        if (this.is_init) return;
        this.is_init = true;
        this.instance = $(selector).get(0);
        this.instance.contentWindow.setBodyClass("aside");
        $(window).resize(function(){
            $("#aside_iframe.open").stop().animate({"width": ($(window).width() < 992) ? "100%" : "72%"}, 200);
        })
    },
    "load": function(url){
        if (this.loading_lock == true) return false;
        this.loading_lock = true;
        clearTimeout(this.loading_timer);
        this.loading_timer = setTimeout(function(){
            aside_iframe.loading_lock = false;
            aside_iframe.instance.contentWindow.showTimeout();
        }, 250000);

        this.last_url = url;
        if (this.is_open) {
            aside_iframe.instance.contentWindow.showLoading(function(){
                aside_iframe.runAjax(url);
            });
        }else{
            aside_iframe.showUi();
            aside_iframe.instance.contentWindow.showLoading(function(){
                aside_iframe.runAjax(url);
            });
        }
        //contents.find("head").append(
        //    $("<link/>", { rel: "stylesheet", href: '/plugins/backend_ui_material/static/css/style.min.css?v=4.1.0', type: "text/css" })
        //);
    },
    "reload": function(){
        this.load(this.last_url);
    },
    "runAjax": function(url){
        var headers = {
            "is_ajax": "true",
            "aside": "aside_iframe"
        };
        ajax(url, null, function(page){
            clearTimeout(aside_iframe.loading_timer);
            aside_iframe.loading_lock = false;
            aside_iframe.instance.contentWindow.pageInit(page);
        }, function(page){
            clearTimeout(aside_iframe.loading_timer);
            aside_iframe.loading_lock = false;
            aside_iframe.instance.contentWindow.pageInit(page);
        }, headers);
    },
    "showUi": function(callback){
        $("#aside_iframe").stop().animate({"width": ($(window).width() < 992) ? "100%" : "72%"}, 500, function(){
            aside_iframe.is_open = true;
            aside_iframe.instance.contentWindow.addClass("open");
            if (typeof callback === "function") callback();
        });
    },
    "closeUi": function(callback){
        $("#aside_iframe").stop().animate({"width": "0"}, 500, function(){
            aside_iframe.is_open = false;
            try{ aside_iframe.instance.contentWindow.removeClass("open"); }catch(e){}
            if (typeof callback === "function") callback();
        });
    }
};
function print(){
    var target = aside_iframe.is_open ? aside_iframe : iframe;
    var target_window = target.instance.contentWindow;
    target_window.print();
}
var shortcut = {
    keys: 'ctrl+r, `, ctrl+s, ctrl+shift+s, ctrl+p, esc, f5, ctrl+f5, alt+s, ' +
    'alt+1, alt+2, alt+3, alt+4, alt+5, alt+6, alt+7, alt+8, alt+9, /, shift+/',
    timer: null,
    lock: false,
    "init": function(){
        var s = [];
        var n = 1;
        $(".op-mode a").each(function(){
            s.push($(this).data("view-key"));
            s.push(n.toString());
            n++;
        });
        shortcut.keys += ", " + s.join(", ");
        console.log(shortcut.keys);
        key.filter = function(event){
            var tagName = (event.target || event.srcElement).tagName;
            key.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'doc');
            return true;
        };
        key(shortcut.keys, 'doc', function(event, handler){ return shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
        key(shortcut.keys, 'input', function(event, handler){ return shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
    },
    "catchEvent": function(window_name, shortcut_key, scope){
        var target = aside_iframe.is_open ? aside_iframe : content_iframe;
        var target_window = target.instance.contentWindow;
        console.log(window_name, shortcut_key, scope);

        switch (shortcut_key) {
            case 'ctrl+p': target_window.print(); break;
            case 'f5':
            case 'ctrl+r':
            case 'ctrl+f5': target.reload(); break;
            case 'ctrl+shift+s': target_window.save_and_exit(); break;
            case 'ctrl+s': target_window.save_form(); break;
            case 'alt+1': case 'alt+2': case 'alt+3': case 'alt+4': case 'alt+5': case 'alt+6': case 'alt+7': case 'alt+8':case 'alt+9':
                target_window.change_lang(parseInt(shortcut_key.replace('alt+', ''))-1);
                break;
        }
        if (scope != "input"){
            var s = [];
            var n = 1;
            $(".op-mode a").each(function(){
                if (shortcut_key == $(this).data("view-key") || shortcut_key == n.toString()){
                    view.change($(this).data("view"));
                }
                n++;
            });
            switch (shortcut_key) {
                case '/':
                    ui.showSearchBox();
                    return false;
                case 'shift+/':
                    console.log("help");
                    break;
                case 'alt+s':
                    $("body").toggleClass("sortTag");
                    break;
                case '`':
                    if (aside_iframe.is_open)
                        aside_iframe.closeUi();
                    else
                        aside_iframe.showUi();
                    break;
                case 'esc':
                    if (shortcut.lock == true){
                        shortcut.lock = false;
                        aside_iframe.closeUi();
                        return false;
                    }
                    shortcut.lock = true;
                    clearTimeout(shortcut.timer);
                    shortcut.timer = setTimeout(function(){
                        shortcut.lock = false;
                    }, 400);
                    break;
            }
        }
        if (scope == "input"){
            switch (shortcut_key) {
                case 'esc':
                    ui.closeSearchBox();
                    return false;
            }
        }
        if (jQuery.inArray(shortcut_key, ['ctrl+shift+s', 'ctrl+s', 'ctrl+r', 'ctrl+f5', 'f5', 'ctrl+p']) >-1){
            return false;
        }
    }
};
var view = {
    "current": "edit",
    "last": "edit",
    "change": function(view_name){
        if (window.name == ""){
            this.last = this.current;
            this.current = view_name;
            $("body").removeClass("in-"+this.last+"-mode").addClass("in-"+view_name+"-mode");
            content_iframe.instance.contentWindow.changeView();
            aside_iframe.instance.contentWindow.changeView();
            if (aside_iframe.is_open){
                aside_iframe.instance.contentWindow.changeViewAndReload();
            }
        }
    }
};
var ui = {
    "closeMessageBox": function(){ $("header").click(); },
    "showSearchBox": function(){ $("#keyword").click().focus();},
    "closeSearchBox": function(){ $(".page-overlay a").focus(); $(".page-overlay").click(); },
    "setUserInformation": function(name, blob_url){
        var href = content_iframe.last_url;
        var p = $(".user-name a").attr("href");
        var pe = p.replace("profile", "%3A");
        if (href.indexOf(pe) >= 0) {
            if (href.indexOf($("body").data("user")) > 0) {
                $(".user-box .avatar").css({"background-image": 'url(' + blob_url + ')'});
                $(".user-name a").text(name);
            }
        }
        if (href.indexOf(p) >= 0){
            $(".user-box .avatar").css({"background-image": 'url(' + blob_url + ')'});
            $(".user-name a").text(name);
        }
    }
};

$(function(){
    uploader.init();
    shortcut.init();
    //$(document).bind("keydown", function(e) {
    //    short_key(window.name, e);
    //});

    // scrollDiv 是一個 iframe 的遮罩，用來解決 iframe 抓不到滑鼠移動事件的問題
    $(".scrollDiv").hover(function(){
        $(this).addClass("on");
        content_iframe.need_focus = false;
    }, function(){
        $(this).removeClass("on");
    }).mouseover(function(){
        $(this).addClass("on");
    }).mouseover(function(){
        $(this).addClass("on");
    }).mouseleave(function() {
        $(this).removeClass("on");
    });

    $(".enter-sorting-mode").click(function(){ view.change("sort")});
    $(".enter-view-mode").click(function(){ view.change("view")});
    $(".enter-edit-mode").click(function(){ view.change("edit")});
    $(".enter-delete-mode").click(function(){ view.change("delete")});
    $(".page-overlay").click(function(){$("div.search-bar, .page-overlay").removeClass("on");$("body").removeClass("on-search");});
    $("#keyword").focus(function(){
        ui.closeMessageBox();
        $("div.search-bar, .page-overlay").addClass("on");
        $("body").addClass("on-search");
    }).keyup(function(event){
        if (event.which == 13) {
            event.preventDefault();
            content_iframe.search($(this).val());
        }
    });
    $(".menu-link").click(function(event){
        var target_id = $(this).attr("href");
        if ($(target_id).hasClass("in")){
            // 顯示主選單、隱藏子選單
            event.stopPropagation();
            event.preventDefault();
            $(target_id).removeClass("in").animate({"left": -300});
            $("#main-nav").show().animate({"left": 0});
        }else{
            // 顯示子選單、隱藏主選單
            event.stopPropagation();
            event.preventDefault();
            $("#main-nav").animate({"left": -300}, function(){ $(this).hide(); });
            $(target_id).animate({"left": 0}, function(){ $(target_id).addClass("in"); });
        }
    });
});
