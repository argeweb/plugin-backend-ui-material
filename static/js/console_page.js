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

var page = {};
var view = {
    "current": "edit",
    "last": "edit",
    "viewFunction": {
        "edit": null,
        "view": null,
        "sort": null,
        "delete": null
    },
    "change": function(view_name){
        this.last = this.current;
        this.current = view_name;
        $("body").removeClass("in-"+this.last+"-mode").addClass("in-"+view_name+"-mode");
        //if (aside_iframe.is_open){
        //    aside_iframe.instance.contentWindow.methods.changeViewAndReload();
        //}            //if (aside_iframe.is_open){
        //    aside_iframe.instance.contentWindow.methods.changeViewAndReload();
        //}
        try{
            if (this.viewFunction[view_name])
                this.runFunction(this.viewFunction[view_name]());
        }catch(e){
        }
    },
    "resetFunction": function(dom){
        var $page_data = $(dom).find(".page_data");
        this.viewFunction["edit"] = $page_data.data("view-function-edit");
        this.viewFunction["view"] = $page_data.data("view-function-view");
        this.viewFunction["sort"] = $page_data.data("view-function-sort");
        this.viewFunction["delete"] = $page_data.data("view-function-delete");
    },
    "runFunction": function(function_name){
        if (page && typeof page[function_name] == "function"){
            page[function_name]();
        }else{
            if (typeof methods[function_name] == "function"){
                methods[function_name]();
            }
        }
    }
};
var form = {
    "last_target": null,
    "validate": function(j){
        var err = j["errors"];
        if (err){
            for (var key in err) {
                $("form #" + key).parents(".form-group").addClass("has-error has-danger").find(".help-block").text(err[key]);
            }
            if (form.last_target.attr("action").indexOf("/_ah/upload/") >= 0) {
                form.last_target.attr("action", j["new_form_action"]);
            }
            message.snackbar("表單欄位有誤");
            return false;
        }
        return true;
    },
    "beforeSubmit": function(){
        show_message("請稍候...", 30000, false);
        form.lock();
        form.last_target.find(".field-type-rich-text-field").each(function(){
            var id = $(this).attr("id");
            if (tinyMCE.get(id)){
                $(this).val(tinyMCE.get(id).getContent());
            }
            $(this).change();
        });
        if ($("input[name$='response_return_encode']").length == 0){
            var r = form.last_target.data("return-encoding");
            if (typeof r === "undefined") r = "application/json";
            $('<input type="hidden" name="response_return_encode" value="' + r + '" />').appendTo(form.last_target);
        }
    },
    "submit": function(form_id, callback){
        if (typeof form_id === "undefined") form_id = "form";
        if (typeof callback === "function") form.afterSubmitCallback = callback;
        var $form = $(form_id);
        if ($form.length <=0){ return false;}
        if (page_data.is_saving == true){ return false;}
        form.last_target = $form;
        form.beforeSubmit();
        $form.submit();
    },
    "afterSubmit": function(){
        // 表單資料儲存完成之後
        $(".form-group").removeClass("has-error has-danger").find(".help-block").text("");
        var j = JSON.parse($(this).contents().find("body").text());
        form.unlock();
        if (form.validate(j)) {
            var message = methods.parseScaffoldMessage(j);
            methods.setUserInformation($("#name").val(), $("#avatar").val());
            // 停用 2017/2/2 側邊欄應由主編輯區開啟，不該有此行為
            //if (j["scaffold"]["response_method"] == "add" || j["scaffold"]["response_method"] == "edit") {
            //    if (is_aside()) content_area.reload(true);
            //}
            message.notice.hide();
            if (typeof form.afterSubmitCallback === "function"){
                // 儲存並離開、建立並繼續編輯 會有 callback
                form.afterSubmitCallback(j, message);
                form.afterSubmitCallback = null;
            }else{
                // 儲存
                message.snackbar(message);
                methods.reloadSidePanel();
            }
        }
        form.last_target = undefined;
    },
    "afterSubmitCallback": undefined,
    "lock": function(s){
        s = s || 5000;
        page_data.is_saving = true;
        clearTimeout(page_data.timeout_lock_saving);
        page_data.timeout_lock_saving = setTimeout(function(){ page_data.is_saving = false; }, s);

    },
    "unlock": function(s){
        s = s || 3000;
        clearTimeout(page_data.timeout_lock_saving);
        page_data.timeout_lock_saving = setTimeout(function () { page_data.is_saving = false; }, s);
    }
};
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
        key.filter = function(event){
            var tagName = (event.target || event.srcElement).tagName;
            key.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'doc');
            return true;
        };
        key(shortcut.keys, 'doc', function(event, handler){ return shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
        key(shortcut.keys, 'input', function(event, handler){ return shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
    },
    "catchEvent": function(window_name, shortcut_key, scope){
        console.log(window_name, shortcut_key, scope);
        switch (shortcut_key) {
            case 'ctrl+p': print(); break;
            case 'f5':
            case 'ctrl+r':
            case 'ctrl+f5': content_area.reload(true); break;
            case 'ctrl+shift+s': saveFormAndGoBack(); break;
            case 'ctrl+s': saveForm(); break;
            case 'alt+1': case 'alt+2': case 'alt+3': case 'alt+4': case 'alt+5': case 'alt+6': case 'alt+7': case 'alt+8':case 'alt+9':
                changeLangField(parseInt(shortcut_key.replace('alt+', ''))-1);
                break;
        }
        if (scope != "input"){
            var s = [];
            var n = 1;
            $(".op-mode a").each(function(){
                if (shortcut_key == $(this).data("view-key") || shortcut_key == n.toString()){
                    $(this).click();
                }
                n++;
            });
            switch (shortcut_key) {
                case '/':
                    methods.showSearchBox();
                    return false;
                case 'shift+/':
                    console.log("help");
                    break;
                case 'alt+s':
                    $("body").toggleClass("show-sort-tag");
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
                    methods.closeSearchBox();
                    return false;
            }
        }
        if (jQuery.inArray(shortcut_key, ['ctrl+shift+s', 'ctrl+s', 'ctrl+r', 'ctrl+f5', 'f5', 'ctrl+p']) >-1){
            return false;
        }
    }
};
var progress_bar = {
    "dom": $(".progress-bar"),
    "set": function(n){
        setTimeout(function(){ progress_bar.dom.width(n + "%"); }, 0);
        if (n==100){
            setTimeout(function(){ progress_bar.dom.width(0); }, 2500);
        }
    }
};
var message = {
    "list": [],
    "snackbarText": 1,
    "notice":{
        "show": function(autoHide){
            $(".alert-moment").each(function(){
                var d = $(this).data("create");
                $(this).text(moment(d).fromNow());
            });
            if ($(".msg").length > 25){
                $(".msg").last().remove();
            }
            if (autoHide != undefined && autoHide == true){
                clearTimeout(message.notice.hideTimer);
                message.notice.hideTimerCount = 5;
                message.notice.hideAuto();
            }
        },
        "hideAuto": function(){
            message.notice.hideTimerCount = parseInt(message.notice.hideTimerCount) - 1;
            if (message.notice.hideTimerCount <= 0){
                message.notice.hide();
            }else{
                message.notice.hideTimer = setTimeout(message.notice.hideAuto, 1000);
            }
        },
        "hide": function(sec){
            sec = sec || 1;
            setTimeout(function(){
                $("#message-box").parent("li").removeClass("open");
                message.notice.hideTimerCount = 0;
                swal.closeModal();
            }, sec);
        }
    },
    "init": function(){
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
    },
    "quick_show": function(msg, timeout, allowOutsideClick){
        if (typeof allowOutsideClick === "undefined") allowOutsideClick = true;
        if (timeout !== undefined){
            swal({
                title: "",
                html: msg,
                timer: timeout,
                showConfirmButton: false,
                allowOutsideClick: allowOutsideClick
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
                if (mini == false){ message.notice.show(true); }
            }
        }
    }
};
var uploader = {
    "pickup_target": null,
    "pickup_target_is_editor": false,
    "visual_timer": 3,
    "init": function(){
        $(document).on('change','#image-file-picker' , function(){
            uploader.startUpload();
        });
    },
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
            if (typeof data.response.data !== "undefined") data = data.response.data;
            var url = data.url;
            var item_key = data.item.__key__;
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
    },
    "onDragStart": function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        var dt = evt.dataTransfer;
        if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
            $("html").addClass("dropping");
            if ($(".file_picker_div, .imgs_selector_div, .field-type-rich-text-field").length == 0){
                $("#dropping").addClass("no_target");
            }else{
                $("#dropping").removeClass("no_target");
                $(".file_picker_div, .imgs_selector_div").parent().parent().addClass("dropping-box");
            }
        }
    },
    "onDragEnd": function (evt){
        evt.preventDefault();
        evt.stopPropagation();
        uploader.visual_timer=0;
        setTimeout(uploader.removeVisualClass, 1000);
    },
    "onDragOver": function (evt){
        evt.preventDefault();
        evt.stopPropagation();
        uploader.visual_timer=3;
        $("html").addClass("dropping");
        $(".file_picker_div, .imgs_selector_div").parent().parent().addClass("dropping-box");
    },
    "removeVisualClass": function (){
        if (uploader.visual_timer==0){
            $("html").removeClass("dropping");
            $(".file_picker_div, .imgs_selector_div").parent().parent().removeClass("dropping-box");
            uploader.visual_timer = 0;
        }else{
            uploader.visual_timer--;
            setTimeout(uploader.removeVisualClass, 1000);
        }
    },
    "onDrop": function (evt){
        var files = evt.dataTransfer.files;
        evt.preventDefault();
        uploader.visual_timer=0;
        $("html").removeClass("dropping");
        $(".file_picker_div, .imgs_selector_div").parent().parent().removeClass("dropping-box");
        if (files.length > 10){
            message.insert("danger", "錯誤", "一次可上傳 10個文件", undefined);
            return;
        }
        for (var i=0; i<files.length; i++) {
            var t = evt.target;
            console.log(t);
            var randId = getRandID("upload-");
            if ($(t).hasClass("form-group")){
                $(t).attr("data-uploadId", randId);
            }else{
                $(t).parents(".form-group").attr("data-uploadId", randId);
            }
            if ($(t).hasClass("mce-content-body") || $(t).parents("body").hasClass('mce-content-body ')){
                randId = $(t).parents("body").data("id") || $(t).data("id");
                uploader.addFile(files[i], randId, uploader.setEditorValue);
            }else{
                uploader.addFile(files[i], randId, uploader.setTargetValue);
            }
        }
    },
    "setTargetValue": function (data){
        if (typeof data.response.data !== "undefined") data = data.response.data;
        var url = data.url;
        var item_key = data.item.__key__;
        var target_id = data.target_id;
        var t = $("*[data-uploadId='" + data.target_id + "']");
        t.find("input").first().val(data.url).data("key", item_key).show();
        if (url == ""){
            t.find(".file_picker_item").css("background-image", "none").addClass("file_picker_item_none");
        }else{
            t.find(".file_picker_item").css("background-image", "url(" + url + ")").removeClass("file_picker_item_none");
            t.find("input").first().change();
        }
    },
    "setEditorValue": function (data){
        if (typeof data.response.data !== "undefined") data = data.response.data;
        var url = data.url;
        var target_id = data.target_id;
        if (tinyMCE.get(target_id)){
            tinyMCE.get(target_id).selection.setContent('<img src="' + url + '" />');
        }
    }
};
var content_area = {
    "dom": "#content_area",
    "data": {
        "is_init": false,
        "last_url": null,
        "loading_timer": null,
        "loading_lock": false,
        "search_url": "",
    },
    "history": {},
    "init": function(selector){
        if (this.data.is_init) return;
        this.data.is_init = true;
        window.onpopstate = this.popState;
        var h = JSON.parse(localStorage.getItem('content_area.history'));
        if (h != null && h != [] && h != "null") content_area.history = h;
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
        if(window.location.hash) {
            var hash = window.location.hash.replace("#", "");
            var last_page = this.getState(hash);
            if (last_page != null){
                content_area.load(hash, last_page.text, last_page.referer_page, false);
            }else{
                content_area.load(hash, "最後檢視", {}, false);
            }
        }else{
            content_area.load("/" + $("body").data("dashboard-name") + "/welcome", "Welcome");
        }
    },
    "reload": function(keep_aside){
        if (!(keep_aside && keep_aside == true)) aside_iframe.closeUi();
        var last_page = this.getState();
        if (last_page != null) {
            content_area.load(last_page.href, last_page.text, last_page.referer_page, false);
        }
    },
    "getUrl": function(){
        return content_area.data.last_url;
    },
    "lock": function(){
        clearTimeout(this.data.loading_timer);
        this.data.loading_lock = true;
        this.data.loading_timer = setTimeout(function(){
            methods.showTimeout(content_area.dom);
        }, 25000);
    },
    "unlock": function(){
        clearTimeout(content_area.data.loading_timer);
        content_area.data.loading_lock = false;
    },
    "load": function(url, text, referer_page, need_push, need_replace){
        methods.affix(0);
        if (this.loading_lock == true) return false;
        content_area.lock();
        content_area.data.last_url = url;
        if (typeof need_push === "undefined"){ need_push = true }
        if (typeof need_replace === "undefined"){ need_replace = false }
        if (need_push === true) page_data.last_side_panel_target_id = "";
        if (need_push){
            aside_iframe.closeUi();
            this.pushState(url , text, referer_page);
        }
        showLoading(content_area.dom, function(){
            ajax(url, null, function(page) {
                var data = content_area.getState();
                if (need_push) {
                    history.pushState(data, text, "#" + url);
                } else {
                    if (need_replace) history.replaceState(data, text, "#" + url);
                }
                content_area.unlock();
                content_area.resetPage(page, need_push);
            }, function(page){
                content_area.unlock();
                content_area.resetPage(page);
                return false;
            }, {
                "is_ajax": "true",
                "page_view": view.current
            });
        });
    },
    "getState": function(url) {
        if (typeof url === "undefined") url = content_area.getUrl();
        if (url in content_area.history){
            return content_area.history[url];
        }
        return null;
    },
    "pushState": function(url, text, referer_page){
        var referer_page_data = this.getState(referer_page);
        if (referer_page_data && referer_page_data.referer_page){
            referer_page = referer_page_data.referer_page;
        }
        var history_item = null;
        if (url in content_area.history){
            history_item = content_area.history[url];
            history_item.last_date = Date.now();
            if (history_item.visit){
                history_item.visit++;
            }else{
                history_item.visit = 1
            }
            localStorage.setItem('content_area.history', JSON.stringify(content_area.history));
            return false;
        }
        content_area.history[url] ={
            "href": url,
            "text": text,
            "visit": 1,
            "last_date": Date.now(),
            "referer_page": referer_page
        };
        localStorage.setItem('content_area.history', JSON.stringify(content_area.history));
    },
    "popState": function(event){
        var s = event.state;
        console.log(s);
        if (s){
            aside_iframe.closeUi();
            content_area.load(s.href, s.text, s.referer_page, false);
        }
    },
    "search": function(keyword){
        var url = "";
        var current = methods.getSearchingUrl() || content_area.getUrl();
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
    },
    "resetPage": function(new_html){
        page = {};
        if (new_html){
            try{
                $(content_area.dom).html(new_html);
            }catch(e){
                message.quick_show("發生問題了 " + e.toString());
            }
        }
        if (aside_iframe.is_open) {
            methods.reloadSidePanel();
        }
        $(".page_header").each(function(){ if ($(this).text().trim() == "") $(this).hide() });

        //TODO if input has val addClass control-highlight
        checkNavItemAndShow();
        $("iframe[name='iframeForm']").load(form.afterSubmit);

        tinyMCE.editors=[];
        $(".field-type-rich-text-field").each(function() {
            var label_name = $(this).prev().text();
            $(this).prev().remove();
            var id = $(this).attr("id");
            if (id == undefined){ id = $(this).attr("name"); $(this).attr("id", id); }
            if (id) {
                createEditorField(id);
            }
        });

        $('#list-table').on('post-body.bs.table', function () {
            makeSortTable();
            makeListOp();
            checkNavItemAndShow();
            $(".sortable-list").removeClass("hidden");
            $(".fixed-table-loading").hide();
        }).bootstrapTable();
        $(".moment-from-now").each(function(){
            $(this).text(moment($(this).data("from-now")).fromNow());
        });
        $("select[readonly] :selected").each(function(){ $(this).parent().data("default", this); });
        $("select[readonly]").change(function() { $($(this).data("default")).prop("selected", true); });
        view.resetFunction(content_area.dom);
        setTimeout(function(){
            $(".fbtn-container").fadeIn();
        }, 800);
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
        this.instance.contentWindow.methods.setBackendMethods();
        $(window).resize(function(){
            if (aside_iframe.is_open){
                aside_iframe.showUi();
            }
            //$("#aside_iframe.open").stop().animate({"width": ($(window).width() < 992) ? "100%" : "72%"}, 200);
        });
    },
    "load": function(url){
        if (this.loading_lock == true) return false;
        this.loading_lock = true;
        clearTimeout(this.loading_timer);
        this.loading_timer = setTimeout(function(){
            aside_iframe.loading_lock = false;
            // TODO methods.showTimeout(aside_iframe.dom);
            aside_iframe.instance.contentWindow.showTimeout();
        }, 250000);

        aside_iframe.last_url = url;
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
        aside_iframe.load(aside_iframe.last_url);
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
        //content_area.instance.contentWindow.addClass("aside_is_open");
        $("#aside_iframe").stop().animate({
            "width": ($(window).width() < 768) ? $(window).width() + 3 : "400"}, 500, function(){
            aside_iframe.is_open = true;
            aside_iframe.instance.contentWindow.addClass("open");
            if (typeof callback === "function") callback();
        });
    },
    "closeUi": function(callback){
        //content_area.instance.contentWindow.removeClass("aside_is_open");
        $("#aside_iframe").stop().animate({"width": "0"}, 500, function(){
            aside_iframe.is_open = false;
            try{ aside_iframe.instance.contentWindow.removeClass("open"); }catch(e){}
            if (typeof callback === "function") callback();
        });
    }
};
var page_data = {
    "last_side_panel_target_id": "",
    "is_saving": false,
    "timeout_lock_saving": null
};
var methods = {
    "getSearchingUrl": function(){ return $(content_area.dom).find(".page_url").data("search-url")},
    "changeViewAndReload": function(){
        if (view.last != view.current) {
            if (view.current == "edit" || view.current == "view") {
                $("a." + view.current + "-url").first().click();
            }
        }
    },
    "goEditPage": function(){
        var $target = $(".edit-url").first();
        if ($target.length)
            content_area.load($target.attr("href"), $target.text(), {}, false, true);
    },
    "goViewPage": function(){
        var $target = $(".view-url").first();
        if ($target.length)
            content_area.load($target.attr("href"), $target.text(), {}, false, true);
    },
    "parseScaffoldMessage": function(j){
        var status = (j["scaffold"] && j["scaffold"]["response_info"]) && j["scaffold"]["response_info"] || null;
        var message = j['message'];
        var scaffold = j["scaffold"];
        var request_method = "undefined";
        var method_default_message = null;
        if (typeof scaffold !== "undefined"){
            method_default_message = scaffold["method_default_message"];
            request_method = scaffold["request_method"];
        }
        var msg = (method_default_message !== null && typeof method_default_message !== "undefined") &&
            method_default_message || {
                "add.success": "記錄已新增",
                "edit.success": "記錄已儲存",
                "profile.success": "資料已更新",
                "data.success": "資料已更新",
                "config.success": "設定已變更",
                "undefined.success": "已成功",
                "undefined": "未定義的訊息"
            };
        request_method = request_methods.replace("admin_", "") + "." + status;
        if (typeof message === "undefined" || message == "undefined")
            return (typeof msg[request_method] === "undefined") && msg["undefined"] || msg[request_method];
        else
            return message;

    },
    "goBack": function(n){
        n = n || 1;
        if (is_aside()) setTimeout(aside_iframe.closeUi(), 10);
        if (is_content()) setTimeout(history.go(-Math.abs(n)), 10);
    },
    "setBackendMethods": function(){
        //  此文件在 parent 準備好之前就載入完畢
        show_message = message.quick_show;
    },
    "reloadSidePanel": function(){
        var n = page_data.last_side_panel_target_id;
        page_data.last_side_panel_target_id = "";
        if (n !== ""){ $("#" + n).click(); }
    },
    "convertUITimeTOLocalTime": function(uitime, hours){
        hours = hours || 0;
        var d1 = new Date(uitime), d2 = new Date(d1);
        d2.setHours(d1.getHours() + hours);
        return d2.getFullYear()  + "-" + (d2.getMonth()+1) + "-" + d2.getDate() + " " +
                d2.getHours() + ":" + d2.getMinutes() + ":" + d2.getSeconds();
    },
    "sortByKey": function(array, key){
        return array.sort(function (a, b) {
            var x = a[key];
            var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        })
    },
    "reload": function(){
        if (is_aside()) {
            aside_iframe.reload();
        } else {
            content_area.reload();
        }
    },
    "closeMessageBox": function(){ return; },
    "showSearchBox": function(){
        $("div.search-bar, .page-overlay").addClass("on");
        $("body").addClass("on-search");
    },
    "closeSearchBox": function(){
        $("div.search-bar, .page-overlay").removeClass("on");
        $("body").removeClass("on-search");
    },
    "setUserInformation": function(name, blob_url){
        var href = content_area.getUrl();
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
    },
    "affix": function(top) {
        if (top >= 25) {
            $("header").addClass("affix");
        } else {
            $("header").removeClass("affix");
        }
    },
    "showTimeout": function (target, callback){
        $(target).html('<div style="margin: 100px auto; width: 40%; font-size: 18px;">連線逾時</div>');
        if (typeof callback === "function") callback(target);
    }
};
var saveForm = form.submit;


function saveFormAndGoBack(form_id){
    saveForm(form_id, function(j, message){
        methods.goBack();
        message.snackbar(message);
    });
}
function saveFormAndReloadRecord(form_id){
    saveForm(form_id, function(j, message){
        if (is_content()) {
            content_area.load(j["scaffold"]["method_record_edit_url"], "", {}, false, true);
            message.snackbar(message);
        }
    });
}
// 訊息 (簡單的方式)
function show_message(msg, timeout, allowOutsideClick){
    message.quick_show(msg, timeout, allowOutsideClick);
}
function refreshMoment(){
    $(".moment-from-now").each(function(){
        $(this).text(moment($(this).data("from-now")).fromNow());
    });
    $(".moment-vue-from-now").each(function(){
        var d = $($(this).context.outerHTML).data("vue-from-now");
        $(this).text(moment(d).fromNow());
    });
}
// 處理頁面上的選單區塊
function checkNavItemAndShow(){
    // 預設為第一種語系欄位
    $("a.btn-lang").first().click();
    // 沒有 相關操作 項目的話，隱藏
    $(".list-operations").each(function(){
        if ($(this).find("li").length > 0){
            $(this).removeClass("hide");
        }else{
            $(this).addClass("hide");
        }
    });
    // 沒有項目的話，整個隱藏
    if ($(".nav-box li").length > 0){
        $(".nav-box").removeClass("hide").addClass("animated").addClass("fadeInUp");
    }
}
function deleteRecord(url){
    swal({
        title: "您確定要刪除此記錄嗎",
        text: "删除後后将無法恢複，請謹慎操作！",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        showLoaderOnConfirm: true
    }).then(function () {
        show_message("請稍候...", 30000, false);
        setTimeout(function(){
            json(url, null, function (data) {
                swal("删除成功！", "您已经永久删除了此記錄。", "success");
                content_area.reload();
            }, function (data) {
                swal("删除失敗！", "刪除記錄時發生問題。", "error");
            })
        }, 50);
    });
}
// 可以排序的表格
function makeSortTable(){
    //try{
        $(".sortable-list tbody").sortable({
            placeholder: "ui-state-highlight",
            handle: 'td.move-headline',
            opacity: 0.8,
            //拖曳時透明
            cursor: 'move',
            //游標設定
            axis:'y',
            //只能垂直拖曳
            update : function () {
                var last_page_record = "";
                var $sort = $('.sortable-list tbody');
                $sort.find("tr").each(function() {
                    if ($(this).data("id") != undefined) {
                        last_page_record += "rec[]=" + $(this).data("id") + "&";
                    }
                });
                json_async("/admin/record/sort.json", last_page_record + $sort.sortable('serialize'), function (data) {
                    message.snackbar("排序完成...");
                }, function (data) {
                    return false;
                });
            }
        });
    //}catch(e){
    //}
}
function makeListOp(){
    var $operations_ul = $(".filed-display-operations ul");
    if ($operations_ul.data("done") == true) return false;
    $("input[data-field]").each(function () {
        var field_name = $(this).data("field");
        var field_texe = $(this).text();
        var field_val  = $(this).val();
        var is_checked = "checked" ? $(this).attr("checked"): "";
        if (field_name != 'is_enable' && field_name != 'record_buttons' && field_name != '') {
            $operations_ul.append(
                '<li><input type="checkbox" ' + is_checked + ' ' +
                'id="ro-field-' + field_name + '" ' +
                'value="' + field_val + '">' +
                '<label for="ro-field-' + field_name + '">' + $(this).parent().text() + '</label></li>'
            );
        }
    });
    $operations_ul.find("input[type=checkbox]").change(function() {
        var id = $(this).attr("id").replace("ro-field-", "");
        var val = $(this).is(":checked");
        $("input[data-field='" + id + "']").click();
    });
    $operations_ul.attr("data-done", true);
}
function is_aside(){
    return (window.name == "aside_iframe");
}
function is_content(){
    return (window.name != "aside_iframe");
}
function changeLangField(index){
    $("a.btn-lang").eq(index).click();
}
function createEditorField(id){
    var ed = tinyMCE.createEditor(id, {
    theme : 'modern',
    content_css : ["/plugins/backend_ui_material/static/plugins/TinyMCE/4.2.5/skins/lightgray/content.min.css"],
    height: 400,
    plugins: [
    "link image media code table preview hr anchor pagebreak textcolor fullscreen colorpicker "
    ],
    toolbar: "undo redo | styleselect | alignleft aligncenter alignright | forecolor backcolor bold italic | link upload_image image media | code custom_fullscreen",
    statusbar: false,
    menubar: false,
    setup : function(ed) {
        ed.addButton('upload_image', {
            title : '插入圖片',
            image : '/plugins/backend_ui_material/static/plugins/TinyMCE/4.2.5/themes/upload_image.png',
            onclick : function() {
                uploader.pickup(ed, true)
            }
        });

        ed.addButton('custom_fullscreen', {
            title: '擴大編輯區',
            image : '/plugins/backend_ui_material/static/plugins/TinyMCE/4.2.5/themes/fullscreen.png',
            onclick : function() {
                ed.execCommand('mceFullScreen');
                $(".page-header").toggle();
            }
        });
        ed.on('init', function (e) {
        });
    },
    convert_urls:false,
    relative_urls:false,
    remove_script_host:false
    });
    ed.render();
}
function showLoading(target, callback){
    $(target).html('<div id="onLoad">' +
        '<div class="sk-spinner sk-spinner-chasing-dots">' +
        '<div class="sk-dot1"></div>' +
        '<div class="sk-dot2"></div>' +
        '</div>' +
        '</div>');
    if (typeof callback === "function") callback();
}

//  初始化
$(function(){
    uploader.init();
    shortcut.init();
    message.init();
    //$(document).bind("keydown", function(e) {
    //    short_key(window.name, e);
    //});

    $(".page-overlay").click(methods.closeSearchBox);
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
    $("#keyword").focus(function(){
        methods.closeMessageBox();
        methods.showSearchBox();
    }).keyup(function(event){
        if (event.which == 13) {
            event.preventDefault();
            content_area.search($(this).val());
        }
    });
    content_area.init(content_area.dom);
    if (window.name != ""){
        pageInit();
    }
    if (is_aside()) {
        aside_iframe.init("#aside_iframe");
        aside_iframe.page = page;
    }else{
        content_area.init(content_area.dom);
        content_area.page = page;
    }

    $(document)
    .on("click", "a", function (e) {
        // 處理超連結按下時的動作
        var _url = $(this).attr("href");
        if (_url === "/admin/") {location.reload(); return;}
        // 切換視圖
        if ($(this).hasClass("view-change")) {
            e.preventDefault();
            view.change($(this).data("view"));
            return;
        }
        if (_url === undefined){
            e.preventDefault();
            return;
        }
        // 切換語系
        if ($(this).hasClass("btn-lang")) {
            e.preventDefault();
            var lang = $(this).data("lang");
            $("div.lang").hide();
            $("div.lang.lang-" + lang).show();
            return;
        }
        // 刪除項目
        if ($(this).hasClass("btn-json-delete")) {
            e.preventDefault();
            e.stopPropagation();
            deleteRecord(_url);
            return;
        }
        if ($(this).hasClass("gallery-item")) {
            e.preventDefault();
            return;
        }
        // Json 操作
        if ($(this).hasClass("btn-json")) {
            e.preventDefault();
            var callback = $(this).data("callback");
            json(_url, null, function (data) {
                if (callback !== undefined && callback !== "undefined"){
                    eval(callback + '(' + JSON.stringify(data) + ')' );
                }else{
                    if (is_content()) {
                        content_area.reload();
                    }
                }
            }, function(data){
                if (data.code == "404"){
                    show_message("找不到目標頁面");
                }else{
                    show_message(data.error);
                }
            });
            return;
        }
        // js 語法
        if (_url.indexOf("javascript:") <0 && _url.indexOf("#") <0 ){
            var i_text = $(this).find(".icon").text() ? ($(this).find(".icon").length>0) : "";
            var t = $(this).text().replace(i_text, "").trim();
            var target = $(this).attr("target");
            if (target == "aside_iframe"){
                if ($(this).hasClass("field-type-side-panel-field")){
                    page_data.last_side_panel_target_id = $(this).attr("id");
                }
                aside_iframe.load($(this).attr("href"));
                e.preventDefault();
                e.stopPropagation();
            }
            if (typeof target === "undefined" || target == "content_area") {
                content_area.load($(this).attr("href"), t, location.pathname);
                e.preventDefault();
                e.stopPropagation();
            }
        }
    }).on("click", ".record_item td", function(e){
        if (e.target.outerHTML.indexOf('switch-toggle') > 0 || e.target.outerHTML.indexOf('input') > 0){ return; }
        var url_target = view.current + "-url";
        var url = $(this).parent().data(url_target);
        if ($(this).hasClass("record_item")){
            url = $(this).data(url_target);
        }
        if (url && url != ""){
            if (view.current != "delete"){
                if ($(this).parent().data(view.current + "-iframe") == 'aside')
                    aside_iframe.load(url);
                else
                    content_area.load(url);
                    // debugger 使用 aside
                    //aside_iframe.load(url);
            }else{
                deleteRecord(url);
            }
        }
    }).on("click", ".aside-close", function(e){
        aside_iframe.closeUi();
    }).on("click", ".filepicker", function(e){
        uploader.pickup($(this).parents(".input-group").find("input"), false);
    }).on("click", "a[target=content_iframe]", function(e){
        e.preventDefault();
        e.stopPropagation();
        var i_text = $(this).find(".icon").text() ? ($(this).find(".icon").length>0) : "";
        var t = $(this).text().replace(i_text, "").trim();
        content_area.load($(this).attr("href"), t, content_area.getUrl(), true);
        if ($(this).hasClass("main-link")){ aside_iframe.closeUi(); }
    }).on("change", ".file_picker_div input", function(){
        var val = $(this).val();
        var is_image = $(this).parents(".form-group").hasClass("form-group-avatar") ||
                $(this).parents(".form-group").find("input").hasClass("image");
        if (is_image){
            $(this).parents(".form-group").find(".file_picker_item").css("background-image", "url(" + val + ")").text("");
        }else{
            $(this).parents(".form-group").find(".file_picker_item").attr("data-ext", val.split(".")[1]).text(val.split(".")[1]);
        }
        if ($(this).attr("id") == "avatar"){
            methods.setUserInformation($("#name").val(), val);
        }
    }).on("change", ".record_item td .btn-checkbox-json", function(){
        if ($(this).is(":checked")){
            var enable_text = $(this).data("enable-text");
            json($(this).data("enable-url"), null, function(data){
                if (data.data.info == "success"){
                    message.snackbar(data.message);
                }
            });
        }else{
            var disable_text = $(this).data("disable-text");
            json($(this).data("disable-url"), null, function(data){
                if (data.data.info == "success"){
                    message.snackbar(data.message);
                }
            });
        }
    });

    key.filter = function(event){
        var tagName = (event.target || event.srcElement).tagName;
        key.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'doc');
        return true;
    };
    key(shortcut.keys, 'doc', function(event, handler){ return shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
    key(shortcut.keys, 'input', function(event, handler){ return shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
    moment.locale('zh-tw');
    setInterval(refreshMoment, 10000);
    window.onbeforeunload = function(){
        $(document).unbind();    //remove listeners on document
        $(document).find('*').unbind(); //remove listeners on all nodes
        //clean up cookies
        //remove items from localStorage
    };
});