#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2015/7/12.

from argeweb import BasicModel
from argeweb import Fields


class BackendConfigModel(BasicModel):
    name = Fields.StringProperty(verbose_name=u'識別名稱')
    start_url = Fields.StringProperty(verbose_name=u'start_url', default='/admin#/admin/welcome')
    display = Fields.StringProperty(verbose_name=u'display', default='fullscreen')
    background_color = Fields.StringProperty(verbose_name=u'background_color', default='#1C5D87')
    theme_color = Fields.StringProperty(verbose_name=u'theme_color', default='#1C5D87')
    icon_128 = Fields.ImageProperty(verbose_name=u'icon_128', default='')
    icon_256 = Fields.ImageProperty(verbose_name=u'icon_256', default='')

