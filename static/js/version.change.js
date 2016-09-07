

function makeItem(data){
    var vt = "v" + data.version.replace(/\./ig, "_");
    var strItem =
        '<div class="panel panel-default">' +
            '<div class="panel-heading">' +
                '<h5 class="panel-title">' +
                    '<a data-toggle="collapse" data-parent="#version" href="#' + vt + '">v' + data.version + ' ' + data.title + '</a>' +
                    '<code class="pull-right hidden-sm">' + data.date + '</code>' +
                '</h5>' +
            '</div>' +
            '<div id="' + vt + '" class="panel-collapse collapse">' +
                '<div class="panel-body">' +
                    '<ul>' +
                    '</ul>' +
                '</div>' +
            '</div>' +
        '</div>';
    var items = data.items;
    var $item = $(strItem);
    var $ul = $item.find("ul");
    for (var i=0;i<items.length;i++){
        $ul.append("<li>" + items[i] + "</li>");
    }
    $("#version").prepend($item);
    return vt;
}
$(function(){
    var lastItem = "";
    for (var i=0;i<version_data.length;i++){
        lastItem = makeItem(version_data[i]);
    }
    $("#" + lastItem).addClass("in");
});

var version_data = [{
    "version": "0.0.1",
    "date": "2016.06.17",
    "title": "基礎版本",
    "items": [
        "新增瀏覽歷史監聽，可以正常的使用上一頁，下一頁",
        "全頁面支援 Ctrl+P 列印、與 F5 重整畫面之快速鍵"
    ]
}, {
    "version": "0.0.2",
    "date": "2016.06.18",
    "title": "多語系",
    "items": [
        "多語系切換選單",
        "支援多語系欄位編輯",
        "列表頁面排版改善",
        "編輯頁面排版改善"
    ]
}, {
    "version": "0.0.3",
    "date": "2016.06.19",
    "title": "搜尋",
    "items": [
        "搜尋功能",
        "介面調整",
        "刪除記錄",
        "列表頁面刪除功能防止誤觸",
        "在特定 iframe 開啟內容"
    ]
}, {
    "version": "0.0.4",
    "date": "2016.06.20",
    "title": "排序",
    "items": [
        "列表頁拖曳排序",
        "上下排序按鈕",
        "短效通知訊息"
    ]
}, {
    "version": "0.0.5",
    "date": "2016.06.22",
    "title": "檔案上傳",
    "items": [
        "支援拖曳上傳",
        "上傳訊息通知",
        "半持久性訊息通知"
    ]
}, {
    "version": "0.0.6",
    "date": "2016.06.24",
    "title": "上傳優化",
    "items": [
        "檔案管理中心",
        "相冊介面",
        "後台版本記錄"
    ]
}, {
    "version": "0.0.7",
    "date": "2016.06.25",
    "title": "列表頁顯示欄位",
    "items": [
        "現在列表頁面可以自行選擇要顯示的欄位",
        "顯示的欄位會記錄於 cookie"
    ]
}, {
    "version": "0.0.8",
    "date": "2016.06.27",
    "title": "佈景主題",
    "items": [
        "支援多個佈景主題切換",
        "佈景快取緩存 10 秒"
    ]
}, {
    "version": "0.0.9",
    "date": "2016.06.30",
    "title": "套件與資料來源",
    "items": [
        "依照域名使用不同的資料 namespace",
        "依照域名使用不同的套件 plugins",
        "namespace 緩存時間為 1小時",
        "plugins 緩存時間為 10秒"
    ]
}, {
    "version": "0.0.10",
    "date": "2016.07.01",
    "title": "模組化",
    "items": [
        "套件支援模組化",
        "可以自由的決定是否啟用某套件",
        "優化 namespace, plugins 的緩存機制"
    ]
}, {
    "version": "0.0.11",
    "date": "2016.07.02",
    "title": "角色與權限",
    "items": [
        "強化後台帳戶權限",
        "新增後台帳戶角色",
        "可對特定角色進行權限管理",
        "不可修改權限等級比自已高的角色"
    ]
}, {
    "version": "0.0.12",
    "date": "2016.07.03",
    "title": "帳號管理強化",
    "items": [
        "在特定條件下才可進行編輯與刪除帳號",
        "不可刪除自已的帳號",
        "CSRF 機制"
    ]
}, {
    "version": "0.1.1",
    "date": "2016.08.22",
    "title": "換成 Material 樣式的版面",
    "items": [
        "移除不必要的依賴元件",
        "使用單一的 iframe",
        "效能優化",
    ]
}];