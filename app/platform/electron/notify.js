import ui from './ui';
import remote from './remote';

const requestAttention = (attention = true) => {
    if(attention) {
        remote.call('dockBounce', 'informational');
    }
    ui.browserWindow.flashFrame(attention);
};

const setUnreadCount = (count, message) => {

};

export default {
    requestAttention
};
