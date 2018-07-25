import Config from 'Config';

/**
 * SocketMessage
 */
class SocketMessage {
    constructor(data) {
        Object.assign(this, {
            module: 'chat',
            v: Config.pkg.version
        }, data);
    }

    get pathname() {
        const pathnames = [this.module];
        if (this.method !== undefined) {
            pathnames.push(this.method);
        }
        return pathnames.join('/').toLowerCase();
    }

    /**
     * Stringify as json
     * @return {string}
     */
    get json() {
        return JSON.stringify(this);
    }

    /**
     * Check whether the socket message is success
     * @return {boolean}
     */
    get isSuccess() {
        return this.result === 'success' || (this.result === undefined);
    }

    /**
     * Create Scoket message from json string
     * @param  {string} json
     * @return {ScoketMessage}
     */
    static fromJSON(json) {
        try {
            if (Array.isArray(json)) {
                if (DEBUG) {
                    console.groupCollapsed('%cBuild socket message from buffer array.', 'display: inline-block; font-size: 10px; color: #673AB7; background: #D1C4E9; border: 1px solid #D1C4E9; padding: 1px 5px; border-radius: 2px;');
                    console.log('buffer', json);
                    console.groupEnd();
                }
                json = json.map(x => x.toString()).join('');
            }
            if (typeof json !== 'string') json = json.toString();
            json = json.trim();
            let lastCharCode;
            while (json.length && (json[json.length - 1] === '\n' || json.charCodeAt(json.length - 1) === 8)) {
                lastCharCode = json.length && json.charCodeAt(json.length - 1);
                json = json.substring(0, json.length - 1);
            }
            const firstEOF = json.indexOf('\n');
            if (firstEOF > 0 && firstEOF < json.length) {
                const objArray = [];
                json.split('\n').forEach(str => {
                    str = str.trim();
                    if (str.length && str.startsWith('{')) {
                        objArray.push(str);
                    }
                });
                json = (objArray.length > 1) ? (`[${objArray.join(',')}]`) : (objArray[0] || '');
                if (DEBUG) {
                    console.groupCollapsed('%cSocket message contains "\\n", make it as json array.', 'display: inline-block; font-size: 10px; color: #673AB7; background: #D1C4E9; border: 1px solid #D1C4E9; padding: 1px 5px; border-radius: 2px;');
                    console.log('json', json);
                    console.groupEnd();
                }
            }
            const data = JSON.parse(json);
            if (Array.isArray(data)) {
                const msgs = [];
                data.forEach(x => {
                    if (Array.isArray(x)) {
                        msgs.push(...x.map(y => new SocketMessage(y)));
                    } else {
                        msgs.push(new SocketMessage(x));
                    }
                });
                return msgs;
            }
            return new SocketMessage(data);
        } catch (error) {
            if (DEBUG) {
                console.groupCollapsed('%cError: SocketMessage from json', 'color:red', error);
                console.log('raw', json);
                console.log('raw string', json && json.toString());
                console.groupEnd();
            }
        }
    }

    static create(msg) {
        if (typeof msg === 'string') {
            msg = {method: msg};
        } else if (msg instanceof SocketMessage) {
            return msg;
        }
        return new SocketMessage(msg);
    }
}

export default SocketMessage;
