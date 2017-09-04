class DelayAction {

    constructor(action, delay = 100, callback = null) {
        this.action = action;
        this.delay = delay;
        this.callback = callback;
    }

    do(...params) {
        if(this.actionCallTask) {
            clearTimeout(this.actionCallTask);
        }
        this.actionCallTask = setTimeout(() => {
            const actionResult = this.action(...params);
            this.actionCallTask = null;
            if(typeof this.callback === 'function') {
                this.callback(actionResult);
            }
        }, this.delay);
    }

    destroy() {
        clearTimeout(this.actionCallTask);
    }
}

export default DelayAction;
