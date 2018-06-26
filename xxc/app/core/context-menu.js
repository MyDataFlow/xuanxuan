import Platform from 'Platform';
import ContextMenu from '../components/context-menu';
import timeSquence from '../utils/time-sequence';
import Lang from '../lang';

// Store all inner creators
const contextMenuCreators = {};

export const addContextMenuCreator = (creator, createFunc) => {
    if (Array.isArray(creator)) {
        return creator.map(c => addContextMenuCreator(c));
    }
    if (typeof creator === 'string' || creator instanceof Set) {
        creator = {match: creator};
    }
    if (typeof createFunc === 'function') {
        creator.create = createFunc;
    }
    if (!creator.id) {
        creator.id = timeSquence();
    }
    if (typeof creator.match === 'string') {
        creator.match = creator.match.split(',');
    }
    if (Array.isArray(creator.match)) {
        creator.match = new Set(creator.match);
    }
    contextMenuCreators[creator.id] = creator;
    return creator.id;
};

export const removeContextMenuCreator = creatorId => {
    if (contextMenuCreators[creatorId]) {
        delete contextMenuCreators[creatorId];
        return true;
    }
    return false;
};

export const isCreatorMatch = (creator, contextName) => {
    if (typeof creator.match === 'string') {
        creator.match = creator.match.split(',');
    }
    if (Array.isArray(creator.match)) {
        creator.match = new Set(creator.match);
    }
    return creator.match && creator.match.has(contextName);
};

export const showContextMenu = (contextName, context) => {
    if (!context) {
        throw new Error('Context must be set.');
    }
    if (context instanceof Event) {
        context = {event: context};
    }
    const {event, options, callback} = context;
    const items = [];

    // Get context menu items from inner creators
    Object.keys(contextMenuCreators).forEach(creatorId => {
        const creator = contextMenuCreators[creatorId];
        console.log('creator', creator);
        if (isCreatorMatch(creator, contextName)) {
            const newItems = creator.create(context);
            if (newItems && newItems.length) {
                items.push(...newItems);
            }
        }
    });

    // Get context menu items from extension creators
    if (global.ExtsRuntime) {
        global.ExtsRuntime.exts.forEach(ext => {
            const extCreators = ext.contextMenuCreators;
            if (extCreators && extCreators.length) {
                extCreators.forEach(creator => {
                    if (isCreatorMatch(creator, contextName)) {
                        const newItems = creator.create(context);
                        if (newItems && newItems.length) {
                            items.push(...newItems);
                        }
                    }
                });
            }
        });
    }

    const textSelectItems = [];

    if (options && options.copy && Platform.ui.copySelectText) {
        let selectedText = document.getSelection().toString().trim();
        if (selectedText) {
            const newLinePos = selectedText.indexOf('\n');
            if (newLinePos > -1) selectedText = selectedText.substr(0, newLinePos);
            if (selectedText.length > 20) {
                selectedText = `${selectedText.substr(0, 20)}...`;
            }
            textSelectItems.push({
                label: Lang.format('menu.copy.format', selectedText),
                click: Platform.ui.copySelectText
            })
        }
    }
    if (options && options.selectAll && Platform.ui.selectAllText) {
        textSelectItems.push({
            label: Lang.string('menu.selectAll'),
            click: Platform.ui.selectAllText
        });
    }
    if (textSelectItems.length) {
        if (items.length) {
            items.push('divider');
        }
        items.push(...textSelectItems);
    }

    if (items.length) {
        if (event) {
            if ((!options || options.preventDefault !== false)) {
                event.preventDefault();
            }
            if ((!options || options.stopPropagation !== false)) {
                event.stopPropagation();
            }
        }
        return ContextMenu.show({x: event.clientX, y: event.clientY}, items, options, callback);
    }
    return false;
};
