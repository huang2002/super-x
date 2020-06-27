import { clearSchedule, setSchedule } from "./schedule";
import { Utils } from "./Utils";

/**
 * Type of reactive getters/watchers/mappers
 */
export type ReactiveGetter<T> = (currentValue: Readonly<T>) => void;
export type ReactiveWatcher<T> = (action: T) => void;
export type ReactiveMapper<T, U> = (originalValue: T) => U;
/** dts2md break */
/**
 * Base class of reactive value
 */
export abstract class Reactive<T, U> {
    /** dts2md break */
    constructor(initialValue: T) {
        this.current = initialValue;
        this._update = this._update.bind(this);
    }
    /** dts2md break */
    /**
     * Current value
     */
    current: T;
    /** dts2md break */
    protected _getters = new Array<ReactiveGetter<T>>();
    protected _watchers = new Array<ReactiveWatcher<U>>();
    /** dts2md break */
    private _scheduleId: number | null = null;
    /** dts2md break */
    /**
     * Add `this._update` to schedule
     */
    protected _setSchedule() {
        if (this._scheduleId) {
            clearSchedule(this._scheduleId);
        }
        this._scheduleId = setSchedule(this._update);
    }
    /** dts2md break */
    /**
     * Get the latest value asynchronously by providing a callback
     */
    get(getter: ReactiveGetter<T>) {
        this._getters.push(getter);
        this._setSchedule();
        return this;
    }
    /** dts2md break */
    /**
     * Remove a previously registered getter
     */
    unget(getter: ReactiveGetter<T>) {
        const index = this._getters.indexOf(getter);
        if (~index) {
            Utils.removeIndex(this._watchers, index);
        }
        return this;
    }
    /** dts2md break */
    /**
     * Add a watcher that subscribes to the changes
     */
    watch(watcher: ReactiveWatcher<U>) {
        this._watchers.push(watcher);
        return this;
    }
    /** dts2md break */
    /**
     * Remove a previously registered watcher
     */
    unwatch(watcher: ReactiveWatcher<U>) {
        const index = this._watchers.indexOf(watcher);
        if (~index) {
            Utils.removeIndex(this._watchers, index);
        }
        return this;
    }
    /** dts2md break */
    /**
     * The updater that updates the value
     * and deals with getters and watchers
     */
    abstract update(): void;
    /** dts2md break */
    private _update() {
        this._scheduleId = null;
        this.update();
        this._getters.length = 0;
    }

}
