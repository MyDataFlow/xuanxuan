import App from '../../core';
import MemberProfileDialog from './member-profile-dialog';

const show = (callback) => {
    const user = App.profile.user;
    if (user) {
        return MemberProfileDialog.show(user, callback);
    } else if (callback) {
        callback(false);
    }
};

export default {
    show,
};
