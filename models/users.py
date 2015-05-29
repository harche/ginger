#
# Project Ginger
#
# Copyright IBM, Corp. 2014
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

import crypt
import grp
import os
import pwd

import libuser

from wok.exception import OperationFailed
from wok.utils import wok_log


SUDOERS_FILE = '/etc/sudoers.d/%s_conf'
SUDOERS_LINE = '%s\tALL=(ALL)\tALL\n'


def get_groups():
    adm = libuser.admin()
    return adm.enumerateGroups()


def get_group_obj(groupname):
    adm = libuser.admin()
    return adm.lookupGroupByName(groupname)


def get_group_obj_by_gid(gid):
    adm = libuser.admin()
    return adm.lookupGroupById(gid)


def get_group_gid(groupname):
    adm = libuser.admin()
    gid = adm.lookupGroupByName(groupname).get('pw_gid')[0]
    return gid


def create_group(groupname):
    adm = libuser.admin()
    group = adm.lookupGroupByName(groupname)
    if not group:
        new_group = adm.initGroup(groupname)
        gid = new_group[libuser.GIDNUMBER]
        adm.addGroup(new_group)
        return gid[0]
    return group.get('pw_gid')[0]


def delete_group(groupname):
    adm = libuser.admin()
    group_obj = adm.lookupGroupById(
        int(get_group_gid(groupname))
    )

    if group_obj is None:
        wok_log.error('Could not delete group "%s"', groupname)
        raise OperationFailed('GINUSER0012E', {'group': groupname})

    if not adm.enumerateUsersByGroup(groupname):
        try:
            adm.deleteGroup(group_obj)
        except Exception as e:
            wok_log.error('Could not delete group "%s": %s', groupname, e)
            raise OperationFailed('GINUSER0012E', {'group': groupname})


def get_users_from_group(groupname):
    adm = libuser.admin()
    group_obj = adm.lookupGroupById(
        int(get_group_gid(groupname))
    )
    if group_obj is not None:
        return adm.enumerateUsersByGroup(groupname)
    return None


def get_users(exclude_system_users=True):
    if exclude_system_users:
        return [user.pw_name for user in pwd.getpwall()
                if user.pw_uid >= 1000]

    admin = libuser.admin()
    return admin.enumerateUsers()


def get_user_obj(username):
    adm = libuser.admin()
    return adm.lookupUserByName(username)


def create_user(name, plain_passwd, profile=None):
    adm = libuser.admin()
    user = adm.lookupUserByName(name)
    if user:
        msg = 'User/Login "%s" already in use' % name
        wok_log.error(msg)
        raise OperationFailed('GINUSER0008E', {'user': name})

    try:
        new_user = adm.initUser(name)
        if profile == "wokuser":
            new_user[libuser.LOGINSHELL] = '/sbin/nologin'
        adm.addUser(new_user)
        enc_pwd = crypt.crypt(plain_passwd)
        adm.setpassUser(new_user, enc_pwd, True)
    except Exception as e:
        wok_log.error('Could not create user %s', name, e)
        raise OperationFailed('GINUSER0009E', {'user': name})

    return new_user


def delete_user(username):
    adm = libuser.admin()
    user_obj = adm.lookupUserByName(username)

    if user_obj is None:
        wok_log.error('User "%s" does not exist', username)
        raise OperationFailed('GINUSER0011E', {'user': username})
    try:
        adm.deleteUser(user_obj, True, True)
    except Exception as e:
        wok_log.error('Could not delete user %s: %s', username, e)
        raise OperationFailed('GINUSER0010E', {'user': username})


def add_user_to_primary_group(username, groupname):
    user_obj = get_user_obj(username)
    user_obj[libuser.GIDNUMBER] = get_group_gid(groupname)


class UsersModel(object):
    """
    The model class for basic management of users in the host system
    """

    def create(self, params):
        username = params['name']
        passwd = params['password']
        profile = params['profile']
        groupname = params['group']

        create_user(username, passwd, profile=profile)
        create_group(groupname)
        add_user_to_primary_group(username, groupname)

        # Handle profiles
        if profile in ["virtuser", "admin"]:
            self._add_user_to_kvm_group(username)
        if profile == "admin":
            self._add_user_to_sudoers(username)

        return username

    def _add_user_to_sudoers(self, user):
        try:
            # Creates the file in /etc/sudoers.d with proper user permission
            with open(SUDOERS_FILE % user, 'w') as f:
                f.write(SUDOERS_LINE % user)
            os.chmod(SUDOERS_FILE % user, 0440)
        except Exception as e:
            UserModel().delete(user)
            wok_log.error('Could not add user %s to sudoers: %s',
                             user, e.message)
            raise OperationFailed('GINUSER0007E', {'user': user})

    def _add_user_to_kvm_group(self, user):
        # Add new user to KVM group
        adm = libuser.admin()
        kvmgrp = get_group_obj('kvm')
        kvmgrp.add('gr_mem', user)
        ret = adm.modifyGroup(kvmgrp)
        if ret != 1:
            UserModel().delete(user)
            msg = ('Could not add user %s to kvm group. Operation failed.'
                   % user)
            wok_log.error(msg)
            raise OperationFailed('GINUSER0006E', {'user': user})

    def get_list(self):
        return get_users()


class UserModel(object):
    def delete(self, user):
        user_obj = get_user_obj(user)
        group_obj = get_group_obj_by_gid(
            int(user_obj.get('pw_gid')[0])
        )

        delete_user(user)
        if group_obj is not None:
            groupname = group_obj.get('gr_name')[0]
            delete_group(groupname)

        self._delete_profile_settings(user)

    def lookup(self, user):
        try:
            user_info = pwd.getpwnam(user)
        except Exception:
            wok_log.error('User "%s" does not exist', user)
            raise OperationFailed('GINUSER0011E', {'user': user})

        return {"name": user,
                "uid": user_info.pw_uid,
                "gid": user_info.pw_gid,
                "group": grp.getgrgid(user_info.pw_gid).gr_name,
                "profile": self._get_user_profile(user)}

    def _get_user_profile(self, user):
        # ADMIN: Check /etc/sudoers.d
        if os.path.isfile(SUDOERS_FILE % user):
            return 'admin'
        # VIRTUSER: Check kvm group
        adm = libuser.admin()
        kvmgrp = adm.lookupGroupByName('kvm')
        if user in kvmgrp.get('gr_mem'):
            return 'virtuser'
        # KIMCHIUSER: If not any before
        return 'wokuser'

    def _delete_profile_settings(self, user):
        profile = self._get_user_profile(user)
        if profile == 'wokuser':
            return
        # Removing from sudoers
        elif profile == 'admin':
            f = SUDOERS_FILE % user
            try:
                os.unlink(f)
            except Exception as e:
                wok_log.error('Error removing file "%s": %s', f, e)

        # Finally remove from kvm group
        try:
            adm = libuser.admin()
            kvmgrp = adm.lookupGroupByName('kvm')
            # Remove all ocurrences
            members = set(kvmgrp.get('gr_mem')) - set([user])
            kvmgrp.set('gr_mem', list(members))
            adm.modifyGroup(kvmgrp)
        except Exception as e:
            wok_log.error('Error while removing user from kvm group: %s', e)
