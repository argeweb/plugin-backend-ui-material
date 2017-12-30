#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2015/7/12.

from argeweb.core.events import on


@on('create_taskqueue')
def create_taskqueue(controller, uri=None, params=None, url='', *args, **kwargs):
    from google.appengine.api import taskqueue
    if (url is None or url == '') and uri is not None:
        try:
            url = controller.uri(uri)
            controller.logging.debug(url)
        except Exception as e:
            controller.logging.debug(e)
            return None
    if params is None:
        params = {}
    if url != '':
        return taskqueue.add(url=url, params=params)


plugins_helper = {
    'title': u'網站管理後台',
    'desc': u'Material 風格的響應式管理後台',
    'controllers': {
        'backend_ui_material': {
            'group': u'網站管理後台',
            'actions': [
                {'action': 'root', 'name': u'登入後台'},
                {'action': 'config', 'name': u'後台設定'},
                {'action': 'system_menu', 'name': u'系統設定'},
                {'action': 'super_user_menu', 'name': u'超級管理員'}
            ]
        }
    }
}