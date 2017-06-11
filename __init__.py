#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2015/7/12.


plugins_helper = {
    'title': u'Material Backend',
    'desc': u'Material 風格的響應式管理後台',
    'controllers': {
        'backend_ui_material': {
            'group': u'網站管理後台',
            'actions': [
                {'action': 'login_json', 'name': u'登入後台'},
            ]
        },
        'backend_config': {
            'group': u'後台設定',
            'actions': [
                {'action': 'config', 'name': u'後台設定'},
            ]
        }
    }
}