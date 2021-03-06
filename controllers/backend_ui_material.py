#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2015/7/12.

from google.appengine.api.logservice import logservice
from google.appengine.ext import ndb
from argeweb import auth, add_authorizations
from argeweb import Controller, scaffold, route_menu, route_with, route, settings
from ..models.config_model import ConfigModel
from google.appengine.api import app_identity
from itertools import islice
import datetime
import logging
import time
import json
import os

backend_version = '0.1.12'


class BackendUiMaterial(Controller):
    class Meta:
        Model = ConfigModel

    class Scaffold:
        hidden_in_form = ['name', 'title', 'use']

    @route
    @route_menu(list_name=u'system', text=u'後台 Manifest 設定', sort=9952, group=u'系統設定')
    def admin_config(self):
        config_record = self.meta.Model.get_config()
        return scaffold.edit(self, config_record.key)

    @route
    def manifest_json(self):
        config_record = self.meta.Model.get_config()
        backend_title = (self.host_information.site_name is not None) and \
                        self.host_information.site_name or u'網站後台'
        return self.json({
            'name': backend_title,
            'short_name': backend_title,
            'start_url': config_record.start_url,
            'display': config_record.display,
            'background_color': config_record.background_color,
            'theme_color': config_record.theme_color,
            'icons': [
                {
                    'src': config_record.icon_128,
                    'sizes': '128x128',
                    'type': 'image/png'
                },
                {
                    'src': config_record.icon_256,
                    'sizes': '256x256',
                    'type': 'image/png'
                }
            ]
        })

    @route_with('/admin/')
    @route_with('/admin')
    @add_authorizations(auth.require_admin)
    def root(self):
        try:
            self.context['backend_title'] = (self.host_information.site_name is not None) and \
                            self.host_information.site_name or u'網站後台'
        except:
            self.context['backend_title'] = u'網站後台'

        dashboard_name = 'admin'
        if self.request.path.find('/admin') >= 0:
            dashboard_name = 'admin'

        self.context['dashboard_name'] = dashboard_name
        # self.context['controllers'] = controllers
        self.context['config'] = self.meta.Model.get_or_create_by_name('backend')
        self.context['menus'] = self.util.get_menu('backend')
        self.context['backend_version'] = backend_version
        self.context['application_user'] = self.application_user
        self.context['application_user_name'] = self.application_user.name

    @route
    @route_menu(list_name=u'backend', text=u'系統設定', sort=99998, need_hr_parent=True)
    def admin_system_menu(self):
        self.context['application_user'] = self.application_user
        self.context['menus'] = self.util.get_menu('system')

    @route
    def admin_super_user_menu(self):
        if self.application_user.name != 'super_user':
            self.abort(404)
        self.context['application_user'] = self.application_user
        self.context['menus'] = self.util.get_menu('super_user')

    def admin_list(self):
        return self.redirect(self.uri('admin:backend_ui_material:backend_ui_material:welcome'))

    @route_with('/admin/ndb')
    def admin_ndb_record(self):
        return self.json(self.params.get_ndb_record('target'))

    @route_with('/admin/welcome')
    def admin_welcome(self):
        self.context['menus'] = self.util.get_menu('welcome')
        try:
            self.context['backend_title'] = (self.host_information.site_name is not None) and \
                            self.host_information.site_name or u'網站後台'
        except:
            self.context['backend_title'] = u'網站後台'
        if self.host_information is not None:
            self.context['backend_title'] = self.host_information.site_name
            self.context['information'] = self.host_information
        self.context['backend_version'] = backend_version

    @route_with('/admin/jump_to_login')
    @route_with('/dashboard/jump_to_login')
    def jump_to_login(self):
        pass

    @route_with('/admin/login')
    def login(self):
        self.context['backend_title'] = u'網站後台'
        if self.host_information is not None:
            self.context['backend_title'] = self.host_information.site_name or u'網站後台'

    @route_with('/admin/login.json')
    @route_with('/dashboard/login.json')
    def login_json(self):
        self.meta.change_view('json')
        self.context['data'] = {
            'is_login': u'false'
        }
        if self.request.method != 'POST':
            return

        from plugins.application_user import get_user, has_record
        input_account = self.params.get_string('account').strip()
        input_password = self.params.get_string('password').strip()
        if input_account == u'' or input_password == u'':
            return

        self.logging.info(input_account + input_password)
        application_user = get_user(input_account, input_password)
        if application_user is None:
            if has_record():
                return
            else:
                self.host_information.theme = 'install'
                self.host_information.put()
                self.redirect('/admin/setup')
                return
        self.session['application_admin_user_key'] = application_user.key
        self.context['data'] = {
            'is_login': 'true'
        }

    @route_with('/admin/logout')
    def logout(self):
        self.session['application_admin_user_key'] = None
        self.session['application_admin_user_level'] = None
        return self.redirect('/admin/jump_to_login')

    @route_with('/admin/record/sort.json')
    @route_with('/dashboard/record/sort.json')
    def record_sort(self):
        node_list = self.params.get_list("node[]")
        str_key_list = self.params.get_list("rec[]")
        sort_list = sorted(node_list, reverse=True)
        j = 0
        s = ''
        record_list = []
        for item_key in str_key_list:
            item = self.params.get_ndb_record(item_key)
            item.sort = float(sort_list[j])
            record_list.append(item)
            j += 1
        ndb.put_multi(record_list)
        self.json({'action':'sort', 's': s})

    @route_with('/admin/page_init')
    def admin_page_init(self):
        pass

    @route_with('/auth_redirect')
    def auth_redirect(self):
        self.context['auth_redirect_to'] = self.params.get_string('to')

    @route_with('/sysinfo')
    def sysinfo(self):
        admin_key = None
        if 'application_admin_user_key' in self.session:
            admin_key = self.session['application_admin_user_key']
        self.json({
            'session': self.session,
            'application_admin_user_key': admin_key,
            'server_name': self.server_name,
            'namespace': self.namespace,
            'application_user': self.application_user,
            'prohibited_actions': self.prohibited_actions,
            'prohibited_controllers': self.prohibited_controllers,
            'plugins': self.host_information.plugins_list,
            'site_name': self.host_information.site_name,
            'theme': self.host_information.theme,
        })

    @route_with('/admin/record/update')
    def admin_record_update(self):
        self.meta.change_view('json')
        item = self.params.get_ndb_record('item')
        field = self.params.get_string('field')
        content = self.params.get_string('content')
        if item is None:
            self.context['data'] = {
                'info': 'none'
            }
            return
        if hasattr(item, field):
            setattr(item, field, content)
            item.put()
        self.context['data'] = {
            'info': 'save'
        }

    @route
    # @route_menu(list_name=u'system', group=u'系統設定', text=u'網域設定', sort=9999, icon=u'settings')
    def admin_set_domain(self):
        return 'set_domain'

    @route_with('/admin/log')
    def admin_log(self):
        def get_logs(offset=None, log_level=1):
            """ 依目前的時間取得記錄 """
            LOG_LEVELS = [
                logservice.LOG_LEVEL_DEBUG,
                logservice.LOG_LEVEL_INFO,
                logservice.LOG_LEVEL_WARNING,
                logservice.LOG_LEVEL_ERROR,
                logservice.LOG_LEVEL_CRITICAL
            ]
            end_time = time.time()
            return logservice.fetch(
                end_time=end_time,
                offset=offset,
                minimum_log_level=LOG_LEVELS[log_level],
                include_app_logs=True)

        def format_log_entry(entry):
            # Format any application logs that happened during this request.
            entry_logs = []
            for log in entry.app_logs:
                if log.level >= log_level:
                    log_message = log.message
                    if log.message.find('This request caused a new process to be started ') >= 0:
                        log_message = u"這個請求啟動了一個新的應用程式個體，需要加載程式，回應時間會稍久一些。"
                    log_message = log_message.replace(u'Static file referenced by handler not found', u'找不到相對應的靜態文件檔案')
                    entry_logs.append({
                        'level': log.level,
                        'type': log_message_level[log.level],
                        'message': log_message
                    })
            end_time = datetime.datetime.fromtimestamp(entry.end_time)
            end_time_ln = self.util.localize_time(end_time).split(' ')
            return {
                'date': end_time_ln[0],
                'time': end_time_ln[1],
                'ip': entry.ip,
                'method': entry.method,
                'resource': entry.resource,
                'logs': entry_logs
            }

        log_message_level = [
            '',
            'success',
            'warning',
            'danger',
            'danger'
        ]
        current_offset = self.params.get_string('offset')
        offset = self.params.get_base64('offset', None)
        log_level = self.params.get_integer('log_level', 1)
        size = self.params.get_integer('size', 10)

        # Get the logs given the specified offset.
        logs = get_logs(offset=offset, log_level=log_level)

        # Output the { size } logs.
        log = None
        log_list = []
        next_link = u''
        try:
            for log in islice(logs, size):
                log_list.append(format_log_entry(log))
                offset = log.offset
        except:
            pass
        if not log:
            next_link = ''

        # Add a link to view more log entries.
        elif offset:
            next_link = 'size=%s&log_level=%s&offset=%s' % (size, log_level,
                 format(self.util.encode_base64(offset)))

        self.context['log_list'] = log_list
        self.context['first_link'] = 'size=%s&log_level=%s' % (size, log_level)
        self.context['next_link'] = next_link
        self.context['this_link'] = 'size=%s&offset=%s' % (size, current_offset)

    @route_with('/admin/setup')
    def setup(self):
        if u'' + self.theme != u'install':
            return self.abort(404)
        self.context['server_name'] = self.server_name
        self.context['namespace'] = self.namespace
        themes_list = []
        themes_dir = None
        dirs = []
        try:
            themes_dir = os.path.abspath(
                os.path.join(os.path.dirname(__file__), '..', '..', '..', 'themes'))
            dirs = os.listdir(themes_dir)
        except:
            pass
        for dirPath in dirs:
            if dirPath.find('.') < 0:
                file_path = os.path.join(themes_dir, dirPath, 'theme.json')
                if os.path.exists(file_path):
                    f = open(file_path, 'r')
                    data = json.load(f)
                    themes_list.append({'theme_name': dirPath, 'theme_title': data['name'], 'author': data['author']})
        if len(themes_list) is 0:
            themes_list = [
                {'theme_name': 'default', 'theme_title': u'預設樣式' }
            ]
        self.context['themes_list'] = themes_list

    @route_with('/admin/setup_save')
    def setup_save(self):
        if self.theme != 'install':
            return self.abort(404)
        theme = self.params.get_string('theme')
        account = self.params.get_string('account')
        password = self.params.get_string('password')
        site_name = self.params.get_string('site_name')
        namespace = self.params.get_string('name_space')
        account_name = self.params.get_string('account_name', u'管理員')
        if u'' in [namespace, account, password, site_name, theme]:
            return self.redirect("/admin/setup?error=none")
        self.host_information.namespace = namespace
        self.host_information.site_name = site_name
        self.host_information.put()
        self.settings.set_theme(self.host_information.host, namespace, theme)
        from plugins.application_user import has_record
        if not has_record():
            self.fire('application_user_init', user_name=account_name, user_account=account, user_password=password)
        return self.redirect('/')

    @route
    def admin_model_suggestions(self):
        self.meta.change_view('json')
        model_ix = 'auto_ix_%s' % self.params.get_string('model')
        value_field_name = self.params.get_string('value_field_name', 'title')
        data_field_name = self.params.get_string('data_field_name', 'key')
        query = self.params.get_string('query', '')
        suggestions = []
        for item in self.components.search(model_ix, query=query):
            item_data = getattr(item, data_field_name)
            if data_field_name == 'key':
                item_data = self.util.encode_key(item_data)
            suggestions.append({
                'label': getattr(item, value_field_name),
                'data': item_data
            })
        self.context['data'] = {'suggestions': suggestions}

    @route
    def taskqueue_model_update(self):
        self.meta.change_view('json')
        from argeweb.core.model import DataUpdater, DataWatcher
        from google.appengine.datastore.datastore_query import Cursor
        updater = DataUpdater.query(DataUpdater.need_updater==True).get()
        if updater is None:
            self.context['data'] = {
                'update': 'done'
            }
            return
        setattr(updater, '__stop_update__', True)
        be_watcher = updater.updater.get()
        if be_watcher is None:
            updater.need_updater = False
            updater.put()
            self.context['data'] = {
                'update': 'be_watcher not exist'
            }
            return
        cursor = Cursor(urlsafe=updater.cursor)
        query = DataWatcher.query(DataWatcher.be_watcher == be_watcher.key)
        data, next_cursor, more = query.fetch_page(100, start_cursor=cursor)
        need_update_records = []
        last_item = None
        last_w = None
        for item in data:
            if last_item == item.watcher:
                w = last_w
            else:
                w = item.watcher.get()
                last_item = item.watcher
                last_w = w
                need_update_records.append(w)
            if w is not None:
                setattr(w, '__stop_update__', True)
                setattr(w, item.watcher_field, getattr(be_watcher, item.be_watcher_field))
            setattr(item, '__stop_update__', True)
            item.last_update = updater.last_update
        updater.cursor = next_cursor.urlsafe() if more else None
        updater.need_updater = more
        updater.put_async()
        ndb.put_multi_async(data)
        ndb.put_multi_async(need_update_records)
        self.context['data'] = {
            'update': updater.name
        }
        self.fire(
            event_name='create_taskqueue',
            url='/taskqueue/backend_ui_material/backend_ui_material/model_update'
        )
