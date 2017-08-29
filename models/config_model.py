#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2015/7/12.

from argeweb import BasicModel
from argeweb import Fields


class ConfigModel(BasicModel):
    class Meta:
        tab_pages = [u'後台設定', u'Manifest 相關設定']

    name = Fields.StringProperty(verbose_name=u'識別名稱')
    style = Fields.StringProperty(default='material', verbose_name=u'後台樣式', choices=(
        'default', 'material'
    ))

    start_url = Fields.StringProperty(verbose_name=u'manifest start_url', default='/admin#/admin/welcome', tab_page=1)
    display = Fields.StringProperty(verbose_name=u'manifest display', default='fullscreen', tab_page=1)
    background_color = Fields.StringProperty(verbose_name=u'manifest background_color', default='#1C5D87', tab_page=1)
    theme_color = Fields.StringProperty(verbose_name=u'manifest theme_color', default='#1C5D87', tab_page=1)
    icon_128 = Fields.ImageProperty(verbose_name=u'manifest icon_128', default='', tab_page=1)
    icon_256 = Fields.ImageProperty(verbose_name=u'manifest icon_256', default='', tab_page=1)
