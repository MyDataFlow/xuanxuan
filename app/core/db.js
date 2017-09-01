import Platfrom, {Database} from 'Platform';
import profile from './profile';

let db = null;

profile.onSwapUser(user => {
    db = Database.create(user.identify);
});


export default {
    get database() {
        return db;
    }
};
