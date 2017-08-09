class DelayAction {

    constructor(action, delay = 100, callback = null) {
        this.action = action;
        this.delay = delay;
        this.callback = callback;
    }

    do() {
        if(this.actionCallTask) {
            clearTimeout(this.actionCallTask);
        }
        this.actionCallTask = setTimeout(() => {
            this.action();
            this.actionCallTask = null;
            if(typeof this.callback === 'function') {
                this.callback();
            }
        }, this.delay);
    }
}

export default DelayAction;
