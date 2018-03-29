import 'ion-sound';
import Config from 'Config';

const init = soundPath => {
    window.ion.sound({
        sounds: [
            {name: 'message'}
        ],
        multiplay: true,
        volume: 1,
        path: soundPath,
        preload: true,
    });
    if (DEBUG) {
        console.groupCollapsed('%cSOUND inited', 'display: inline-block; font-size: 10px; color: #689F38; background: #CCFF90; border: 1px solid #CCFF90; padding: 1px 5px; border-radius: 2px;');
        console.log('ion', window.ion);
        console.groupEnd();
    }
};

const play = sound => {
    window.ion.sound.play(typeof sound === 'string' ? sound : null);
};

init(Config.media['sound.path']);

export default {
    play
};
