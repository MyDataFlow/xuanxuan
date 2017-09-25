import Server from './server';
import MemberProfileDialog from '../views/common/member-profile-dialog';
import Messager from '../components/messager';
import DateHelper from '../utils/date-helper';
import Lang from '../lang';
import Platform from 'Platform';
import Events from './events';
import profile from './profile';

const EVENT = {
    app_link: 'app.link',
};

const onAppLinkClick = (type, listener) => {
    return Events.on(`${EVENT.app_link}.${type}`, listener);
};

const emitAppLinkClick = (type, target) => {
    return Events.emit(`${EVENT.app_link}.${type}`, target);
};

onAppLinkClick('Member', target => {
    MemberProfileDialog.show(target);
});

Server.onUserLogin(user => {
    if(user.signed && (user.isNeverLogined || !DateHelper.isToday(user.lastLoginTime))) {
        Messager.show(Lang.string('login.signed'), {
            type: 'success',
            icon: 'calendar-check',
            autoHide: true,
        })
    }
});

Server.onUserLoginout((user, code, reason, unexpected) => {
    if(user && reason === 'KICKOFF') {
        Messager.show(Lang.error('KICKOFF'), {
            type: 'danger',
            icon: 'alert',
        });
    }
});

if(Platform.ui.onRequestQuit) {
    Platform.ui.onRequestQuit(() => {
        const user = profile.user;
        if(user && !user.isUnverified) {
            const appCloseOption = user.config.appCloseOption;
            if(appCloseOption === 'minimize') {
                Platform.ui.hideWindow();
                return false;
            } else if(appCloseOption !== 'close' && Platform.ui.showQuitConfirmDialog) {
                Platform.ui.showQuitConfirmDialog((result, checked) => {
                    if(checked && result) {
                        user.config.appCloseOption = result;
                    }
                    if(result === 'close') {
                        Server.logout();
                    }
                    return result;
                });
                return false;
            }
        }
        Server.logout();
    });
}

let quit = null;
if(Platform.ui.quit) {
    quit = (delay = 1000, ignoreListener = true) => {
        if(ignoreListener) {
            Server.logout();
        }
        Platform.ui.quit(delay, ignoreListener);
    };
}

export default {
    get canQuit() {
        return !!Platform.ui.quit;
    },
    onAppLinkClick,
    emitAppLinkClick,
    quit,
};
