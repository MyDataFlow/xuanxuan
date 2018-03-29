import React from 'react';
import Modal from '../../components/modal';
import HotkeyInputControl from '../../components/hotkey-input-control';

const show = (title, defaultHotkey, onKeySelect, callback) => {
    let userHotKey = defaultHotkey;
    return Modal.show({
        title,
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
