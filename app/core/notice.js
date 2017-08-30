import Events from './events';

const DEFAULT = {
    chats: 0,
};

const EVENT = {
    change: 'notice.change'
};

const onNoticeChange = listener => {
    return Events.on(EVENT.change, listener);
};

const emit = (info) => {
    Events.emit(EVENT.change, Object.assign({}, DEFAULT, info));
};

export default {
    onNoticeChange,
    emit
};
