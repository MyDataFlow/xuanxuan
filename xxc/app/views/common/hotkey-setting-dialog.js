import React from 'react';
import Modal from '../../components/modal';
import HotkeyInputControl from '../../components/hotkey-input-control';
import App from '../../core';

const show = (title, defaultHotkey, onKeySelect, callback) => {
    let userHotKey = defaultHotkey;
    App.ui.disableGlobalShortcut();
    return Modal.show({
        title,
        onHidden: App.ui.enableGlobalShortcut,
        onSubmit: () => {
            if (userHotKey !== defaultHotkey && onKeySelect) {
                onKeySelect(userHotKey);
            }
        },
        content: <div>
            <HotkeyInputControl
                placeholder={defaultHotkey}
                onChange={key => {
                    userHotKey = key;
                }}
            />
        </div>
    }, callback);
};

export default {
    show,
};
