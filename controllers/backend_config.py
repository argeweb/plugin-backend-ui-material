#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2017/2/23.

from argeweb import Controller, scaffold, route_menu, Fields, route_with, route
from argeweb.components.pagination import Pagination
from argeweb.components.search import Search
from google.appengine.api import app_identity


class BackendConfig(Controller):
    class Meta:
        components = (scaffold.Scaffolding, Pagination, Search)

    class Scaffold:
        hidden_in_form = ('name', 'title', 'use')

    def admin_list(self):
        url = self.uri('admin:backend_ui_material:backend_config:config')
        return self.redirect(url)

    @route
    @route_menu(list_name=u'backend', icon='settings_applicationsgtfre ksgrjop]mrtflE:', text=u'後台設定', sort=9952, group=u'系統設定')
    def admin_config(self):
        self.context['application_id'] = app_identity.get_application_id()
        record = self.meta.Model.find_by_name(self.namespace)
        if record is None:
            record = self.meta.Model()
            record.name = self.namespace
            record.put()
        return scaffold.edit(self, record.key)

    @route
    def manifest_json(self):
        self.context['application_id'] = app_identity.get_application_id()
        record = self.meta.Model.find_by_name(self.namespace)
        backend_title = (self.host_information.site_name is not None) and \
                        self.host_information.site_name or u'網站後台'
        if record is None:
            record = self.meta.Model()
            record.name = self.namespace
            record.put()
        return self.json({
            'name': backend_title,
            'short_name': backend_title,
            'start_url': record.start_url,
            'display': record.display,
            'background_color': record.background_color,
            'theme_color': record.theme_color,
            'icons': [
                {
                    'src': record.icon_128,
                    'sizes': '128x128',
                    'type': 'image/png'
                },
                {
                    'src': record.icon_256,
                    'sizes': '256x256',
                    'type': 'image/png'
                }
            ]
        })