import Socket from './socket';
import clipboard from './clipboard';
import sound from '../common/sound'
import crypto from './crypto';
import EventEmitter from './event-emitter';
import env from './env';
import ui from './ui';
import notify from './notify';
import config from '../common/config'
import net from '../common/network';

const platform = {
    type: 'browser',
    Socket,
    clipboard,
    crypto,
    EventEmitter,
    env,
    ui,
    notify,
    config,
    sound,
    net,
};

if(DEBUG) {
    global.$.Platform = platform;
}

export default platform;
