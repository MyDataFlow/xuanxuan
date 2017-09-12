import Socket from './socket';
import clipboard from './clipboard';
import crypto from './crypto';
import EventEmitter from './event-emitter';
import env from './env';
import ui from './ui';

window.process = {type: 'renderer'};

export default {
    Socket,
    clipboard,
    crypto,
    EventEmitter,
    env,
    ui,
};
