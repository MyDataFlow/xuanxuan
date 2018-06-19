import ExtsRuntime from 'ExtsRuntime';
import Events from './events';

const EVENT = {
    ready: 'runtime.ready',
};

let isReadyed = false;

const ready = (listener) => {
    if (isReadyed) {
        listener();
    } else {
        Events.once(EVENT.ready, listener);
    }
};

const sayReady = () => {
    isReadyed = true;
    Events.emit(EVENT.ready);
};

if (ExtsRuntime) {
    setTimeout(() => {
        ExtsRuntime.loadModules();
        sayReady();
    }, 0);
    global.ExtsRuntime = ExtsRuntime;
} else {
    sayReady();
}

export default {
    ready,
};
