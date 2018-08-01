import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Platform from 'Platform';
import Config from 'Config';
import {classes} from '../../utils/html-helper';
import {formatKeyDecoration} from '../../utils/shortcut';
import HotkeyInputControl from '../../components/hotkey-input-control';
import Lang from '../../lang';
import Checkbox from '../../components/checkbox';
import SelectBox from '../../components/select-box';
import timeSequence from '../../utils/time-sequence';

const isBrowser = Platform.type === 'browser';

const isNotificationOff = state => {
    return !state['ui.notify.enableSound'];
};
const isFlashTrayIconOff = state => {
    return isBrowser || !state['ui.notify.flashTrayIcon'];
};
const isWindowNotificationOff = state => {
    return !state['ui.notify.enableWindowNotification'];
};

const configs = [
    {
        name: 'chats',
        title: Lang.string('setting.section.chats'),
        items: [
            {
                type: 'boolean',
                name: 'ui.chat.sendHDEmoticon',
                caption: Lang.string('setting.chats.sendHDEmoticon')
            }, {
                type: 'boolean',
                name: 'ui.chat.showMessageTip',
                caption: Lang.string('setting.chats.showMessageTip')
            }, {
                type: 'boolean',
                name: 'ui.chat.enableSearchInEmojionePicker',
                caption: Lang.string('setting.chats.enableSearchInEmojionePicker')
            }, {
                type: 'boolean',
                name: 'ui.chat.enableAnimate',
                caption: Lang.string('setting.chats.enableAnimate'),
                hidden: 'TODO: chats animate is not ready in current version.'
            }, {
                type: 'boolean',
                name: 'ui.chat.listenClipboardImage',
                caption: Lang.string('setting.chats.listenClipboardImage'),
                hidden: isBrowser
            }
        ]
    }, {
        name: 'notification',
        title: Lang.string('setting.section.notification'),
        items: [
            {
                type: 'boolean',
                name: 'ui.notify.enableSound',
                caption: Lang.string('setting.notification.enableSoundNotification')
            }, {
                type: 'select',
                name: 'ui.notify.playSoundCondition',
                className: 'level-2',
                options: [
                    {value: '', label: Lang.string('setting.notification.onNeed')},
                    {value: 'onWindowBlur', label: Lang.string('setting.notification.onWindowBlur')},
                    {value: 'onWindowHide', label: Lang.string('setting.notification.onWindowHide')},
                ],
                hidden: isNotificationOff,
                caption: Lang.string('setting.notification.playSoundCondition')
            }, {
                type: 'boolean',
                className: 'level-2',
                name: 'ui.notify.muteOnUserIsBusy',
                hidden: isNotificationOff,
                caption: Lang.string('setting.notification.muteOnUserIsBusy')
            }, {
                type: 'boolean',
                name: 'ui.notify.flashTrayIcon',
                hidden: isBrowser,
                caption: Lang.string('setting.notification.flashTrayIcon')
            }, {
                type: 'select',
                name: 'ui.notify.flashTrayIconCondition',
                className: 'level-2',
                options: [
                    {value: '', label: Lang.string('setting.notification.onNeed')},
                    {value: 'onWindowBlur', label: Lang.string('setting.notification.onWindowBlur')},
                    {value: 'onWindowHide', label: Lang.string('setting.notification.onWindowHide')},
                ],
                hidden: isFlashTrayIconOff,
                caption: Lang.string('setting.notification.flashTrayIconCondition')
            }, {
                type: 'boolean',
                name: 'ui.notify.enableWindowNotification',
                caption: Lang.string('setting.notification.enableWindowNotification')
            }, {
                type: 'select',
                name: 'ui.notify.windowNotificationCondition',
                className: 'level-2',
                options: [
                    {value: 'onWindowBlur', label: Lang.string('setting.notification.onWindowBlur')},
                    isBrowser ? null : {value: 'onWindowHide', label: Lang.string('setting.notification.onWindowHide')},
                ],
                hidden: isWindowNotificationOff,
                caption: Lang.string('setting.notification.windowNotificationCondition')
            }, {
                type: 'boolean',
                className: 'level-2',
                hidden: isWindowNotificationOff,
                name: 'ui.notify.safeWindowNotification',
                caption: Lang.string('setting.notification.safeWindowNotificationTip')
            }
        ]
    }, {
        name: 'navigation',
        title: Lang.string('setting.section.navigation'),
        items: [
            {
                type: 'boolean',
                name: 'ui.navbar.avatarPosition',
                caption: Lang.string('setting.navigation.showAvatarOnBottom'),
                getConverter: value => {
                    return value === 'bottom';
                },
                setConverter: value => {
                    return value ? 'bottom' : 'top';
                },
            }
        ]
    }, {
        name: 'windows',
        hidden: isBrowser,
        title: Lang.string('setting.section.windows'),
        items: [
            {
                type: 'boolean',
                name: 'ui.app.hideWindowOnBlur',
                caption: Lang.string('setting.windows.hideWindowOnBlur')
            }, {
                type: 'boolean',
                name: 'ui.app.removeFromTaskbarOnHide',
                caption: Lang.string('setting.windows.removeFromTaskbarOnHide')
            }, {
                type: 'select',
                name: 'ui.app.onClose',
                hidden: !Platform.ui.showQuitConfirmDialog,
                options: [
                    {value: 'ask', label: Lang.string('setting.windows.askEveryTime')},
                    {value: 'minimize', label: Lang.string('setting.windows.minimizeMainWindow')},
                    {value: 'close', label: Lang.string('setting.windows.quitApp')},
                ],
                caption: Lang.string('setting.windows.onClickCloseButton')
            }
        ]
    }, {
        name: 'hotkeys',
        hidden: isBrowser,
        title: Lang.string('setting.section.hotkeys'),
        items: [
            {
                type: 'select',
                name: 'shortcut.sendMessage',
                options: Config.ui['hotkey.sendMessageOptions'].map(formatKeyDecoration),
                caption: Lang.string('setting.hotkeys.sendMessage')
            }, {
                hidden: isBrowser,
                type: 'hotkey',
                name: 'shortcut.captureScreen',
                caption: Lang.string('setting.hotkeys.globalCaptureScreen')
            }, {
                type: 'hotkey',
                hidden: isBrowser,
                name: 'shortcut.focusWindow',
                caption: Lang.string('setting.hotkeys.globalFocusWindow')
            }
        ]
    }
];

class UserSetting extends Component {
    static propTypes = {
        settings: PropTypes.object.isRequired,
        className: PropTypes.string,
    };

    static defaultProps = {
        className: null,
    };

    constructor(props) {
        super(props);
        this.state = Object.assign({}, this.props.settings);
    }

    getSettings() {
        return this.state;
    }

    setSettings(settings) {
        this.setState(Object.assign({}, settings));
    }

    changeConfig(item, value) {
        const name = item.name;
        if (typeof value === 'object' && value.target) {
            if (value.target.type === 'checkbox') {
                value = value.target.checked;
            } else {
                value = value.target.value;
            }
        }
        if (item.setConverter) {
            value = item.setConverter(value);
        }
        this.setState({[name]: value});
    }

    renderConfigItem(item) {
        if (item.hidden) {
            let hidden = item.hidden;
            if (typeof item.hidden === 'function') {
                hidden = item.hidden(this.state);
            }
            if (hidden) {
                return null;
            }
        }
        switch (item.type) {
        case 'boolean':
            return this.renderBooleanItem(item);
        case 'select':
            return this.renderSelectItem(item);
        case 'hotkey':
            return this.renderHotkeyItem(item);
        }
        return null;
    }

    renderHotkeyItem(item) {
        let value = this.state[item.name];
        if (item.getConverter) {
            value = item.getConverter(value);
        }
        return <HotkeyInputControl key={item.name} defaultValue={value} labelStyle={{flex: 1}} onChange={this.changeConfig.bind(this, item)} label={item.caption} className={classes('flex', item.className)} />;
    }

    renderSelectItem(item) {
        let value = this.state[item.name];
        if (item.getConverter) {
            value = item.getConverter(value);
        }
        const controlId = `selectbox-${timeSequence()}`;
        return (<div className={classes('control flex', item.className)} key={item.name}>
            <label htmlFor={controlId} style={{flex: '1 1 0%'}}>{item.caption}</label>
            <SelectBox selectProps={{id: controlId}} value={value} options={item.options} onChange={this.changeConfig.bind(this, item)} selectClassName="rounded" />
        </div>);
    }

    renderBooleanItem(item) {
        let value = this.state[item.name];
        if (item.getConverter) {
            value = item.getConverter(value);
        }
        const checked = !!value;
        return (<div className={classes('control', item.className)} key={item.name}>
            <Checkbox checked={checked} label={item.caption} onChange={this.changeConfig.bind(this, item)} />
        </div>);
    }

    render() {
        const {
            settings,
            className,
            ...other
        } = this.props;

        return (<div
            {...other}
            className={classes('app-user-setting space', className)}
        >
            {
                configs.map(section => {
                    if (section.hidden) {
                        return null;
                    }
                    return (<section key={section.name} className={`space app-setting-group-${section.name}`}>
                        <header className="heading divider space-sm">
                            <strong className="title text-gray">{section.title}</strong>
                        </header>
                        <div className="items">
                            {
                                section.items.map(item => {
                                    return this.renderConfigItem(item);
                                })
                            }
                        </div>
                    </section>);
                })
            }
        </div>);
    }
}

export default UserSetting;
