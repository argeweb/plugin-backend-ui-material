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
}
var consoleDOD = function(evt){
    evt.preventDefault();
    evt.stopPropagation();
    iframe.focus();
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
    "quick_info": function(msg, sec){
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
        if ($target.hasClass("image")){
            $("#image-file-picker").attr("accept", "image/*");
        }else{
            $("#image-file-picker").attr("accept", "*");
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
        json_async("/admin/user_file/get.json", null, function(data){
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
                message.quick_info("上傳完成");
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
            fd.append('file', this.reader_info.file);
            xhr.send(fd);//開始上傳
        };
        if(/image\/\w+/.test(upload_target.file.type)){
        }
    }
};
var iframe = {
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
        this.history = JSON.parse(localStorage.getItem('iframe.history'));
        if (this.history == null || this.history == "null") this.history = [];
        //  常用項目
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
            if ($(this).hasClass("main-link")){ aside.closeUi(); }
            iframe.load($(this).attr("href"), t);
            event.preventDefault();
        });
        var b = $("body").data("dashboard-name");
        if(window.location.hash) {
            var find_page =false;
            var hash = window.location.hash.replace("#", "");
            $linkList.each(function(){
                if ($(this).attr("href") == hash){
                    find_page = true;
                    $(this).click();
                }
            });
            if (find_page==false){
                var last_page = this.getState(hash);
                if (last_page != null){
                    iframe.load(hash, last_page.text, last_page.referer_page);
                }else{
                    var h = hash.split("/").slice(0, 3).join("/");
                    $linkList.each(function(){
                        if ($(this).attr("href") == h){
                            find_page = true;
                            $(this).click();
                        }
                    });
                }
            }
            if (find_page==false){
                iframe.load("/"+b+"/welcome", "Welcome");
            }
        }else{
            iframe.load("/"+b+"/welcome", "Welcome");
        }
        $(".content").hover(function(){ }, function(){
            setTimeout(function(){
                if (iframe.need_focus == false){
                    $(".iframe_mask").show();
                }
            }, 800);
        });
        $(".iframe_mask").hover(iframe.focus, function(){ iframe.need_focus = false; }).mouseover(iframe.focus).mouseenter(iframe.focus).click(iframe.focus)
    },
    "focus": function(){
        $(".iframe_mask").hide();
        iframe.need_focus = true;
        iframe.instance.contentWindow.focus();
        var contents = null;
        try{
            contents = $(this.instance).contents();
        }catch(e){
            contents = this.instance.contents();
        }
        contents.find('body').click();
    },
    "removeMask": function(){
        iframe.need_focus = true;
        $(".iframe_mask").hide();
    },
    "reload": function(keep_aside){
        if (!(keep_aside && keep_aside == true)) aside.closeUi();
        var last_page = this.getState();
        if (last_page != null) {
            iframe.load(last_page.href, last_page.text, last_page.referer_page);
        }
        //this.instance.contentWindow.location.reload();
    },
    "getUrl": function(){
        //return this.instance.contentWindow.location.pathname;
        return this.last_url;
    },
    "load": function(url, text, referer_page){
        affix(0);
        if (this.loading_lock == true) return false;
        this.loading_lock = true;
        clearTimeout(this.loading_timer);
        this.loading_timer = setTimeout(function(){
            iframe.instance.contentWindow.showTimeout();
        }, 25000);
        this.last_url = url;
        this.pushState(url , text, referer_page);
        iframe.instance.contentWindow.showLoading(function(){
            ajax(url, null, function(page){
                var data = iframe.getState();
                if (data) history.pushState(data, data.text, "#" + data.href);
                clearTimeout(iframe.loading_timer);
                iframe.loading_lock = false;
                iframe.instance.contentWindow.pageInit(page);
            }, function(page){
                clearTimeout(iframe.loading_timer);
                iframe.loading_lock = false;
                iframe.instance.contentWindow.pageInit(page);
                return false;
            }, {
                "is_ajax": "true"
            });
        });
    },
    "addClass": function(class_name){
        var contents = null;
        try{
            contents = $(this.instance).contents();
        }catch(e){
            contents = this.instance.contents();
        }
        contents.find("body").addClass(class_name);
    },
    "removeClass": function(class_name){
        var contents = null;
        try{
            contents = $(this.instance).contents();
        }catch(e){
            contents = this.instance.contents();
        }
        contents.find("body").removeClass(class_name);
    },
    "getState": function(url) {
        if (typeof url === "undefined") url = iframe.getUrl();
        if (url in this.history){
            return iframe.history[url];
        }
        return null;
    },
    "pushState": function(url, text, referer_page){
        var referer_page_data = this.getState(referer_page);
        if (referer_page_data && referer_page_data.referer_page){
            referer_page = referer_page_data.referer_page;
        }
        var history_item = null;
        if (url in this.history){
            history_item = iframe.history[url];
            history_item.last_date = Date.now();
            if (history_item.visit){
                history_item.visit++;
            }else{
                history_item.visit = 1
            }
            localStorage.setItem('iframe.history', JSON.stringify(this.history));
            return false;
        }
        this.history[url] ={
            "href": url,
            "text": text,
            "visit": 1,
            "last_date": Date.now(),
            "referer_page": referer_page
        };
        localStorage.setItem('iframe.history', JSON.stringify(this.history));
    },
    "popState": function(event){
        var s = event.state;
        if (s){
            iframe.load(s.href, s.text, s.is_list);
            window.history.replaceState( s , s.text, "#" + s.href);
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
var aside = {
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
            aside.loading_lock = false;
            aside.instance.contentWindow.showTimeout();
        }, 250000);

        this.last_url = url;
        if (this.is_open) {
            aside.instance.contentWindow.showLoading(function(){
                aside.runAjax(url);
            });
        }else{
            aside.showUi();
            aside.instance.contentWindow.showLoading(function(){
                aside.runAjax(url);
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
            "aside": "aside"
        };
        ajax(url, null, function(page){
            clearTimeout(aside.loading_timer);
            aside.loading_lock = false;
            aside.instance.contentWindow.pageInit(page);
        }, function(page){
            clearTimeout(aside.loading_timer);
            aside.loading_lock = false;
            aside.instance.contentWindow.pageInit(page);
        }, headers);
    },
    "showUi": function(callback){
        $("#aside_iframe").stop().animate({"width": ($(window).width() < 992) ? "100%" : "72%"}, 500, function(){
            aside.is_open = true;
            if (typeof callback === "function") callback();
            $(this).addClass("open");
        });
    },
    "closeUi": function(callback){
        $("#aside_iframe").stop().animate({"width": "0"}, 500, function(){
            aside.is_open = false;
            if (typeof callback === "function") callback();
            $(this).removeClass("open");
        });
    },
    "addClass": function(class_name){
        var contents = null;
        try{
            contents = $(this.instance).contents();
        }catch(e){
            contents = this.instance.contents();
        }
        contents.find("body").addClass(class_name);
    },
    "removeClass": function(class_name){
        var contents = null;
        try{
            contents = $(this.instance).contents();
        }catch(e){
            contents = this.instance.contents();
        }
        contents.find("body").removeClass(class_name);
    }
};
function print(){
    var target = aside.is_open ? aside : iframe;
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
        var target = aside.is_open ? aside : iframe;
        var target_window = target.instance.contentWindow;
        console.log(window_name, shortcut_key, scope);

        switch (shortcut_key) {
            case 'ctrl+p': target_window.print(); break;
            case 'f5':
            case 'ctrl+r':
            case 'ctrl+f5': target.reload(); break;
        }
        if (aside.is_open){
            switch (shortcut_key) {
                case 'ctrl+shift+s': target_window.save_and_exit(); break;
                case 'ctrl+s': target_window.save_form(); break;
                case 'alt+1': case 'alt+2': case 'alt+3': case 'alt+4': case 'alt+5': case 'alt+6': case 'alt+7': case 'alt+8':case 'alt+9':
                    target_window.change_lang(parseInt(shortcut_key.replace('alt+', ''))-1);
                    break;
            }
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
                    if (aside.is_open)
                        aside.closeUi();
                    else
                        aside.showUi();
                    break;
                case 'esc':
                    if (shortcut.lock == true){
                        shortcut.lock = false;
                        aside.closeUi();
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
    "change": function(view_name){
        if (window.name == ""){
            this.current = view_name;
            $("body").removeClass("in-view-mode").removeClass("in-edit-mode").removeClass("in-delete-mode").removeClass("in-sort-mode").addClass("in-"+view_name+"-mode");
            aside.removeClass("in-edit-mode");
            aside.removeClass("in-view-mode");
            aside.removeClass("in-sort-mode");
            aside.removeClass("in-delete-mode");
            aside.addClass("in-"+view_name+"-mode");
            if (view_name == "sort"){
                iframe.addClass("in-sort-mode");
            }else{
                iframe.removeClass("in-sort-mode");
            }
            iframe.instance.contentWindow.changeView();
            if (aside.is_open){
                aside.instance.contentWindow.changeViewAndReload();
            }
        }
    }
};
var ui = {
    "closeMessageBox": function(){ $("header").click(); },
    "showSearchBox": function(){ $("#keyword").click().focus();},
    "closeSearchBox": function(){ $(".page-overlay a").focus(); $(".page-overlay").click(); },
    "setUserInformation": function(name, blob_url){
        var href = iframe.last_url;
        if (href.indexOf('/admin/application_user/%3A') >= 0) {
            if (href.indexOf($("body").data("user")) > 0) {
                $(".user-box .avatar").css({"background-image": 'url(' + blob_url + ')'});
                $(".user-name a").text(name);
            }
        }
        if (href.indexOf('/admin/application_user/profile') >= 0){
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

    $(".scrollDiv").hover(function(){
        $(this).addClass("on");
        iframe.need_focus = false;
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
            iframe.search($(this).val());
        }
    });
    $(".menu-link").click(function(event){
        var target_id = $(this).attr("href");
        if ($(target_id).hasClass("in")){
            event.stopPropagation();
            event.preventDefault();
            $(target_id).removeClass("in").animate({"left": -300}, function(){
                //$(this).css({"position": "relative", "top": "0"});
                //$(target_id);
            });
            $("#main-nav").show().animate({"left": 0});
        }else{
            event.stopPropagation();
            event.preventDefault();
            $("#main-nav").animate({"left": -300}, function(){
                $(this).hide();
            });
            $(target_id).animate({"left": 0}, function(){
                $(target_id).addClass("in");
            });
        }
    });
});
