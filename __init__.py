#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2015/7/12.


plugins_helper = {
    'title': u'網站管理後台',
    'desc': u'Material 風格的響應式管理後台',
    'controllers': {
        'backend_ui_material': {
            'group': u'網站管理後台',
            'actions': [
                {'action': 'login_json', 'name': u'登入後台'},
                {'action': 'config', 'name': u'後台設定'},
                {'action': 'system_menu', 'name': u'系統設定'},
                {'action': 'super_user_menu', 'name': u'超級管理員'}
            ]
        }
    }
}