import platform from './platform';
import server from './server';
import MemberProfileDialog from '../views/common/member-profile-dialog';
import Messager from '../components/messager';
import DateHelper from '../utils/date-helper';
import Lang from '../lang';

platform.onAppLinkClick('Member', target => {
    MemberProfileDialog.show(target);
});

server.onUserLogin(user => {
    if(user.signed && (user.isNeverLogined || !DateHelper.isToday(user.lastLoginTime))) {
        Messager.show(Lang.string('login.signed'), {
            type: 'success',
            icon: 'calendar-check',
            autoHide: true,
        })
    }
});

server.onUserLoginout((user, code, reason, unexpected) => {
    if(user && reason === 'KICKOFF') {
        Messager.show(Lang.error('KICKOFF'), {
            type: 'danger',
            icon: 'alert',
        });
    }
});

export default {

};
