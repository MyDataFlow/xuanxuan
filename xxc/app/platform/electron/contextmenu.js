import {remote} from 'electron';
import ui from './ui';
import Lang from '../../lang';

const Menu = remote.Menu;

const createContextMenu = menu => {
    if (Array.isArray(menu) && !menu.popup) {
        menu = Menu.buildFromTemplate(menu);
    }
    return menu;
};

const popupContextMenu = (menu, x, y, browserWindow) => {
    if (typeof x === 'object') {
        y = x.clientY;
        x = x.clientX;
    }
    menu = createContextMenu(menu);
    menu.popup(browserWindow || ui.browserWindow, x, y);
};

const SELECT_MENU = [
    {role: 'copy', label: Lang.string('menu.copy')},
    {type: 'separator'},
    {role: 'selectall', label: Lang.string('menu.selectAll')}
];

const INPUT_MENU = [
    {role: 'undo', label: Lang.string('menu.undo')},
    {role: 'redo', label: Lang.string('menu.redo')},
    {type: 'separator'},
    {role: 'cut', label: Lang.string('menu.cut')},
    {role: 'copy', label: Lang.string('menu.copy')},
    {role: 'paste', label: Lang.string('menu.paste')},
    {type: 'separator'},
    {role: 'selectall', label: Lang.string('menu.selectAll')}
];

const showInputContextMenu = (windowObj, x, y) => {
    popupContextMenu(INPUT_MENU, x, y, windowObj);
};

const showSelectionContextMenu = (windowObj, x, y) => {
    popupContextMenu(SELECT_MENU, x, y, windowObj);
};

export default {
    createContextMenu,
    popupContextMenu,
    showSelectionContextMenu,
    showInputContextMenu
};
