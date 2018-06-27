import Platform from 'Platform';
import ContextMenu from '../components/context-menu';
import timeSquence from '../utils/time-sequence';
import Lang from '../lang';
import {isWebUrl} from '../utils/html-helper';

// Store all inner creators
const contextMenuCreators = {};

const tryAddDividerItem  = items => {
    if (items.length && items[items.length - 1] !== 'divider') {
        items.push('divider');
    }
    return items;
};

const getMenuItemsFromCreator = (creator, context) => {
    const menuItems = creator.items || [];
    if (creator.create) {
        const newItems = creator.create(context);
        if (newItems && newItems.length) {
            menuItems.push(...newItems);
        }
    }
    return menuItems;
};

const getInnerMenuItemsForContext = (contextName, context) => {
    const items = [];
    Object.keys(contextMenuCreators).forEach(creatorId => {
        const creator = contextMenuCreators[creatorId];
        if (isCreatorMatch(creator, contextName)) {
            const newItems = getMenuItemsFromCreator(creator, context);
            if (newItems.length) {
                tryAddDividerItem(items).push(...newItems);
            }
        }
    });
    return items;
};

export const addContextMenuCreator = (creator, createFunc) => {
    if (Array.isArray(creator)) {
        return creator.map(c => addContextMenuCreator(c));
    }
    if (typeof creator === 'string' || creator instanceof Set) {
        creator = {match: creator};
    }
    if (typeof createFunc === 'function') {
        creator.create = createFunc;
    } else if (typeof createFunc === 'array') {
        creator.items = createFunc;
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
    if (!event) {
        throw new Error('Context and context.event must be set.');
    }

    const items = [];

    // Get context menu items for link target element
    let linkItemsCount = 0;
    if (options && options.linkTarget && event.target.tagName === 'A' && contextName !== 'link') {
        const linkItems = getInnerMenuItemsForContext('link', context);
        if (linkItems && linkItems.length) {
            linkItemsCount = linkItems.length;
            items.push(...linkItems);
        }
    }

    // Get context menu items from inner creators
    const innerItems = getInnerMenuItemsForContext(contextName, context);
    if (innerItems && innerItems.length) {
        tryAddDividerItem(items).push(...innerItems);
    }

    // Get context menu items from extension creators
    if (global.ExtsRuntime && (!options || options.exts !== false)) {
        global.ExtsRuntime.exts.forEach(ext => {
            const extCreators = ext.getContextMenuCreators(context);
            if (extCreators && extCreators.length) {
                const extItems = [];
                extCreators.forEach(creator => {
                    if (isCreatorMatch(creator, contextName)) {
                        const newItems = getMenuItemsFromCreator(creator, context);
                        if (newItems.length) {
                            extItems.push(...newItems);
                        }
                    }
                });
                if (extItems.length) {
                    tryAddDividerItem(items);
                    extItems.forEach(extItem => {
                        items.push(ext.formatContextMenuItem(extItem));
                    });
                }
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
            if (linkItemsCount < 3) {
                textSelectItems.push({
                    label: Lang.format('menu.copy.format', selectedText),
                    click: Platform.ui.copySelectText
                });
            }
        }
    }
    if (options && options.selectAll && Platform.ui.selectAllText) {
        textSelectItems.push({
            label: Lang.string('menu.selectAll'),
            icon: 'mdi-select-all',
            click: Platform.ui.selectAllText
        });
    }
    if (textSelectItems.length) {
        tryAddDividerItem(items).push(...textSelectItems);
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
        if (options) {
            delete options.selectAll;
            delete options.copy;
            delete options.preventDefault;
            delete options.stopPropagation;
            delete options.linkTarget;
        }
        return ContextMenu.show({x: event.clientX, y: event.clientY}, items, options, callback);
    }
    return false;
};

addContextMenuCreator('link', context => {
    const {event} = context;
    const link = event.target.href;
    if (isWebUrl(link)) {
        let linkText = document.getSelection().toString().trim();
        if (linkText === '') {
            linkText = event.target.innerText || (event.target.attributes.title ? event.target.attributes.title.value : '');
        }
        const items = [{
            label: Lang.string('common.openLink'),
            click: () => {
                Platform.ui.openExternal(link);
            },
            icon: 'mdi-open-in-new'
        }];
        if (Platform.clipboard && Platform.clipboard.writeText) {
            items.push({
                label: Lang.string('common.copyLink'),
                click: () => {
                    Platform.clipboard.writeText(link);
                }
            });

            if (linkText && linkText !== link && `${linkText}/` !== link) {
                items.push({
                    label: Lang.format('common.copyFormat', linkText.length > 25 ? `${linkText.substr(0, 25)}…` : linkText),
                    click: () => {
                        Platform.clipboard.writeText(linkText);
                    }
                });
            }
        }
        return items;
    }
});
