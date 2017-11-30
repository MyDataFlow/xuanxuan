import Events from './events';
import ExtsRuntime from 'ExtsRuntime';

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
} else {
    sayReady();
}

export default {
    ready,
};
