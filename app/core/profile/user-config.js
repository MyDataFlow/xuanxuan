import DEFAULT from './user-default-config';
import DelayAction from '../../utils/delay-action';

class UserConfig {
    static DEFAULT = DEFAULT;

    constructor(config) {
        if (config && config.version !== DEFAULT.version) {
            config = null;
        }
        this.$ = Object.assign({}, DEFAULT, config);

        this.changeAction = new DelayAction(() => {
            this.onChange(this.lastChange, this);
            this.lastChange = null;
        });
    }

    plain() {
        return Object.assign({}, this.$);
    }

    exportCloud() {
        const config = {};
        Object.keys(this.$).forEach(key => {
            if (key.indexOf('local.') !== 0) {
                config[key] = this.$[key];
            }
        });
        return config;
    }

    makeChange(change) {
        this.lastChange = Object.assign({}, this.lastChange, change);

        if (typeof this.onChange === 'function') {
            this.changeAction.do();
        }
        this.$.lastChangeTime = new Date().getTime();
    }

    get(key, defaultValue) {
        if (this.$) {
            const val = this.$[key];
            if (val !== undefined) {
                return val;
            }
        }
        if (defaultValue === undefined) {
            defaultValue = DEFAULT[key];
        }
        return defaultValue;
    }

    set(keyOrObj, value) {
        if (typeof keyOrObj === 'object') {
            Object.assign(this.$, keyOrObj);
            this.makeChange(keyOrObj);
        } else {
            this.$[keyOrObj] = value;
            this.makeChange({[keyOrObj]: value});
        }
    }

    reset(newConfig) {
        this.$ = Object.assign({}, DEFAULT, newConfig);
        this.makeChange(this.$);
    }

    get autoReconnect() {
        return this.get('user.autoReconnect');
    }

    set autoReconnect(flag) {
        return this.set('user.autoReconnect', flag);
    }

    get avatarPosition() {
        return this.get('ui.navbar.avatarPosition');
    }

    set avatarPosition(position) {
        return this.set('ui.navbar.avatarPosition', position);
    }

    get lastSaveTime() {
        return this.get('lastSaveTime');
    }

    set lastSaveTime(time) {
        if (time instanceof Date) {
            time = time.getTime();
        }
        return this.set('lastSaveTime', time);
    }

    get showMessageTip() {
        return this.get('ui.chat.showMessageTip');
    }

    set showMessageTip(flag) {
        return this.set('showMessageTip', flag);
    }

    get sendHDEmoticon() {
        return this.get('ui.chat.sendHDEmoticon');
    }

    set sendHDEmoticon(flag) {
        return this.set('sendHDEmoticon', flag);
    }

    isChatSidebarHidden(cgid, defaultValue) {
        return !!this.get(`ui.chat.hideSidebar.${cgid}`, defaultValue);
    }

    setChatSidebarHidden(cgid, flag) {
        return this.set(`ui.chat.hideSidebar.${cgid}`, flag);
    }

    get showMeOnMenu() {
        return !!this.get('ui.chat.menu.showMe');
    }

    set showMeOnMenu(flag) {
        return this.set('ui.chat.menu.showMe', flag);
    }

    get enableSearchInEmojionePicker() {
        return this.get('ui.chat.enableSearchInEmojionePicker');
    }

    set enableSearchInEmojionePicker(flag) {
        return this.set('ui.chat.enableSearchInEmojionePicker', flag);
    }

    get enableWindowNotification() {
        return this.get('ui.notify.enableWindowNotification');
    }

    set enableWindowNotification(flag) {
        return this.set('ui.notify.enableWindowNotification', flag);
    }

    get safeWindowNotification() {
        return this.get('ui.notify.safeWindowNotification');
    }

    set safeWindowNotification(flag) {
        return this.set('ui.notify.safeWindowNotification', flag);
    }

    get windowNotificationCondition() {
        return this.get('ui.notify.windowNotificationCondition');
    }

    set windowNotificationCondition(condition) {
        return this.set('ui.notify.windowNotificationCondition', condition);
    }

    get enableSound() {
        return this.get('ui.notify.enableSound');
    }

    set enableSound(flag) {
        return this.set('ui.notify.enableSound', flag);
    }

    get playSoundCondition() {
        return this.get('ui.notify.playSoundCondition');
    }

    set playSoundCondition(condition) {
        return this.set('ui.notify.playSoundCondition', condition);
    }

    get flashTrayIcon() {
        return this.get('ui.notify.flashTrayIcon');
    }

    set flashTrayIcon(flag) {
        return this.set('ui.notify.flashTrayIcon', flag);
    }

    get flashTrayIconCondition() {
        return this.get('ui.notify.flashTrayIconCondition');
    }

    set flashTrayIconCondition(condition) {
        return this.set('ui.notify.flashTrayIconCondition', condition);
    }

    get muteOnUserIsBusy() {
        return this.get('ui.notify.muteOnUserIsBusy');
    }

    set muteOnUserIsBusy(flag) {
        return this.set('ui.notify.muteOnUserIsBusy', flag);
    }

    get captureScreenHotkey() {
        return this.get('shortcut.captureScreen');
    }

    set captureScreenHotkey(shortcut) {
        return this.set('shortcut.captureScreen', shortcut);
    }

    get chatFontSize() {
        return this.get('ui.chat.fontSize');
    }

    set chatFontSize(fontSize) {
        return this.set('ui.chat.fontSize', fontSize);
    }

    get appCloseOption() {
        return this.get('ui.app.onClose');
    }

    set appCloseOption(option) {
        return this.set('ui.app.onClose', option);
    }

    get removeFromTaskbarOnHide() {
        return this.get('ui.app.removeFromTaskbarOnHide');
    }

    set removeFromTaskbarOnHide(flag) {
        return this.set('ui.app.removeFromTaskbarOnHide', flag);
    }

    get hideWindowOnBlur() {
        return this.get('ui.app.hideWindowOnBlur');
    }

    set hideWindowOnBlur(flag) {
        return this.set('ui.app.hideWindowOnBlur', flag);
    }

    get contactsGroupByType() {
        return this.get('ui.chat.contacts.groupBy');
    }

    set contactsGroupByType(type) {
        return this.set('ui.chat.contacts.groupBy', type);
    }

    get contactsOrderRole() {
        return this.get('ui.chat.contacts.order.role', {});
    }

    set contactsOrderRole(orders) {
        return this.set('ui.chat.contacts.order.role', orders);
    }

    get contactsCategories() {
        return this.get('ui.chat.contacts.categories', {});
    }

    set contactsCategories(orders) {
        return this.set('ui.chat.contacts.categories', orders);
    }

    get contactsOrderDept() {
        return this.get('ui.chat.contacts.order.dept', {});
    }

    set contactsOrderDept(orders) {
        return this.set('ui.chat.contacts.order.dept', orders);
    }

    get contactsDefaultCategoryName() {
        return this.get('ui.chat.contacts.category.default');
    }

    set contactsDefaultCategoryName(name) {
        return this.set('ui.chat.contacts.category.default', name);
    }

    get groupsCategories() {
        return this.get('ui.chat.groups.categories', {});
    }

    set groupsCategories(orders) {
        return this.set('ui.chat.groups.categories', orders);
    }

    get groupsDefaultCategoryName() {
        return this.get('ui.chat.groups.category.default');
    }

    set groupsDefaultCategoryName(name) {
        return this.set('ui.chat.groups.category.default', name);
    }
}

export default UserConfig;
