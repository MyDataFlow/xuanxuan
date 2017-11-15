import Events from './events';
import ExtsRuntime from '../exts/runtime';

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

setTimeout(() => {
    ExtsRuntime.loadModules();
    isReadyed = true;
    Events.emit(EVENT.ready);
}, 0);

export default {
    ready,
};
