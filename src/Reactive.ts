import { clearSchedule, setSchedule } from "./schedule";
import { Utils } from "./Utils";

export type ReactiveGetter<T> = (currentValue: Readonly<T>) => void;
export type ReactiveWatcher<T> = (action: T) => void;
export type ReactiveMapper<T, U> = (originalValue: T) => U;

export abstract class Reactive<T, U> {

    constructor(initialValue: T) {
        this.current = initialValue;
        this._update = this._update.bind(this);
    }

    current: T;
    protected _getters = new Array<ReactiveGetter<T>>();
    protected _watchers = new Array<ReactiveWatcher<U>>();
    private _scheduleId: number | null = null;

    protected _setSchedule() {
        if (this._scheduleId) {
            clearSchedule(this._scheduleId);
        }
        this._scheduleId = setSchedule(this._update);
    }

    get(getter: ReactiveGetter<T>) {
        this._getters.push(getter);
        this._setSchedule();
        return this;
    }
    
    unget(getter: ReactiveGetter<T>) {
        const index = this._getters.indexOf(getter);
        if (~index) {
            Utils.removeIndex(this._watchers, index);
        }
        return this;
    }

    watch(watcher: ReactiveWatcher<U>) {
        this._watchers.push(watcher);
        return this;
    }

    unwatch(watcher: ReactiveWatcher<U>) {
        const index = this._watchers.indexOf(watcher);
        if (~index) {
            Utils.removeIndex(this._watchers, index);
        }
        return this;
    }

    abstract update(): void;

    private _update() {
        this._scheduleId = null;
        this.update();
        this._getters.length = 0;
    }

}
