#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Created with YooLiang Technology (侑良科技).
# Author: Qi-Liang Wen (温啓良）
# Web: http://www.yooliang.com/
# Date: 2015/7/12.

from google.appengine.api.logservice import logservice
from google.appengine.ext import ndb
from google.appengine.api import namespace_manager
from google.appengine.api import memcache
from argeweb import Controller, route, route_with, controllers, settings
from argeweb import auth, add_authorizations
from argeweb.core import time_util
from itertools import islice
from textwrap import dedent
import datetime
import logging
import time
import json
import os
from plugins.web_information.models.web_information_model import WebInformationModel


backend_version = "0.0.12"


class BackendUiMaterial(Controller):
    class Meta:
        components = ()

    @route_with("/admin/")
    @route_with("/admin")
    @add_authorizations(auth.require_admin)
    def root(self):
        self.context["now"] = datetime.datetime.now()
        self.context["dashboard_name"] = "admin"
        try:
            self.context["backend_title"] = self.host_info.site_name
            if self.context["backend_title"] is None:
                self.context["backend_title"] = u"網站後台"
        except:
            self.context["backend_title"] = u"網站後台"
        try:
            self.context["backend_title_short"] = settings.get("application").get("short_name")
            if self.context["backend_title_short"] is None:
                self.context["backend_title_short"] = self.context["backend_title"][:2]
        except:
            self.context["backend_title_short"] = self.context["backend_title"][:2]

        if self.request.path.find("/admin") >= 0 and self.application_user.role.get().level >= 999:
            menus = self.util.get_menu("backend")
        else:
            menus = self.util.get_menu("dashboard")

        self.context["controllers"] = controllers
        self.context["menus"] = menus
        self.context["backend_version"] = backend_version
        self.context["application_user_name"] = self.application_user.name
        namespace_manager.set_namespace("shared.information")
        self.context["information"] = WebInformationModel.get_by_name(self.host_info.host)
        namespace_manager.set_namespace(self.host_info.namespace)

    @route_with("/admin/setup")
    def setup(self):
        if self.theme != "install" and self.theme != u"install":
            return self.abort(404)
        self.context["server_name"] = self.server_name
        self.context["namespace"] = self.namespace
        themes_list = []
        dir_themes = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'templates', 'themes'))
        # TODO：　如果　dir_themes (/templates/themes/)　不存在引起的錯話
        for dirPath in os.listdir(dir_themes):
            if dirPath.find(".") < 0:
                file_path = os.path.join(dir_themes, dirPath, "theme.json")
                if os.path.exists(file_path):
                    f = open(file_path, 'r')
                    data = json.load(f)
                    themes_list.append({"theme_name": dirPath, "theme_title": data["name"]})
        self.context["themes_list"] = themes_list

    @route_with("/admin/setup_save")
    def setup_save(self):
        if self.theme != "install":
            return self.abort(404)
        namespace = self.params.get_string("name_space")
        account_name = self.params.get_string("account_name")
        account = self.params.get_string("account")
        password = self.params.get_string("password")
        site_name = self.params.get_string("site_name")
        theme = self.params.get_string("theme")
        if u"" in [namespace, account, password, site_name, theme]:
            return self.redirect(u"/admin/setup?error=none")
        self.host_info.namespace = namespace
        self.host_info.site_name = site_name
        self.host_info.put()
        from plugins.application_user import application_user_init, has_record
        prohibited_actions = settings.get("application_user_prohibited_actions", u"")

        if not has_record():
            application_user_init(account_name, account, password, prohibited_actions,
                                 "/plugins/backend_ui_material/static/img/profile_small.jpg")
        self.settings.set_theme(self.host_info.host, namespace, theme)
        return self.redirect("/")

    @route_with("/admin/application_user_init")
    def application_user_init(self):
        prohibited_actions = settings.get("application_user_prohibited_actions", u"")
        from plugins.application_user import application_user_init, has_record
        application_user_init(u"管理員", "admin", "qwER12#$", prohibited_actions,
                             "/plugins/backend_ui_material/static/img/profile_small.jpg")
        return self.redirect("/")

    @route_with("/admin/welcome")
    def admin_welcome(self):
        try:
            self.context["backend_title"] = self.host_info.site_name
            if self.context["backend_title"] is None:
                self.context["backend_title"] = u"網站後台"
        except:
            self.context["backend_title"] = u"網站後台"
        self.context["backend_version"] = backend_version
        namespace_manager.set_namespace("shared.information")
        self.context["information"] = WebInformationModel.get_by_name(self.host_info.host)
        namespace_manager.set_namespace(self.host_info.namespace)

    @route_with("/admin/aa")
    def admin_aa(self):
        self.session["advanced_admin"] = True
        return self.redirect("/admin")

    @route_with("/admin/jump_to_login")
    @route_with("/dashboard/jump_to_login")
    def jump_to_login(self):
        pass

    @route_with("/admin/login")
    def login(self):
        try:
            self.context["backend_title"] = self.host_info.site_name
            if self.context["backend_title"] is None:
                self.context["backend_title"] = u"網站後台"
        except:
            self.context["backend_title"] = u"網站後台"

    @route_with("/admin/login.json")
    @route_with("/dashboard/login.json")
    def login_json(self):
        self.meta.change_view('json')
        self.context['data'] = {
            'is_login': u'false'
        }
        if self.request.method != "POST":
            return
        from plugins.application_user import login, has_record, application_user_init
        input_account = self.params.get_string("account")
        input_password = self.params.get_string("password")
        application_user = login(input_account, input_password)
        if application_user is None:
            if has_record():
                return
        self.session["application_user_key"] = application_user.key
        self.context['data'] = {
            'is_login': 'true'
        }

    @route_with("/admin/logout")
    def logout(self):
        self.session["already_login"] = False
        self.session["application_user_key"] = None
        self.session["application_user_level"] = None
        return self.redirect("/admin")

    @route_with("/admin/record/sort.json")
    @route_with("/dashboard/record/sort.json")
    def record_sort(self):
        node_list = self.params.get_list("node[]")
        str_key_list = self.params.get_list("rec[]")
        sort_list = sorted(node_list, reverse=True)
        j = 0
        s = ""
        record_list = []
        for item_key in str_key_list:
            item = self.util.decode_key(item_key).get()
            item.sort = float(sort_list[j])
            record_list.append(item)
            j += 1
        ndb.put_multi(record_list)
        self.json({"action":"sort", "s": s})

    @route_with("/admin/page_init")
    def admin_page_init(self):
        pass

    @route_with("/auth_redirect")
    def auth_redirect(self):
        self.context["auth_redirect_to"] = self.params.get_string("to")

    @route_with("/admin/log")
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
                    log_message = log_message.replace(u"Static file referenced by handler not found", u"找不到相對應的靜態文件檔案")
                    entry_logs.append({
                        "level": log.level,
                        "type": log_message_level[log.level],
                        "message": log_message
                    })
            end_time = datetime.datetime.fromtimestamp(entry.end_time)
            end_time_ln = self.util.localize_time(end_time).split(" ")
            return {
                "date": end_time_ln[0],
                "time": end_time_ln[1],
                "ip": entry.ip,
                "method": entry.method,
                "resource": entry.resource,
                "logs": entry_logs
            }

        log_message_level = [
            "",
            "success",
            "warning",
            "danger",
            "danger"
        ]
        current_offset = self.params.get_string("offset")
        offset = self.params.get_base64("offset", None)
        log_level = self.params.get_integer("log_level", 1)
        size = self.params.get_integer("size", 10)

        # Get the logs given the specified offset.
        logs = get_logs(offset=offset, log_level=log_level)

        # Output the { size } logs.
        log = None
        log_list = []
        next_link = u""
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

        self.context["log_list"] = log_list
        self.context["first_link"] = 'size=%s&log_level=%s' % (size, log_level)
        self.context["next_link"] = next_link
        self.context["this_link"] = 'size=%s&offset=%s' % (size, current_offset)

    @route_with('/admin/backend_ui_material/plugins_check')
    def admin_plugins_check(self):
        self.meta.change_view('jsonp')
        self.context['data'] = {
            'status': "enable"
        }