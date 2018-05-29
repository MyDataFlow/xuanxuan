import ui from './ui';
import remote from './remote';
import notification from '../common/notification';
import sound from '../common/sound';

const requestAttention = (attention = true) => {
    if (attention) {
        remote.call('dockBounce', 'informational');
    }
    ui.browserWindow.flashFrame(attention);
};

const setBadgeLabel = (label) => {
    if (label === false) {
        label = '';
    }
    ui.setBadgeLabel(label);
};

const updateTrayIcon = (title, flash = false) => {
    ui.setTrayTooltip(title);
    ui.flashTrayIcon(flash);
};

export default {
    requestAttention,
    setBadgeLabel,
    updateTrayIcon,
    showNotification: notification.show,
    playSound: sound.play,
};
