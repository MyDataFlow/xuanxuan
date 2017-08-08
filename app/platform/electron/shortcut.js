import {remote} from 'electron';

let shortcuts = {};

/**
 * Unregister global hotkey
 * @param  {gui.Shortcut | string | object} hotkey
 * @return {void}
 */
const unregisterGlobalShortcut = (name) => {
    if(shortcuts[name]) {
        remomte.globalShortcut.unregister(shortcuts[name]);
        delete shortcuts[name];
    }
};

/**
 * Register global hotkey
 * @param  {object} option
 * @param  {string} name
 * @return {void}
 */
const registerGlobalShortcut = (name, accelerator, callback) => {
    unregisterGlobalShortcut(name);
    shortcuts[name] = accelerator;
    remomte.globalShortcut.register(accelerator, () => {
        if(DEBUG) console.log("%cGLOBAL KEY ACTIVE " + name + ': ' + accelerator, 'display: inline-block; font-size: 10px; color: #fff; border: 1px solid #673AB7; padding: 1px 5px; border-radius: 2px; background: #673AB7');
        callback();
    });
    if(DEBUG) console.log("%cGLOBAL KEY BIND " + name + ': ' + accelerator, 'display: inline-block; font-size: 10px; color: #673AB7; border: 1px solid #673AB7; padding: 1px 5px; border-radius: 2px');
};

/**
 * Check a shortcu whether is registered
 */
const isGlobalShortcutRegistered = (accelerator) => {
    return remomte.globalShortcut.isRegistered(accelerator);
};

export default {
    unregisterGlobalShortcut,
    registerGlobalShortcut,
    isGlobalShortcutRegistered
};
