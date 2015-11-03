#
# Project Kimchi
#
# Copyright IBM, Corp. 2015
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

import fs_utils

from wok.exception import NotFoundError, OperationFailed
from wok.exception import InvalidParameter, MissingParameter
from wok.utils import wok_log


class FileSystemsModel(object):
    """
    Model class for listing filesystems (df -hT) and mounting a filesystem
    """

    def create(self, params):

        if 'blk_dev' not in params:
            raise MissingParameter("GINFS00009E")

        blk_dev = params['blk_dev']

        if 'mount_point' not in params:
            raise MissingParameter("GINFS00010E")

        mount_point = params['mount_point']

        if 'persistent' not in params:
            raise MissingParameter("GINFS00011E")

        persistent = params['persistent']
        if type(persistent) != bool:
            if persistent == u'True':
                persistent = True
            elif persistent == u'False':
                persistent = False
            else:
                raise InvalidParameter("GINFS00014E")

        fs_utils._mount_a_blk_device(blk_dev, mount_point)
        if persistent:
            fs_utils.make_persist(blk_dev, mount_point)

        return mount_point

    def get_list(self):
        try:
            fs_names = fs_utils._get_fs_names()

        except OperationFailed as e:
            wok_log.error("Fetching list of filesystems failed")
            raise OperationFailed("GINFS00015E",
                                  {'err': e})

        return fs_names


class FileSystemModel(object):
    """
    Model for viewing and unmounting the filesystem
    """

    def lookup(self, name):
        try:
            return fs_utils._get_fs_info(name)

        except ValueError:
            wok_log.error("Filesystem %s"
                          " not found." % name)
            raise NotFoundError("GINFS00001E", {'name': name})

    def delete(self, name):
        try:
            fs_utils._umount_partition(name)
            fs_utils.remove_persist(name)
        except OperationFailed as e:
            wok_log.error("Unmounting filesystem %s"
                          " failed." % name)
            raise OperationFailed("GINFS00002E",
                                  {'err': e})
