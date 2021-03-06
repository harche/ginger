#
# Project Ginger
#
# Copyright IBM Corp, 2016
#
# This library is free software; you can redistribute it and/or
# modify it under the terms of the GNU Lesser General Public
# License as published by the Free Software Foundation; either
# version 2.1 of the License, or (at your option) any later version.
#
# This library is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
# Lesser General Public License for more details.
#
# You should have received a copy of the GNU Lesser General Public
# License along with this library; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301 USA

from wok.control.base import Collection, Resource
from wok.control.utils import UrlSubNode


SEP_REQUESTS = {
    'POST': {
        'start': "Start IBM Serviceable Event Provider (SEP)",
        'stop': "Stop IBM Serviceable Event Provider (SEP)",
    },
}

SUBSCRIBERS_REQUESTS = {
    'POST': {'default': "Subscribe '%(hostname)s' with IBM SEP"},
}

SUBSCRIPTION_REQUESTS = {
    'DELETE': {'default': "Unsubscribe '%(ident)s' with IBM SEP"},
    'PUT': {'default': "Update '%(ident)s' subscription with IBM SEP"},
}


@UrlSubNode('ibm_sep', True)
class Sep(Resource):
    def __init__(self, model):
        super(Sep, self).__init__(model)
        self.admin_methods = ['GET', 'POST']
        self.role_key = "administration"
        self.uri_fmt = "/ibm_sep/%s"
        self.start = self.generate_action_handler('start')
        self.stop = self.generate_action_handler('stop')
        self.subscribers = Subscribers(model)
        self.log_map = SEP_REQUESTS

    @property
    def data(self):
        return self.info


class Subscribers(Collection):
    def __init__(self, model):
        super(Subscribers, self).__init__(model)
        self.resource = Subscription
        self.admin_methods = ['GET', 'POST', 'PUT']
        self.update_params = ['hostname', 'port', 'community']
        self.uri_fmt = "/ibm_sep/subscribers/%s"
        self.log_map = SUBSCRIBERS_REQUESTS

    @property
    def data(self):
        return self.info


class Subscription(Resource):
    def __init__(self, model, ident):
        super(Subscription, self).__init__(model, ident)
        self.log_map = SUBSCRIPTION_REQUESTS

    @property
    def data(self):
        return self.info
