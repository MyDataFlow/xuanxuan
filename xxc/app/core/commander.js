

const context = {};
const commands = {};

export const setCommandContext = (data) => {
    if (data) {
        if (typeof data !== 'object') {
            data = {data};
        }
        Object.assign(context, data);
    }
};

export const getCommandContext = () => {
    return Object.assign({}, context);
};

export const execute = (commandName, ...params) => {
    const command = commands[commandName];
    if (command) {
        const commandContext = getCommandContext();
        const result = command.func(commandContext, ...params);

        if (DEBUG) {
            console.collapse('Command.execute', 'redBg', commandName, 'redPale');
            console.log('context', commandContext);
            console.log('command', command);
            console.log('params', params);
            console.log('result', result);
            console.groupEnd();
        }

        if (result instanceof Promise) {
            return result;
        } else if (result instanceof Error) {
            return Promise.reject(result);
        }
        return Promise.resolve(result);
    }
    return Promise.reject(`Unknown command '${command.name}'.`);
};

export const executeCommand = (commandText, commandContext) => {
    console.log('executeCommand', commandText);
    setCommandContext(commandContext);
    return execute(...commandText.split('/'));
};

export const registerCommand = (name, func) => {
    const command = typeof name === 'object' ? Object.assign({}, name) : {name};
    if (typeof func === 'function') {
        command.func = func;
    }
    commands[command.name] = command;
};

export const unregisterCommand = name => {
    delete commands[name];
};

export default {
    executeCommand,
    setCommandContext,
    registerCommand,
    unregisterCommand
};
