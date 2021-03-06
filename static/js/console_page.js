
// yooliang material backend
// 侑良管理後台
// Version 1.01 (2016/08/21)
// @requires jQuery v2 or later
// Copyright (c) 2016 Qi-Liang Wen 啟良
function ajax(url,data,successCallback,errorCallback,headers){$.ajax({url:url,type:"GET",headers: headers,cache: true,data:data,async:1,success:function(responseText){successCallback(responseText)},error:function(xhr,ajaxOptions,thrownError){if(errorCallback){errorCallback(xhr.responseText)}else{alert(thrownError.message)}}})};
function json(url,data,successCallback,errorCallback){$.ajax({url:url,type:"POST",dataType:"json",data:data,async:!1,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?alert(d.message):errorCallback(b,c,d)}})};
function json_async(url,data,successCallback,errorCallback){$.ajax({url:url,type:"POST",cache: false,dataType:"json",data:data,async:1,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?alert(d.message):errorCallback(b,c,d)}})};
function replaceParam(a,b,c){a=a.replace("#/","");var d="";var m=a.substring(0,a.indexOf("?"));var s=a.substring(a.indexOf("?"),a.length);var j=0;if(a.indexOf("?")>=0){var i=s.indexOf(b+"=");if(i>=0){j=s.indexOf("&",i);if(j>=0){d=s.substring(i+b.length+1,j);s=a.replace(b+"="+d,b+"="+c)}else{d=s.substring(i+b.length+1,s.length);s=a.replace(b+"="+d,b+"="+c)}}else{s=a+"&"+b+"="+c}}else{s=a+"?"+b+"="+c}return s};
function getRandID(a){if(a==undefined){a="rand-id-"}var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(var i=0;i<5;i++)a+=b.charAt(Math.floor(Math.random()*b.length));return a};
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
        alert("請稍候...", 30000, false);
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
        if (field_name != 'sortable' && field_name != 'is_enable' && field_name != 'record_buttons' && field_name != '') {
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
function changeLangField(index){
    $("a.btn-lang").eq(index).click();
}

let page = null;
const user = new Vue({
    el: "#user-box",
    data: {
        "name": "",
        "image": "",
        "key": "",
        "profile_url": ""
    }
});

const view = {
    "current": "edit",
    "last": "edit",
    "edit": null,
    "view": null,
    "sort": null,
    "delete": null,
    "change": function(view_name){
        this.last = this.current;
        this.current = view_name;
        $("body").removeClass("in-"+this.last+"-mode").addClass("in-"+view_name+"-mode");
        var function_name = this[view_name];
        try{
            if (function_name){
                if (typeof methods[function_name] == "function"){
                    methods[function_name]();
                }else{
                    if (page && typeof page[function_name] == "function"){
                        page[function_name]();
                    }
                }
            }
        }catch(e){
            console.log(e);
        }
    },
    "reset": function(dom){
        var $page_data = dom.find(".page-data");
        this.edit = $page_data.data("view-function-edit");
        this.view = $page_data.data("view-function-view");
        this.sort = $page_data.data("view-function-sort");
        this.delete = $page_data.data("view-function-delete");
    }
};
const form = {
    "data": {
        "last_url": null,
        "last_target": null,
        "lock_timer": null,
        "is_lock": false
    },
    "validate": function(j){
        var err = j["errors"];
        if (err){
            for (var key in err) {
                $("form #" + key).parents(".form-group").addClass("has-error has-danger").find(".help-block").text(err[key]);
            }
            if (form.data.last_target.attr("action").indexOf("/_ah/upload/") >= 0) {
                form.data.last_target.attr("action", j["new_form_action"]);
            }
            message.snackbar("表單欄位有誤");
            return false;
        }
        return true;
    },
    "beforeSubmit": function(){
        if (form.data.is_lock == true) return false;
        methods.lock(form);
        alert("請稍候...", 30000, false);
        form.data.last_target.find(".field-type-rich-text-field").each(function(){
            var id = $(this).attr("id");
            if (tinyMCE.get(id)){
                $(this).val(tinyMCE.get(id).getContent());
            }
            $(this).change();
        });
        if (form.data.last_target.find("input[name$='response_content_type']").length == 0){
            var r = form.data.last_target.data("return-encoding");
            if (typeof r === "undefined") r = "application/json";
            $('<input type="hidden" name="response_content_type" value="' + r + '" />').appendTo(form.data.last_target);
        }
    },
    "submit": function(form_id, callback){
        if (form.data.is_lock == true){ return false;}
        if (typeof form_id === "undefined") form_id = "form:not(#file-form)";
        if (typeof callback === "function" || typeof callback === "undefined") form.afterSubmitCallback = callback;
        var $form = $(form_id);
        if ($form.length <=0){ return false;}
        form.data.last_target = $form.first();
        form.beforeSubmit();
        $form.ajaxSubmit({"success": form.afterSubmit, "error": form.onError});
    },
    "submitAndGoBack": function(form_id){
        form.submit(form_id, function(data){
            methods.goBack();
            message.snackbar(data, '已儲存');
        });
    },
    "saveFormAndGoNext": function(form_id){
        form.submit(form_id, function(data){
            methods.goNextOne();
            message.snackbar(data, '已儲存');
        });
    },
    "submitAndReload": function(form_id){
        form.submit(form_id, function(data){
            content_area.load(data["scaffold"]["method_record_edit_url"], "", {}, false, true);
            message.snackbar(data, '已儲存');
        });
    },
    "afterSubmit": function(j, b , c, d){
        // 表單資料儲存完成之後
        methods.unlock(form);
        form.data.last_target.find(".form-group").removeClass("has-error has-danger").find(".help-block").text("");
        var data = (typeof j.data !== "undefined") && j.data || j;
        var result = (typeof j.result !== "undefined") && j.result || j;

        if (form.validate(data) || result === "success" || result === true) {
            methods.setUserInformation($("#name").val(), $("#avatar").val());
            if (typeof form.afterSubmitCallback === "function"){
                // 儲存並離開、建立並繼續編輯 會有 callback
                form.afterSubmitCallback(j);
                form.afterSubmitCallback = null;
            }else{
                // 儲存
                message.snackbar(j);
                aside_area.reload();
            }
        }else{
            message.snackbar(j);
        }
        form.data.last_target = undefined;
    },
    "afterSubmitCallback": undefined,
    "onError": function(j, b, c, d){
        let ob = $('<div/>').html(j.responseText);
        console.error(ob.find("pre").html());
        let em = ob.find("pre").html().split("\n");
        // console.log(j, b, c, d);
        // console.log(em[em.length-2]);
        methods.unlock(form);
        message.alert('發生錯誤了<pre>' + ob.find("pre").html() + '</pre>');
    },
    "lock": function(s){
        s = s || 5000;
        form.data.is_lock = true;
        clearTimeout(form.data.lock_timer);
        form.data.lock_timer = setTimeout(form.timeout, s);
    },
    "unlock": function(){
        clearTimeout(form.data.lock_timer);
        form.data.is_lock = false;
    },
    "timeout": function(){
        methods.unlock(form);
        alert("連線逾時");
    },
    "lastUiTarget": null,
};
const saveForm = form.submit;
const saveFormAndGoBack = form.submitAndGoBack;
const saveFormAndGoNext = form.saveFormAndGoNext;
const saveFormAndReloadRecord = form.submitAndReload;
const shortcut = {
    keys: 'ctrl+r, `, ctrl+s, ctrl+shift+s, ctrl+alt+s, ctrl+p, esc, f5, ctrl+f5, alt+s, ' +
    'alt+1, alt+2, alt+3, alt+4, alt+5, alt+6, alt+7, alt+8, alt+9, alt+j, alt+k, /, shift+/',
    "data": {
        "lock_timer": null,
        "is_lock": false
    },
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
            case 'ctrl+alt+s': saveFormAndGoNext(); break;
            case 'ctrl+s': saveForm(); break;
            case 'alt+j': methods.goPrevOne(); break;
            case 'alt+k': methods.goNextOne(); break;
            case 'alt+1': case 'alt+2': case 'alt+3': case 'alt+4': case 'alt+5': case 'alt+6': case 'alt+7': case 'alt+8':case 'alt+9':
                changeLangField(parseInt(shortcut_key.replace('alt+', ''))-1);
                break;
        }
        if (scope == "input"){
            switch (shortcut_key) {
                case 'esc':
                    search.esc();
                    return false;
            }
        }else{
            $(".op-mode a").each(function(index){
                if (shortcut_key == $(this).data("view-key") || shortcut_key == (index+1).toString()) view.change($(this).data("view"));
            });
            switch (shortcut_key) {
                case '/':
                    search.focus();
                    return false;
                case 'shift+/':
                    console.log("help");
                    break;
                case 'alt+s':
                    $("body").toggleClass("show-sort-tag");
                    break;
                case '`':
                    if (aside_area.data.is_open)
                        aside_area.closeUi();
                    else
                        aside_area.showUi();
                    break;
                case 'esc':
                    if (shortcut.data.is_lock){
                        methods.unlock(shortcut);
                        aside_area.closeUi();
                        return false;
                    }
                    methods.lock(shortcut, 400);
                    break;
            }
        }
        if (jQuery.inArray(shortcut_key, ['ctrl+shift+s', 'ctrl+s', 'ctrl+r', 'ctrl+f5', 'f5', 'ctrl+p']) >-1){
            return false;
        }
    }
};
const progress_bar = {
    "dom": $(".progress-bar"),
    "set": function(n){
        setTimeout(function(){ progress_bar.dom.width(n + "%"); }, 0);
        if (n==100){
            setTimeout(function(){ progress_bar.dom.width(0); }, 2500);
        }
    }
};
const message = {
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
        window["alert"] = message.alert;
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
        window["snackbar"] = message.snackbar;
    },
    "alert": function(msg, timeout, allowOutsideClick){
        if (typeof allowOutsideClick === "undefined") allowOutsideClick = true;
        if (typeof msg === "undefined") return false;
        msg = message.parse(msg);
        if (timeout !== undefined){
            swal.closeModal();
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
    "snackbar": function(msg, default_msg=''){
        msg = message.parse(msg);
        message.hideAll();
		$('body').snackbar({
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
    },
    "hideAll": function(){
        message.notice.hide();
    },
    "parse": function(j){
        if (typeof j === "undefined" || typeof j === "string") return j;
        var message = j['message'];
        try{
            var status = (j["scaffold"] && j["scaffold"]["response_result"]) && j["scaffold"]["response_result"] || null;
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
            request_method = request_method.replace("admin_", "") + "." + status;
            if (typeof message === "undefined" || message == "")
                return (typeof msg[request_method] === "undefined") && msg["undefined"] || msg[request_method];
            else
                return message;
        }catch(e){
            return message;
        }
    }
};
const search = {
    "dom": "#keyword",
    "target_url": "",
    "prev_word": "",
    "post_word": "",
    "init": function(){
        $(this.dom).focus(this.focus).keyup(function(event){
            if (event.which == 13) {
                event.preventDefault();
                search.getResult($(this).val());
            }
        });
        $(".page-overlay").click(search.unfocus);
    },
    "getResult": function(keyword){
        var url = "";
        var current = search.target_url || content_area.getUrl();
        if (keyword != undefined && keyword != ""){
            keyword = search.prev_word + keyword + search.post_word;
            url = replaceParam(current, "query", keyword);
            url = replaceParam(url, "cursor", "");
            url = url.replace("?cursor=none", "?");
            url = url.replace("&cursor=none", "");
            content_area.load(url);
            this.unfocus();
        }
        if (keyword == ""){
            url = replaceParam(current, "query", "");
            url = url.replace("query=", "");
            content_area.load(url);
            this.unfocus();
        }
    },
    "focus": function(){
        $("div.search-bar, .page-overlay").addClass("on");
        $("body").addClass("on-search");
    },
    "unfocus": function(){
        $(this.dom).blur();
        $("div.search-bar, .page-overlay").removeClass("on");
        $("body").removeClass("on-search");
    },
    "reset": function(dom){
        this.target_url = dom.find(".page-data").data("search-url");
        this.prev_word = dom.find(".page-data").data("search-prev-word");
        this.post_word = dom.find(".page-data").data("search-post-word");
    },
    "esc": function(){
        if ($(this.dom).val().length > 0){
            $(this.dom).val("");
        }else{
            search.unfocus();
        }
    }
};
const uploader = {
    "pickup_target": null,
    "pickup_target_is_editor": false,
    "visual_timer": 3,
    "init": function(){
        $(document).on('change','#image-file-picker', uploader.startUpload);
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
        if (uploader.pickup_target_is_editor) {
            uploader.addFile(file, uploader.pickup_target.id, uploader.setEditorValue);
        }else{
            var randId = getRandID("upload-");
            if (uploader.pickup_target.hasClass("form-group")){
                uploader.pickup_target.attr("data-uploadId", randId);
            }else{
                uploader.pickup_target.parents(".form-group").attr("data-uploadId", randId);
            }
            uploader.addFile(file, randId, uploader.setTargetValue);
        }
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
            if ($(".file-picker-div, .imgs-selector-div, .field-type-rich-text-field").length == 0){
                $("#dropping").addClass("no_target");
            }else{
                $("#dropping").removeClass("no_target");
                $(".file-picker-div, .imgs-selector-div").parent().parent().addClass("dropping-box");
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
        $(".file-picker-div, .imgs-selector-div").parent().parent().addClass("dropping-box");
    },
    "removeVisualClass": function (){
        if (uploader.visual_timer==0){
            $("html").removeClass("dropping");
            $(".file-picker-div, .imgs-selector-div").parent().parent().removeClass("dropping-box");
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
        $(".file-picker-div, .imgs-selector-div").parent().parent().removeClass("dropping-box");
        if (files.length > 10){
            message.insert("danger", "錯誤", "一次可上傳 10個文件", undefined);
            return;
        }
        for (var i=0; i<files.length; i++) {
            var t = evt.target;
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
        var url = data.url;
        var target_id = data.target_id;
        if (typeof data.response.data !== "undefined"){
            data = data.response.data;
            url = data.url;
        }
        var item_key = data.item.__key__;
        var t = $("*[data-uploadId='" + target_id + "']");
        t.find("input").first().val(url).data("key", item_key).show();
        if (url == ""){
            t.find(".file-picker-item").css("background-image", "none").addClass("file-picker-item-none");
        }else{
            t.find(".file-picker-item").css("background-image", "url(" + url + ")").removeClass("file-picker-item-none");
            t.find("input").first().change();
        }
    },
    "setEditorValue": function (data){
        var url = data.url;
        var target_id = data.target_id;
        if (typeof data.response.data !== "undefined"){
            data = data.response.data;
            url = data.url;
        }
        if (tinyMCE.get(target_id)){
            tinyMCE.get(target_id).selection.setContent('<img src="' + url + '" />');
        }
    }
};
const console_history = {
    "data": [],
    "init": function(){
        window.onpopstate = this.popState;
        var h = JSON.parse(localStorage.getItem('console.history'));
        if (h != null && h != [] && h != "null") this.data = h;
    },
    "getState": function(url){
        var item = null;
        if (typeof url === "undefined") url = content_area.getUrl();
        if (console_history.data){
            for (var key in console_history.data) {
                var value = console_history.data[key];
                if (value.href == url)
                    item = value;
            }
        }
        return item;
    },
    "updateState": function(url, page_title, need_push, need_replace){
        var data = this.getState(url);
        if (need_push) {
            this.pushState(url, page_title, data);
        } else {
            if (need_replace) this.replaceState("#" + url, page_title, data);
        }
    },
    "pushState": function(url, text, referer_page){
        var referer_page_data = this.getState(url);
        if (referer_page_data && referer_page_data.referer_page){
            referer_page = referer_page_data.referer_page;
        }
        var history_item = {
            "href": url,
            "text": text,
            "visit": 1,
            "last_date": Date.now(),
            "referer_page": referer_page
        };
        if (console_history.data && url in console_history.data){
            history_item = this.data[url];
            history_item.last_date = Date.now();
            history_item.visit++;
        }else{
            console_history.data[url] = history_item;
        }
        if (url.indexOf("#") < 0) url = "#" + url;
        history.pushState(history_item, text, url);
        localStorage.setItem('console.history', JSON.stringify(console_history.data));
    },
    "popState": function(event){
        var s = event.state;
        if (s){
            var url = s.href.substring(s.href.indexOf("#") + 1);
            aside_area.closeUi();
            content_area.load(url, s.text, s.referer_page, false);
        }
    },
    "replaceState": function(url, page_title, data){
        if (url.indexOf("#") < 0) url = "#" + url;
        history.replaceState(data, page_title, url);
    }
};
const content_area = {
    "dom": null,
    "page": null,
    "data": {
        "last_url": null,
        "lock_timer": null,
        "is_lock": false
    },
    "init": function(){
        content_area.dom = $("#content_area");
        // content_area.dom.on('scroll', function() {
        //     methods.affix(content_area.dom.scrollTop());
        // });
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
        //        $menu_usually.append('<li><a class="waves-attach" href="'+ n.href +'" target="content_area">'+ n.text +'</a></li>');
        //        $menu_usually.parent().removeClass("hidden");
        //    }
        //});
        // ====
        if(window.location.hash) {
            var hash = window.location.hash.replace("#", "");
            var last_page = console_history.getState(hash);
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
        if (!(keep_aside && keep_aside == true)) aside_area.closeUi();
        var last_page = console_history.getState();
        if (last_page != null) {
            content_area.load(last_page.href, last_page.text, last_page.referer_page, false);
        }else{
            location.reload();
        }
    },
    "getUrl": function(){
        return content_area.data.last_url;
    },
    "load": function(url, page_title, referer_page, need_push, need_replace){
        if (content_area.data.is_lock == true) return false;
        if (typeof need_push === "undefined"){ need_push = true }
        if (typeof need_replace === "undefined"){ need_replace = false }
        $("#sortableListsBase").remove();
        if (need_push){
            aside_area.data.last_target_id = "";
            aside_area.closeUi();
        }
        methods.affix(0);
        methods.runAjax(content_area, url, {
            "page_view": view.current
        }, function(new_html){
            console_history.updateState(url, page_title, need_push, need_replace);
            content_area.afterLoad(new_html);
        }, function(new_html){
            console_history.updateState(url, page_title, need_push, need_replace);
            content_area.afterLoad(new_html);
        });
    },
    "afterLoad": function(new_html){
        if (aside_area.data.is_open) {
            aside_area.reload();
        }else{
            let $f = $(".side_panel_open_auto").first();
            if ($(window).width() > 690 && !$f.parents(".form-group").hasClass('hidden'))
                $f.click();
        }
        $('#list-table').on('post-body.bs.table', function () {
            makeSortTable();
            makeListOp();
            methods.checkNavItemAndShow(content_area);
            $(".sortable-list").removeClass("hidden");
            $(".fixed-table-loading").hide();
        });
        $(".moment-from-now").each(function(){
            $(this).text(moment($(this).data("from-now")).fromNow());
        });
        $("select[readonly] :selected").each(function(){ $(this).parent().data("default", this); });
        $("select[readonly]").change(function() { $($(this).data("default")).prop("selected", true); });
        view.reset(content_area.dom);
        search.reset(content_area.dom);
        try{ $(".table").bootstrapTable(); } catch(e){}
        setTimeout(function(){
            $(".fbtn-container").fadeIn();
        }, 500);
        if (content_area.page["afterLoad"] && typeof content_area.page["afterLoad"] === "function"){
            content_area.page["afterLoad"]();
        }
    },
    "timeout": function(){
        methods.unlock(content_area);
        methods.showTimeout(content_area);
    }
};
const aside_area = {
    "dom": null,
    "page": null,
    "data": {
        "is_open": false,
        "lock_timer": null,
        "is_lock": false,
        "last_url": null,
        "last_target_id": null
    },
    "init": function(n){
        aside_area.dom = $("#aside_area");
    },
    "load": function(url){
        if (aside_area.data.is_lock == true) return false;
        if (aside_area.data.is_open == false) aside_area.showUi();
        methods.runAjax(aside_area, url, {
            "page_view": view.current,
            "aside": "aside_area"
        }, aside_area.afterLoad, aside_area.afterLoad);
    },
    "afterLoad": function(new_html){
        //
    },
    "reload": function(){
        //aside_area.load(aside_area.data.last_url);
        var n = aside_area.data.last_target_id;
        aside_area.data.last_target_id = "";
        if (n !== ""){ $("#" + n).click(); }
    },
    "showUi": function(callback){
        $("body").addClass("aside_is_open");
        $("#aside_area").stop().addClass("open").animate({
            "width": ($(window).width() < 768) ? $(window).width() + 3 : "392"}, 500, function(){
            aside_area.data.is_open = true;
            if (typeof callback === "function") callback();
        });
    },
    "closeUi": function(callback){
        $("body").removeClass("aside_is_open");
        $("#aside_area").stop().removeClass("open").animate({"width": "0"}, 500, function(){
            aside_area.data.is_open = false;
            if (typeof callback === "function") callback();
        });
    },
    "timeout": function(){
        methods.unlock(aside_area);
        methods.showTimeout(aside_area);
    }
};
const methods = {
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
            content_area.load($target.data("url"), $target.text(), {}, false, true);
    },
    "goViewPage": function(){
        var $target = $(".view-url").first();
        if ($target.length)
            content_area.load($target.data("url"), $target.text(), {}, false, true);
    },
    "goPrevOne": function(){
        var $target = $(".alt-j").first();
        if ($target.length)
            content_area.load($target.attr("href"), $target.text(), {}, false, true);
    },
    "goNextOne": function(){
        var $target = $(".alt-k").first();
        if ($target.length)
            content_area.load($target.attr("href"), $target.text(), {}, false, true);
    },
    "goBack": function(n){
        n = n || 1;
        setTimeout(history.go(-Math.abs(n)), 10);
    },
    "reload": function(){
        content_area.reload();
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
    "setUserInformation": function(name, blob_url){
        let href = content_area.getUrl();
        if (href.indexOf(user.key) > 0 || href.indexOf(user.profile_url) >= 0){
            user.image = blob_url;
            user.name = name;
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
        target.dom.html('<div style="margin: 100px auto; width: 40%; font-size: 18px;">連線逾時</div>');
        if (typeof callback === "function") callback(target);
    },
    "showLoading": function(target, callback){
        // loading 畫面
        target.dom.html('<div id="onLoad">' +
            '<div class="sk-spinner sk-spinner-chasing-dots">' +
            '<div class="sk-dot1"></div><div class="sk-dot2"></div></div></div>');
        if (typeof callback === "function") callback();
    },
    "checkEditor": function(target){
        tinyMCE.editors=[];
        target.dom.find(".field-type-rich-text-field, .field-type-code-json-field, .field-type-code-js-field, .field-type-code-css-field").each(function() {
            $(this).prev().remove();
            var id = $(this).attr("id");
            if (id == undefined){ id = $(this).attr("name"); $(this).attr("id", id).height(300); }
        });
        target.dom.find(".field-type-rich-text-field").each(function() {
            $(this).prev().remove();
            methods.createEditorField($(this).attr("id"));
        });
        target.dom.find(".field-type-code-json-field").each(function() {
            methods.createCodeField($(this).attr("id"), 'application/ld+json');
        }).change();
        target.dom.find(".field-type-code-js-field").each(function() {
            methods.createCodeField($(this).attr("id"), 'javascript');
        });
        target.dom.find(".field-type-code-css-field").each(function() {
            methods.createCodeField($(this).attr("id"), 'css');
        });
    },
    "checkPageHeader": function(target){
        target.dom.find(".page-header").each(function(){
            if ($(".content .ibox-content").length > 0){
                $(this).addClass("complex");
                $(".page-big-header").addClass("complex")
            }
            if ($(".content .ibox-report").length > 0){
                $(this).addClass("has-report");
            }

            if ($(this).text().trim() == ""){
                $(this).remove();
            }
        });
    },
    "checkNavItemAndShow": function (target){
        // 處理頁面上的選單區塊
        // 預設為第一種語系欄位
        target.dom.find("a.btn-lang").first().click();
        // 沒有 相關操作 項目的話，隱藏
        target.dom.find(".list-operations").each(function(){
            if ($(this).find("li").length > 0){
                $(this).removeClass("hide");
            }else{
                $(this).addClass("hide");
            }
        });
        // 沒有項目的話，整個隱藏
        if (target.dom.find(".nav-box li").length > 0){
            target.dom.find(".nav-box").removeClass("hide").addClass("animated").addClass("fadeInUp");
        }
    },
    "createEditorField": function(id) {
        if (!id) return false;
        var ed = tinyMCE.createEditor(id, {
            theme: 'modern',
            content_css: ["/plugins/backend_ui_material/static/plugins/TinyMCE/4.6.2/skins/lightgray/content.min.css"],
            height: 400,
            plugins: [
                "link image media code table preview hr anchor pagebreak textcolor fullscreen colorpicker "
            ],
            toolbar: "undo redo | styleselect | alignleft aligncenter alignright | forecolor backcolor bold italic | link upload_image image media | code custom_fullscreen",
            statusbar: false,
            menubar: false,
            setup: function (ed) {
                ed.addButton('upload_image', {
                    title: '插入圖片',
                    image: '/plugins/backend_ui_material/static/plugins/TinyMCE/4.6.2/themes/upload_image.png',
                    onclick: function () {
                        uploader.pickup(ed, true)
                    }
                });

                ed.addButton('custom_fullscreen', {
                    title: '擴大編輯區',
                    image: '/plugins/backend_ui_material/static/plugins/TinyMCE/4.6.2/themes/fullscreen.png',
                    onclick: function () {
                        ed.execCommand('mceFullScreen');
                        $(".page-header").toggle();
                    }
                });
                ed.on('init', function (e) {
                });
            },
            convert_urls: false,
            relative_urls: false,
            remove_script_host: false
        });
        ed.render();
    },
    "createCodeField": function(editor_id, target_type){
        if (target_type == "html") target_type = "text/html";
        code_editor = CodeMirror.fromTextArea(document.getElementById(editor_id), {
            mode: target_type,
            lineNumbers: true,
            indentUnit: 4,
            matchBrackets: true,
            foldGutter: true,
            autoRefresh: true,
            autofocus: false,
            extra_keywords: ["sql", "response"]
        });
        code_editor.on('change',function(cMirror){
            $("#" + editor_id).val(cMirror.getValue()).change();
        });
        var totalLines = code_editor.lineCount();
        var n = 30 * (totalLines + 2);
        if (n > 300) n = 300;
        code_editor.autoFormatRange({line:0, ch:0}, {line:totalLines});
        code_editor.setSize('100%', n);
    },
    "toggleFullScreen": function(){
        var doc = window.document;
        var docEl = doc.documentElement;

        if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
            methods.requestFullScreen.call(docEl);
        }
        else {
            methods.cancelFullScreen.call(doc);
        }
    },
    "requestFullScreen": function(doc, docEl){
        doc = doc || window.document;
        docEl = docEl || doc.documentElement;
        var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
        requestFullScreen.call(docEl);
    },
    "cancelFullScreen": function(doc){
        doc = doc || window.document;
        var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;
        cancelFullScreen.call(doc);
    },
    "refreshMoment": function(s){
        setTimeout(function(){
            $(".moment-from-now").each(function(){
                $(this).text(moment($(this).data("from-now")).fromNow());
            });
            $(".moment-vue-from-now").each(function(){
                var d = $($(this).context.outerHTML).data("vue-from-now");
                $(this).text(moment(d).fromNow());
            });
        }, s || 500);
    },
    "runAjax": function(target, url, headers, callback, error_callback){
        target.data.last_url = url;
        methods.lock(target);
        methods.showLoading(target, function(){
            ajax(url, null, function(new_html){
                methods.unlock(target);
                methods.setPageHtml(target, new_html);
                if (typeof callback == "function") callback(new_html);
            }, function(new_html){
                methods.unlock(target);
                methods.setPageHtml(target, new_html);
                if (typeof error_callback == "function") error_callback(new_html);
            }, headers);
        });
    },
    "setPageHtml": function(target, new_html){
        page = target.page = {};
        if (new_html) {
            try {
                target.dom.hide().html(new_html);
            } catch (e) {
                message.alert("發生問題了 " + e.toString());
            }
        }
        methods.checkPageHeader(target);
        methods.checkNavItemAndShow(target);
        if (target.dom.attr("id") == "content_area"){
            methods.checkEditor(target);
        }
        setTimeout(function(){ target.dom.show() }, 100)
    },
    "showUserSearch": function(keyword){
        json_async('/admin/application_user/form/search_application_user?query=' + keyword, null, function(data){
            data = data.data;
            let c = '';
            for (let i=0;i<data.length;i++){
                let d = data[i];
                c += '<tr><td><input type="radio" class="user_item" name="swal2-radio" data-image="' + d.avatar + '" id="' + d.__key__ + '" value="' + d.__key__ + '" ></td><td class="text-left"><label for="' + d.__key__ + '">' + d.name + '</label></td><td class="text-left"><label for="' + d.__key__ + '">' + d.email + '</label></td></tr>';
            }
            swal({
                showCancelButton: true,
                preConfirm: function () {
                    return new Promise(function (resolve) {
                        let select_item = $(".user_item[type=radio]:checked");
                        resolve([
                            select_item.val(),
                            select_item.parent().next().text(),
                            select_item.data("image")
                        ])
                    })
                },
                html: '<input type="text" class="form-control" id="user-search" value="' + keyword + '"><button id="btn-user-search" class="btn">搜尋</button><div><table id="table" class="margin-0" style="width:100%"><thead><tr><th class="text-center" style="background: #c6c6c6; padding: 8px;">#</th><th class="text-center" style="background: #c6c6c6; padding: 8px;">Name</th><th class="text-center" style="background: #c6c6c6; padding: 8px;">E-Mail</th></tr></thead><tbody>' + c + '</tbody></table></div>'
            }).then(function (result) {
                $(form.lastUiTarget).val(result[1]).next().val(result[0]).next().find(".user-picker-item").css("background-image", "url(" + result[2] + ")");
            })
        });
        // var radiohtml = '';
        // var inputOptions = new Promise(function (resolve) {
        //     json_async('/admin/application_user/form/search_application_user?query=' + keyword, null, function(data){
        //         data = data.data;
        //         let c = {};
        //         for (let i=0;i<data.length;i++){
        //             let d = data[i];
        //             c[d.__key__] = d.name + ' / ' + d.email;
        //             radiohtml += '<tr><td><input type="radio" class="user_item" name="swal2-radio" id="swal2-radio-1" value="' + d.__key__ + '" ></td><td class="text-left"><label for="' + d.__key__ + '">' + d.name + '</label></td><td class="text-left"><label for="' + d.__key__ + '">' + d.email + '</label></td></tr>';
        //         }
        //         resolve(c)
        //     });
        // });
        //
        // swal({
        //     input: 'radio',
        //     showCancelButton: true,
        //     inputOptions: inputOptions,
        //     inputValidator: function (result) {
        //         return new Promise(function (resolve, reject) {
        //             if (result) {
        //                 resolve()
        //             } else {
        //                 reject('You need to select something!')
        //             }
        //         })
        //     },
        //     html: '<input type="text" class="form-control" id="user-search" value="' + keyword + '"><button id="btn-user-search" class="btn">搜尋</button><div><table id="table" class="margin-0" style="width:100%"><thead><tr><th class="text-center" style="background: #c6c6c6; padding: 8px;">#</th><th class="text-center" style="background: #c6c6c6; padding: 8px;">Name</th><th class="text-center" style="background: #c6c6c6; padding: 8px;">E-Mail</th></tr></thead><tbody></tbody></table></div>',
        //     onOpen: function(ele) {
        //         debugger;
        //         $(ele).find('.swal2-radio').remove();
        //         $(ele).find('tbody').html(radiohtml);
        //         // $(radiohtml).appendTo();
        //     }
        // }).then(function (result) {
        //     swal({
        //         type: 'success',
        //         html: 'You selected: ' + result
        //     })
        // })
    },
    "lock": function(target, s){
        s = s || 30000;
        clearTimeout(target.data.lock_timer);
        target.data.is_lock = true;
        target.data.lock_timer = setTimeout(target.timeout, s);
    },
    "unlock": function(target, s){
        clearTimeout(target.data.lock_timer);
        target.data.is_lock = false;
    }
};
//  初始化
$(function(){
    uploader.init();
    shortcut.init();
    message.init();
    search.init();
    console_history.init();
    content_area.init();
    aside_area.init();
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

    $(document)
        .on("click", "a", function (e) {
        // 處理超連結按下時的動作
        var _url = $(this).attr("href");
        // 切換視圖
        if ($(this).hasClass("view-change")) {
            e.preventDefault();
            view.change($(this).data("view"));
            return;
        }
        if ($(this).hasClass("gallery-item")) {
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
        if (_url === undefined){
            e.preventDefault();
            return;
        }
        if (_url === "/admin/") {location.reload(); return;}
        // 刪除項目
        if ($(this).hasClass("btn-json-delete")) {
            e.preventDefault();
            e.stopPropagation();
            deleteRecord(_url);
            return;
        }
        // Json 操作
        if ($(this).hasClass("btn-json")) {
            e.preventDefault();
            e.stopPropagation();
            var parent_is_content = $(this).parents("#content_area").length;
            var callback = $(this).data("callback");
            var not_reload = false;
            if ($(this).hasClass("btn-json-not-reload")){
                not_reload = true;
            }
            json(_url, null, function (data) {
                if (callback !== undefined && callback !== "undefined"){
                    eval(callback + '(' + JSON.stringify(data) + ')' );
                }else{
                    if (typeof data["message"] !== "undefined" && data["message"] !== "")
                        alert(data["message"]);
                    if (parent_is_content && not_reload == false)
                        content_area.reload();
                }
            }, form.onError);
            return;
        }
        // js 語法
        if (_url.indexOf("javascript:") <0 && _url.indexOf("#") <0 ){
            var i_text = $(this).find(".icon").text() ? ($(this).find(".icon").length>0) : "";
            var t = $(this).text().replace(i_text, "").trim();
            var target = $(this).attr("target");
            if (target == "aside_area"){
                if ($(this).hasClass("field-type-side-panel-field")){
                    aside_area.data.last_target_id = $(this).attr("id");
                }
                e.preventDefault();
                e.stopPropagation();
                aside_area.load($(this).attr("href"));
                return false;
            }
            if (typeof target === "undefined" || target == "content_area") {
                e.preventDefault();
                e.stopPropagation();
                content_area.load($(this).attr("href"), t, location.pathname);
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
                    aside_area.load(url);
                else
                    content_area.load(url);
            }else{
                deleteRecord(url);
            }
        }
    }).on("click", ".aside-close, .close-side-panel", function(e){
        aside_area.closeUi();
    }).on("click", ".file-picker", function(e){
        uploader.pickup($(this).parents(".input-group").find("input"), false);
        e.preventDefault();
        e.stopPropagation();
    }).on("click", "#btn-user-search", function(e){
        methods.showUserSearch($("#user-search").val());
    }).on("click", ".user-picker", function(e){
        e.preventDefault();
        e.stopPropagation();
        if ($(this).hasClass('lock')){
            return false;
        }
        // TODO
        form.lastUiTarget = $(this).parents(".form-group").find("input[type=text]");
        methods.showUserSearch(form.lastUiTarget.val());
    }).on("click", "a[target=content_area]", function(e){
        e.preventDefault();
        e.stopPropagation();
        var i_text = $(this).find(".icon").text() ? ($(this).find(".icon").length>0) : "";
        var t = $(this).text().replace(i_text, "").trim();
        content_area.load($(this).attr("href"), t, content_area.getUrl(), true);
        if ($(this).hasClass("main-link")){ aside_area.closeUi(); }
    }).on("change", ".file-picker-div input", function(){
        var val = $(this).val();
        var is_image = $(this).parents(".form-group").hasClass("form-group-avatar") ||
                $(this).parents(".form-group").find("input").hasClass("image");
        if (is_image){
            $(this).parents(".form-group").find(".file-picker-item").css("background-image", "url(" + val + ")").text("");
        }else{
            $(this).parents(".form-group").find(".file-picker-item").attr("data-ext", val.split(".")[1]).text(val.split(".")[1]);
        }
    }).on("change", ".record_item td .btn-checkbox-json", function(){
        json($(this).is(":checked") && $(this).data("enable-url") || $(this).data("disable-url"), null, message.snackbar);
    }).on("change", "input[type=range]", function(){
        $(this).next().text($(this).val() + $(this).data("unit"));
    }).on("input", "input[type=range]", function(){
        $(this).next().text($(this).val() + $(this).data("unit"));
    }).on("keypress", "#user-search", function (e){
        if (e.keyCode == 13) {
            methods.showUserSearch($("#user-search").val());
        }
    });

    $(window).resize(function(){
        if (aside_area.data.is_open){
            aside_area.showUi();
        }
    });
    moment.locale('zh-tw');
    methods.refreshMoment(1000);
    window.onbeforeunload = function(){
        $(document).unbind();    //remove listeners on document
        $(document).find('*').unbind(); //remove listeners on all nodes
        //clean up cookies
        //remove items from localStorage
    };
    let $ubox = $("body");
    user.name = $ubox.data("user-name");
    user.image = $ubox.data("user-image");
    user.profile_url = $ubox.data("profile-url");
    user.key = $ubox.data("user-key");
});

CodeMirror.defineExtension("autoFormatRange", function (from, to) {
    var cm = this;
    var outer = cm.getMode(), text = cm.getRange(from, to).split("\n");
    var state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
    var tabSize = cm.getOption("tabSize");

    var out = "", lines = 0, atSol = from.ch == 0;
    function newline() {
        out += "\n";
        atSol = true;
        ++lines;
    }

    for (var i = 0; i < text.length; ++i) {
        var stream = new CodeMirror.StringStream(text[i], tabSize);
        while (!stream.eol()) {
            var inner = CodeMirror.innerMode(outer, state);
            var style = outer.token(stream, state), cur = stream.current();
            stream.start = stream.pos;
            if (!atSol || /\S/.test(cur)) {
                out += cur;
                atSol = false;
            }
            if (!atSol && inner.mode.newlineAfterToken &&
                inner.mode.newlineAfterToken(style, cur, stream.string.slice(stream.pos) || text[i+1] || "", inner.state))
                newline();
        }
        if (!stream.pos && outer.blankLine) outer.blankLine(state);
        if (!atSol) newline();
    }

    cm.operation(function () {
        cm.replaceRange(out, from, to);
        for (var cur = from.line + 1, end = from.line + lines; cur <= end; ++cur)
            cm.indentLine(cur, "smart");
    });
});
CodeMirror.defineExtension("autoIndentRange", function (from, to) {
    var cmInstance = this;
    this.operation(function () {
        for (var i = from.line; i <= to.line; i++) {
            cmInstance.indentLine(i, "smart");
        }
    });
});
(function(CodeMirror) {
  "use strict"

  CodeMirror.defineOption("autoRefresh", false, function(cm, val) {
    if (cm.state.autoRefresh) {
      stopListening(cm, cm.state.autoRefresh)
      cm.state.autoRefresh = null
    }
    if (val && cm.display.wrapper.offsetHeight == 0)
      startListening(cm, cm.state.autoRefresh = {delay: val.delay || 250})
  })

  function startListening(cm, state) {
    function check() {
      if (cm.display.wrapper.offsetHeight) {
        stopListening(cm, state)
        if (cm.display.lastWrapHeight != cm.display.wrapper.clientHeight)
          cm.refresh()
      } else {
        state.timeout = setTimeout(check, state.delay)
      }
    }
    state.timeout = setTimeout(check, state.delay)
    state.hurry = function() {
      clearTimeout(state.timeout)
      state.timeout = setTimeout(check, 50)
    }
    CodeMirror.on(window, "mouseup", state.hurry)
    CodeMirror.on(window, "keyup", state.hurry)
  }

  function stopListening(_cm, state) {
    clearTimeout(state.timeout)
    CodeMirror.off(window, "mouseup", state.hurry)
    CodeMirror.off(window, "keyup", state.hurry)
  }
})(CodeMirror);