function json(url,data,successCallback,errorCallback) {$.ajax({url:url,type:"POST",dataType:"json",cache: false,data:data,async:!1,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?show_message(b.responseJSON.error):errorCallback(b.responseJSON)}})};
function json_async(url,data,successCallback,errorCallback) {$.ajax({url:url,type:"POST",dataType:"json",cache: false,data:data,async:1 ,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?show_message(b.responseJSON.error):errorCallback(b.responseJSON)}})};
function ajax_post(url,data,successCallback,errorCallback) {$.ajax({url:url,type:"POST",cache: true,data:data,async:true,success:function(responseText){successCallback(responseText)},error:function(xhr,ajaxOptions,thrownError){if(errorCallback){errorCallback(xhr.responseText)}else{window.alert(thrownError.message)}}})};
function getRandID(a){if(a==undefined){a="rand-id-"}var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(var i=0;i<5;i++)a+=b.charAt(Math.floor(Math.random()*b.length));return a};
var backend = parent;
var start_filepicker = function(){};
var page = {};
var pageDOD = {
    "visual_timer": 3,
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
        pageDOD.visual_timer=0;
        setTimeout(pageDOD.removeVisualClass, 1000);
    },
    "onDragOver": function (evt){
        evt.preventDefault();
        evt.stopPropagation();
        pageDOD.visual_timer=3;
        $("html").addClass("dropping");
        $(".file_picker_div, .imgs_selector_div").parent().parent().addClass("dropping-box");
    },
    "removeVisualClass": function (){
        if (pageDOD.visual_timer==0){
            $("html").removeClass("dropping");
            $(".file_picker_div, .imgs_selector_div").parent().parent().removeClass("dropping-box");
            pageDOD.visual_timer = 0;
        }else{
            pageDOD.visual_timer--;
            setTimeout(pageDOD.removeVisualClass, 1000);
        }
    },
    "onDrop": function (evt){
        var files = evt.dataTransfer.files;
        evt.preventDefault();
        pageDOD.visual_timer=0;
        $("html").removeClass("dropping");
        $(".file_picker_div, .imgs_selector_div").parent().parent().removeClass("dropping-box");
        if (files.length > 10){
            backend.message.insert("danger", "錯誤", "一次可上傳 10個文件", undefined);
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
                backend.uploader.addFile(files[i], randId, pageDOD.setEditorValue);
            }else{
                backend.uploader.addFile(files[i], randId, pageDOD.setTargetValue);
            }
        }
    },
    "setTargetValue": function (data){
        var url = data.response.url;
        var item_key = data.response.item.__key__;
        var target_id = data.target_id;
        var t = $("*[data-uploadId='" + data.target_id + "']");
        t.find("input").first().val(data.response.url).data("key", item_key).show();
        if (url == ""){
            t.find(".file_picker_item").css("background-image", "none").addClass("file_picker_item_none");
        }else{
            t.find(".file_picker_item").css("background-image", "url(" + url + ")").removeClass("file_picker_item_none");
            t.find("input").first().change();
        }
    },
    "setEditorValue": function (data){
        var url = data.response.url;
        var target_id = data.target_id;
        if (tinyMCE.get(target_id)){
            tinyMCE.get(target_id).selection.setContent('<img src="' + url + '" />');
        }
    }
};

var page_data = {
    "last_side_panel_target_id": "",
    "is_saving": false,
    "timeout_lock_saving": null
};
var methods = {
    "getSearchingUrl": function(){ return $("#page_url").data("search-url")},
    "changeView": function(){
        $("body").removeClass("in-"+backend.view.last+"-mode").addClass("in-"+backend.view.current+"-mode");
        var function_name = $("#page_url").data("view-function-"+backend.view.current);
        if (page && typeof page[function_name] == "function"){
            page[function_name]();
        }else{
            if (typeof methods[function_name] == "function"){
                methods[function_name]();
            }
        }
    },
    "changeViewAndReload": function(){
        if (backend.view.last != backend.view.current) {
            if (backend.view.current == "edit" || backend.view.current == "view") {
                $("a." + backend.view.current + "-url").first().click();
            }
        }
    },
    "goEditPage": function(){
        var $target = $(".edit-url").first();
        backend.content_iframe.load($target.attr("href"), $target.text(), {}, false, true);
    },
    "goViewPage": function(){
        var $target = $(".view-url").first();
        backend.content_iframe.load($target.attr("href"), $target.text(), {}, false, true);
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
        request_method = request_method.replace("admin_", "") + "." + status;
        if (typeof message === "undefined" || message == "undefined")
            return (typeof msg[request_method] === "undefined") && msg["undefined"] || msg[request_method];
        else
            return message;

    },
    "goBack": function(n){
        n = n || 1;
        if (is_aside()) setTimeout(backend.aside_iframe.closeUi(), 10);
        if (is_content()) setTimeout(history.go(-Math.abs(n)), 10);
    },
    "setBackendMethods": function(){
        //  此文件在 parent 準備好之前就載入完畢
        show_message = backend.message.quick_show;
        start_filepicker = backend.uploader.pickup;
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
            backend.aside_iframe.reload();
        } else {
            backend.content_iframe.reload();
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
            backend.message.snackbar("表單欄位有誤");
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
            backend.ui.setUserInformation($("#name").val(), $("#avatar").val());
            // 停用 2017/2/2 側邊欄應由主編輯區開啟，不該有此行為
            //if (j["scaffold"]["response_method"] == "add" || j["scaffold"]["response_method"] == "edit") {
            //    if (is_aside()) backend.content_iframe.reload(true);
            //}
            backend.message.ui.hide();
            if (typeof form.afterSubmitCallback === "function"){
                // 儲存並離開、建立並繼續編輯 會有 callback
                form.afterSubmitCallback(j, message);
                form.afterSubmitCallback = null;
            }else{
                // 儲存
                backend.message.snackbar(message);
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
var saveForm = form.submit;
function saveFormAndGoBack(form_id){
    saveForm(form_id, function(j, message){
        methods.goBack();
        backend.message.snackbar(message);
    });
}
function saveFormAndReloadRecord(form_id){
    saveForm(form_id, function(j, message){
        if (is_content()) {
            backend.content_iframe.load(j["scaffold"]["method_record_edit_url"], "", {}, false, true);
            backend.message.snackbar(message);
        }
    });
}

// 訊息 (簡單的方式)
function show_message(msg, timeout, allowOutsideClick){
    backend.message.quick_show(msg, timeout, allowOutsideClick);
}

// 確保 file picker 與 message 被正常載入
//  此文件在 parent 準備好之後才載入完畢
if (backend && backend.uploader && backend.uploader.pickup) start_filepicker = backend.uploader.pickup;

function is_aside(){
    return (window.name == "aside_iframe");
}
function is_content(){
    return (window.name == "content_iframe");
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
                start_filepicker(ed, true)
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
function showTimeout(callback){
    hideHeader('<div style="margin: 100px auto; width: 40%; font-size: 18px;">連線逾時</div>', callback);
}
function showLoading(callback){
    hideHeader('<div id="onLoad">' +
        '<div class="sk-spinner sk-spinner-chasing-dots">' +
        '<div class="sk-dot1"></div>' +
        '<div class="sk-dot2"></div>' +
        '</div>' +
        '</div>', callback)
}
function hideHeader(after_hide_html, callback){
    if ($('header').length > 0)
        $('body').addClass("body-hide").html(after_hide_html);
    if (typeof callback === "function") callback();
}
function addClass(class_name){
    $("body").addClass(class_name);
}
function removeClass(class_name){
    $("body").removeClass(class_name);
}
function setBodyClass(class_name){
    $("body").addClass(class_name);
}

function scrollDiv(){
    $(".scrollDiv").addClass("on");
    backend.content_iframe.removeMask();
}

// 僅執行一次
$(function(){
    if (window.name != ""){
        pageInit();
    }
    linkClickProcess();
    if (is_aside()) {
        backend.aside_iframe.init("#aside_iframe");
        backend.aside_iframe.page = page;
    }else{
        backend.content_iframe.init("#content_iframe");
        backend.content_iframe.page = page;
    }

    $(document).on('click', function(e){
        backend.ui.closeSearchBox();
        backend.ui.closeMessageBox();
    }).on("click", ".record_item td", function(e){
        if (e.target.outerHTML.indexOf('switch-toggle') > 0 || e.target.outerHTML.indexOf('input') > 0){ return; }
        var url_target = backend.view.current + "-url";
        var url = $(this).parent().data(url_target);
        if ($(this).hasClass("record_item")){
            url = $(this).data(url_target);
        }
        if (url && url != ""){
            if (backend.view.current != "delete"){
                if ($(this).parent().data(backend.view.current + "-iframe") == 'aside')
                    backend.aside_iframe.load(url);
                else
                    backend.content_iframe.load(url);
                    // debugger 使用 aside
                    //backend.aside_iframe.load(url);
            }else{
                deleteRecord(url);
            }
        }
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
            backend.ui.setUserInformation($("#name").val(), val);
        }
    }).on("change", ".record_item td .btn-checkbox-json", function(){
        if ($(this).is(":checked")){
            var enable_text = $(this).data("enable-text");
            json($(this).data("enable-url"), null, function(data){
                if (data.data.info == "success"){
                    backend.message.snackbar(data.message);
                }
            });
        }else{
            var disable_text = $(this).data("disable-text");
            json($(this).data("disable-url"), null, function(data){
                if (data.data.info == "success"){
                    backend.message.snackbar(data.message);
                }
            });
        }
    });

    key.filter = function(event){
        var tagName = (event.target || event.srcElement).tagName;
        key.setScope(/^(INPUT|TEXTAREA|SELECT)$/.test(tagName) ? 'input' : 'doc');
        return true;
    };
    key(backend.shortcut.keys, 'doc', function(event, handler){ return backend.shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
    key(backend.shortcut.keys, 'input', function(event, handler){ return backend.shortcut.catchEvent(window.name, handler.shortcut, handler.scope); });
    window.onbeforeunload = function(){
        $(document).unbind();    //remove listeners on document
        $(document).find('*').unbind(); //remove listeners on all nodes
        //clean up cookies
        //remove items from localStorage
    };
    moment.locale('zh-tw');
    setInterval(refreshMoment, 10000);
});

function refreshMoment(){
    $(".moment-from-now").each(function(){
        $(this).text(moment($(this).data("from-now")).fromNow());
    });
    $(".moment-vue-from-now").each(function(){
        var d = $($(this).context.outerHTML).data("vue-from-now");
        $(this).text(moment(d).fromNow());
    });
}
// ajax 載入時，需再執行一次
function pageInit(new_html, need_push) {
    page = {};
    var $body = $("body");
    if (new_html){
        try{
            $body.html(new_html);
        }catch(e){
            backend.message.quick_show("發生問題了 " + e.toString());
        }
    }
    var $header = $("header");
    if (is_content()) {
        //backend.content_iframe.setTitle($("title").text());
        if (backend.aside_iframe.is_open) {
            methods.reloadSidePanel();
        }
    }
    if($header.text().trim() != ""){
        $body.addClass("has-header").removeClass("no-header");
    }else{
        $body.addClass("no-header").removeClass("has-header");
        $header.hide();
    }
    $(".aside-close").click(function(){
        backend.aside_iframe.closeUi();
    });

    $(".scrollDiv").hover(function(){
        scrollDiv();
    }, function(){
        $(this).removeClass("on");
    }).mouseover(function(){
        scrollDiv();
    }).mouseleave(function() {
        $(this).removeClass("on");
    }).scroll(function() {
        if (is_content()){
            backend.affix($(this).scrollTop());
        }
    });
    //TODO if input has val addClass control-highlight
    if (window == top) {
        return;
    }
    //backend.content_iframe.afterOnLoad(location.pathname);
    $("#onLoad").remove();
    $body.removeClass("body-hide");
    checkNavItemAndShow();
    $("iframe[name='iframeForm']").load(form.afterSubmit);
    $(".filepicker").click(function(){
        start_filepicker($(this).parents(".input-group").find("input"), false);
    });

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
    if (need_push === true) page_data.last_side_panel_target_id = "";
    setTimeout(function(){
        $(".fbtn-container").fadeIn();
    }, 800);
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
    backend.swal({
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
                backend.swal("删除成功！", "您已经永久删除了此記錄。", "success");
                backend.content_iframe.reload();
            }, function (data) {
                backend.swal("删除失敗！", "刪除記錄時發生問題。", "error");
            })
        }, 50);
    });
}
// 處理超連結按下時的動作
function linkClickProcess(){
    $("body").on("click", "a", function (e) {
        var _url = $(this).attr("href");
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
                        backend.content_iframe.reload();
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
                backend.aside_iframe.load($(this).attr("href"));
            }
            if (typeof target === "undefined" || target == "content_iframe") {
                backend.content_iframe.load($(this).attr("href"), t, location.pathname);
            }
            e.preventDefault();
            e.stopPropagation();
        }
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
                    backend.message.snackbar("排序完成...");
                }, function (data) {
                    return false;
                });
            }
        });
    //}catch(e){
    //}
    //$("table").stickyTableHeaders({scrollableArea: $('.scrollDiv')});
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
