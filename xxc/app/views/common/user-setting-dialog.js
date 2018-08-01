import React from 'react';
import Modal from '../../components/modal';
import Lang from '../../lang';
import App from '../../core';
import DEFAULT_USER_CONFIG from '../../core/profile/user-default-config';
import Messager from '../../components/messager';
import UserSetting from './user-setting';

const show = (callback) => {
    let userSetting = null;
    App.ui.disableGlobalShortcut();
    return Modal.show({
        title: Lang.string('common.setting'),
        id: 'app-user-setting-dialog',
        actions: [
            {
                type: 'submit',
                label: Lang.string('common.save'),
                click: () => {
                    if (userSetting) {
                        App.user.config.set(userSetting.getSettings());
                    }
                }
            }, {
                type: 'cancel',
            }, {
                type: 'secondary',
                className: 'text-danger pull-left',
                label: Lang.string('setting.btn.reset'),
                click: () => {
                    if (userSetting) {
                        userSetting.setSettings(DEFAULT_USER_CONFIG);
                        Messager.show(Lang.string('setting.message.reset'), {autoHide: true});
                    }
                    return false;
                }
            }
        ],
        onHidden: App.ui.enableGlobalShortcut,
        content: <UserSetting ref={e => {userSetting = e;}} settings={App.profile.userConfig.plain()} />
    }, callback);
};

export default {
    show,
};
