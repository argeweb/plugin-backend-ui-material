function json(url,data,successCallback,errorCallback) {$.ajax({url:url,type:"POST",dataType:"json",cache: false,data:data,async:!1,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?show_message(b.responseJSON.error):errorCallback(b.responseJSON)}})};
function json_async(url,data,successCallback,errorCallback) {$.ajax({url:url,type:"POST",dataType:"json",cache: false,data:data,async:1 ,success:function(a){successCallback(a)},error:function(b,c,d){void 0==errorCallback?show_message(b.responseJSON.error):errorCallback(b.responseJSON)}})};
function ajax_post(url,data,successCallback,errorCallback) {$.ajax({url:url,type:"POST",cache: true,data:data,async:true,success:function(responseText){successCallback(responseText)},error:function(xhr,ajaxOptions,thrownError){if(errorCallback){errorCallback(xhr.responseText)}else{window.alert(thrownError.message)}}})};
function getRandID(a){if(a==undefined){a="rand-id-"}var b="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(var i=0;i<5;i++)a+=b.charAt(Math.floor(Math.random()*b.length));return a};
var save_with_exit = false;
var dom_is_ready = false;
var is_saving = false;
var timeout_lock_saving = null;
var backend = parent;
var page = {};

function show_message(msg, timeout){
    backend.message.quick_show(msg, timeout);
}
// 確保 file picker 與 message 被正常載入
var start_filepicker = backend.uploader.pickup;
function parent_is_ready(){
    //  此文件在 parent 準備好之前就載入完畢
    show_message = backend.message.quick_show;
    start_filepicker = backend.uploader.pickup;
}
if (backend.js_is_ready && backend.js_is_ready == true){
    //  此文件在 parent 準備好之後才載入完畢
    show_message = backend.message.quick_show;
    start_filepicker = backend.uploader.pickup;
}

var pageDOD = {
    "visual_timer": 3,
    "onDragStart": function(evt){
        evt.preventDefault();
        evt.stopPropagation();
        $("html").addClass("dropping");
        if ($(".file_picker_div, .imgs_selector_div, .field-type-rich-text-field").length == 0){
            $("#dropping").addClass("no_target");
        }else{
            $("#dropping").removeClass("no_target");
            $(".file_picker_div, .imgs_selector_div").parent().parent().addClass("dropping-box");
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
function is_aside(){
    return (window.name == "aside_iframe");
}
function is_content(){
    return (window.name == "content_iframe");
}
function reload(){
    if (is_aside()) {
        backend.aside_iframe.reload();
    }else{
        backend.content_iframe.reload();
    }
}
function change_lang(index){
    $("a.btn-lang").eq(index).click();
}
function create_editor(id){
    var ed = tinyMCE.createEditor(id, {
    theme : 'modern',
    content_css : ["/plugins/backend_ui_material/static/plugins/TinyMCE/4.2.5/skins/lightgray/content.min.css"],
    height: 400,
    plugins: [
    "link image media code table preview hr anchor pagebreak textcolor fullscreen colorpicker "
    ],
    toolbar: "undo redo | styleselect | alignleft aligncenter alignright forecolor backcolor bold italic | link upload_image image media | code custom_fullscreen",
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
    $('.page-header').stop().animate({
        top: -70
    });
    if ($('header').length == 0 && typeof callback === "function"){
        callback();
    }else{
        $('header').stop().animate({
            top: -70
        }, 250, function(){
            $('body').addClass("body-hide").html(after_hide_html);
            if (typeof callback === "function") callback();
        });
    }
}
function addClass(class_name){
    $("body").addClass(class_name);
}
function removeClass(class_name){
    $("body").removeClass(class_name);
}
function changeView(){
    $("body").removeClass("in-"+backend.view.last+"-mode").addClass("in-"+backend.view.current+"-mode");
    if (typeof page["change_view_to_"+backend.view.current] == "function"){
        page["change_view_to_"+backend.view.current]();
    }
}
function changeViewAndReload(){
    if (backend.view.last != backend.view.current){
        if (backend.view.current == "edit" || backend.view.current == "view"){
            $("a."+backend.view.current+"-url").first().click();
        }
    }
}
function save_form(){
    if ($("form").length <=0){ return false;}
    if (is_saving == true){ return false;}
    is_saving = true;
    clearTimeout(timeout_lock_saving);
    timeout_lock_saving = setTimeout(function(){ is_saving = false; }, 5000);
    var $form = $("form");
    $form.find(".field-type-rich-text-field").each(function(){
        var id = $(this).attr("id");
        if (tinyMCE.get(id)){
            $(this).val(tinyMCE.get(id).getContent());
        }
        $(this).change();
    });
    $form.submit();
}
function save_and_exit(){
    save_with_exit = true;
    save_form();
}
function scrollDiv(){
    $(".scrollDiv").addClass("on");
    backend.content_iframe.removeMask();
}
//  僅執行一次
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
        if (e.target.outerHTML.indexOf('switch-toggle') > 0 || e.target.outerHTML.indexOf('input') > 0){
            return;
        }
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
            }else{
                backend.swal({
                    title: "您確定要刪除此記錄嗎",
                    text: "删除後后将無法恢複，請谨慎操作！",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "删除",
                    cancelButtonText: "取消",
                    showLoaderOnConfirm: true
                }).then(function(){
                    json(url, null, function (data) {
                        backend.swal("删除成功！", "您已经永久删除了此記錄。", "success");
                        backend.content_iframe.reload();
                    }, function (data) {
                        backend.swal("删除失敗！", "刪除記錄時發生問題。", "error");
                    })
                });
            }
        }
    }).on("change", ".file_picker_div input", function(){
        var val = $(this).val();
        if ($(this).parents(".file_picker_div").hasClass("image")){
            $(this).parents(".file_picker_div").find(".file_picker_item").css("background-image", "url(" + val + ")");
        }else{
            $(this).parents(".file_picker_div").find(".file_picker_item").attr("data-ext", val.split(".")[1]).text(val.split(".")[1]);
        }
        if ($(this).attr("id") == "avatar"){
            backend.ui.setUserInformation($("#name").val(), val);
        }
    }).on("change", ".record_item td .btn-checkbox-json", function(){
        if ($(this).is(":checked")){
            var enable_text = $(this).data("enable-text");
            json($(this).data("enable-url"), null, function(data){
                if (data.info == "success"){
                    backend.message.snackbar(enable_text+"...");
                }
            });
        }else{
            var disable_text = $(this).data("disable-text");
            json($(this).data("disable-url"), null, function(data){
                if (data.info == "success"){
                    backend.message.snackbar(disable_text+"...");
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
});
function setBodyClass(class_name){
    $("body").addClass(class_name);
}
//  ajax 載入時，需再執行一次
function pageInit(new_html) {
    page = {};
    if (new_html){
        try{
            $("body").html(new_html);
        }catch(e){
            console.log(e);
        }
    }
    var nav_var_top = -70;
    var page_header_top = 0;
    var scrollDiv_top = 0;
    if (is_aside()){
        nav_var_top = 0;
        page_header_top = 56;
        scrollDiv_top = 56;
        $("body").addClass("aside");
    }else{
        //backend.content_iframe.setPageTitle($(".page-header h3").text());
    }
    $(".page-header").stop().animate({
        top: nav_var_top
    }, 300);
    if($("header").text().trim() != ""){
        scrollDiv_top += 0;
        $("body").addClass("has-header");
        $("header").stop().animate({
            top: page_header_top
        }, 300);
    }else{
        $("body").addClass("no-header");
        if (is_content()){
            $("header").hide();
        }
    }
    $(".aside-close").click(function(){
        backend.aside_iframe.closeUi();
    });

    if (is_content()){
        scrollDiv_top = 0;
    }
    $(".scrollDiv").stop().animate({
        "margin-top": scrollDiv_top,
    }, 300).hover(function(){
        scrollDiv();
    }, function(){
        $(this).removeClass("on");
    }).mouseover(function(){
        scrollDiv();
    }).mouseleave(function() {
        $(this).removeClass("on");
    }).css({
        "height": "calc(100% - " + scrollDiv_top +"px)"
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
    $('body').removeClass("body-hide");
    checkNavItemAndShow();
    try{
        $("iframe[name='iframeForm']").load(function(){
            var j = JSON.parse($(this).contents().find("body").text());
            $(".form-group").removeClass("has-error has-danger").find(".help-block").text("");
            var err = j["errors"];
            if (err){
                for (var key in err) {
                    $("form #" + key).parents(".form-group").addClass("has-error has-danger").find(".help-block").text(err[key]);
                }
                if ($("form").attr("action").indexOf("/_ah/upload/") >= 0){
                    $("form").attr("action", j["new_form_action"]);
                }
            }
            var msg = {
                "add": "記錄已新增",
                "edit": "記錄已儲存",
                "profile": "資料已更新",
                "data": "資料已更新",
                "config": "設定已變更",
                "undefined": "未定義的訊息"
            };
            var text = msg[j["response_method"]];
            if (typeof text === "undefined"){
                text = msg["undefined"];
            }
            if (j["response_info"] == "success"){
                if (save_with_exit){
                    save_with_exit = false;
                    setTimeout(backend.aside_iframe.closeUi(), 10);
                    backend.message.snackbar(text);
                }else{
                    show_message(text, 1800);
                }
                backend.ui.setUserInformation($("#name").val(), $("#avatar").val());
                if (j["response_method"] == "add" || j["response_method"] == "edit"){
                    backend.content_iframe.reload(true);
                }
            }else{
                backend.message.snackbar("表單欄位有誤");
            }
            clearTimeout(timeout_lock_saving);
            timeout_lock_saving = setTimeout(function(){
                is_saving = false;
            }, 3000);
        });
        $(".submit_and_exit").click(function(){
            save_with_exit = true;
            save_form();
        });
    }catch(e){
    }
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
            create_editor(id);
        }
    });

    $('#list-table').on('post-body.bs.table', function () {
        makeSortTable();
        makeListOp();
        checkNavItemAndShow();
        $(".sortable-list").removeClass("hidden");
        $(".fixed-table-loading").hide();
    }).bootstrapTable();

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
            backend.swal({
                title: "您確定要刪除此記錄嗎",
                text: "删除後后将無法恢複，請谨慎操作！",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "删除",
                cancelButtonText: "取消",
                showLoaderOnConfirm: true,
                closeOnConfirm: false
            }, function () {
                json(_url, null, function (data) {
                    swal("删除成功！", "您已经永久删除了此記錄。", "success");
                    location.reload();
                }, function (data) {
                    swal("删除失敗！", "刪除記錄時發生問題。", "error");
                })
            });
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
            if ($(this).attr("target") == "aside_iframe"){
                backend.aside_iframe.load($(this).attr("href"));
            }else{
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
    if ($(".filed-display-operations ul").data("done") == true){ return false;}
    $("input[data-field]").each(function () {
        var field_name = $(this).data("field");
        var field_texe = $(this).text();
        var field_val  = $(this).val();
        var is_checked = "checked" ? $(this).attr("checked"): "";
        if (field_name != 'is_enable' && field_name != 'record_buttons' && field_name != '') {
            $(".filed-display-operations ul").append(
                '<li><input type="checkbox" ' + is_checked + ' ' +
                'id="ro-field-' + field_name + '" ' +
                'value="' + field_val + '">' +
                '<label for="ro-field-' + field_name + '">' + $(this).parent().text() + '</label></li>'
            );
        }
    });
    $('.filed-display-operations ul input[type=checkbox]').change(function() {
        var id = $(this).attr("id").replace("ro-field-", "");
        var val = $(this).is(":checked");
        $("input[data-field='" + id + "']").click();
    });
    $(".filed-display-operations ul").attr("data-done", true);
}

