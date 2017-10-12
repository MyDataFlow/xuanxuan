import Status from './status';
import timeSequence from './time-sequence';

const STATUS = new Status({
    wait: 0,
    pending: 1,
    paused: 2,
    done: 3,
    canceled: 4
}, 0);

class TaskQueue {

    constructor(tasks, onTask) {
        this._tasks = [];
        this._finished = [];
        this._status = STATUS.create();
        this._runId = 0;
        this._onTask = onTask;
        this._running = 0;
        this._timerId = null;

        if(tasks) {
            this.add(tasks);
        }

        this._status.onChange = (status, oldStatus) => {
            if(this._onStatusChange) {
                this._onStatusChange(status, oldStatus);
            }
        };
    }

    get onTask() {
        return this._onTask;
    }

    set onTask(callback) {
        this._onTask = callback;
    }

    get onStatusChange() {
        return this._onStatusChange;
    }

    set onStatusChange(callback) {
        this._onStatusChange = callback;
    }

    get runId() {
        return this._runId;
    }

    get taskCount() {
        return this._tasks.length;
    }

    get finishCount() {
        return this._finished.length;
    }

    get totalCount() {
        return this._tasks.length + this._finished.length;
    }

    get statusValue() {
        return this._status.value;
    }

    get statusName() {
        return this._status.name;
    }

    get isRunning() {
        return this._status.is(STATUS.pending);
    }

    get isPaused() {
        return this._status.is(STATUS.paused);
    }

    get percent() {
        return this.finishCount/this.totalCount;
    }

    add(...tasks) {
        for(let task of tasks) {
            if(Array.isArray(task)) {
                this.add(...task);
            } else {
                this._tasks.push(task);
            }
        }
    }

    cancel() {
        if(this.isRunning || this.isPaused) {
            this._status.change(STATUS.canceled);
            this._runId = 0;
        } else if(DEBUG) {
            console.error(`Cannot cancel a ${this.statusName} task.`, this);
        }
        return this;
    }

    runTask(task, ...params) {
        const result = task(...params);
        if(result instanceof Promise) {
            return result;
        } else {
            return Promise.resolve(result);
        }
    }

    next(runId, resolve, reject, ...params) {
        runTask(this._tasks[0], ...params).then(result => {
            if(runId === this._runId) {
                this._finished.push(this._tasks.shift());
                this._onTask && this._onTask(result, this.percent, runId);
                if(!this._tasks.length) {
                    this._status.change(STATUS.done);
                    resolve(this._finished.length);
                } else if(this.isRunning) {
                    if(result !== undefined) {
                        params.push(result);
                    }
                    this.next(runId, resolve, reject, ...params);
                }
            } else {
                reject('canceled');
            }
        }).catch(reject);
    }

    run(...params) {
        if(!this._tasks.length) {
            return Promise.resolve(0);
        }
        if(this._running || this.isRunning) {
            if(DEBUG) {
                console.error(`There has task running already.`, this);
            }
            return Promise.reject('There has task running already.');
        }
        return new Promise((resolve, reject) => {
            const runId = timeSequence();
            this._runId = runId;
            this.next(runId, resolve, reject, ...params);
        });
    }

    pause() {
        this._status.change(STATUS.paused);
    }

    reset() {
        this.cancel();
        this._status.change(STATUS.wait);
        this._tasks.push(...this._finished);
        this._finished = [];
        return this;
    }
}

export default TaskQueue;
