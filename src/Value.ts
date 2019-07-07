import { _removeIndex, _iterate, _toArray, _normalizeNodes } from "./utils";
import { _undefined, _document, _Object, _Array, _Promise, _Infinity } from "./references";
import { addSchedule, removeSchedule } from "./schedule";
import { toNode, replaceChildren } from "./element";

export type ValueListener<T = unknown> = (this: Value<T>, newValue: T, oldValue: T) => void;
export type ValueGetCallback<T = unknown> = (value: T) => void;
export type ValueSetCallback<T = unknown> = (oldValue: T) => T;
export type ValueDestroyCallback = () => void;
export type ValueComposer<T extends {} = any, U = unknown> = (this: void, arg: UnwrapValue<T>) => U;

export type WrapValue<T extends {} = any> = {
    [K in keyof T]: T[K] extends Value<any> ? T[K] : Value<T[K]>;
};

export type UnwrapValue<T = any> = {
    [K in keyof T]: T[K] extends Value<infer U> ? U : T[K];
};

export class Value<T = unknown> {

    static compare = _Object.is;

    static of<T>(initialValue: T) {
        return new this(initialValue);
    }

    static wrap<T extends {} = any>(values: T): WrapValue<T> {
        if (_Array.isArray(values)) {
            return values.map(
                value => (value && value._isXV) ? value : new this(value)
            ) as unknown as WrapValue<T>;
        } else {
            const result = {} as WrapValue<T>;
            _iterate(values as { [key: string]: any; }, (value, key) => {
                (result as any)[key] = (value && value._isXV) ? value : new this(value);
            });
            return result;
        }
    }

    static unwrap<T = any>(values: T) {
        if (_Array.isArray(values)) {
            return _Promise.all(values.map(
                value => (value && value._isXV) ? value.get() : value
            )) as unknown as Promise<UnwrapValue<T>>;
        } else {
            const result = {} as UnwrapValue<T>,
                promises = new Array<Promise<any>>();
            _iterate(values as { [key: string]: any; }, (value, key) => {
                if (value && value._isXV) {
                    promises.push((value as Value).get().then(value => {
                        (result as any)[key] = value;
                    }));
                } else {
                    (result as any)[key] = value;
                }
            });
            return _Promise.all(promises).then(() => result);
        }
    }

    static unwrapSync<T = any>(values: T): UnwrapValue<T> {
        if (_Array.isArray(values)) {
            return values.map(
                value => (value && value._isXV) ? value.getSync() : value
            ) as unknown as UnwrapValue<T>;
        } else {
            const result = {} as UnwrapValue<T>;
            _iterate(values as { [key: string]: any; }, (value, key) => {
                (result as any)[key] = (value && value._isXV) ? value.getSync() : value;
            });
            return result;
        }
    }

    static compose<T extends {} = any, U = unknown>(
        components: T, composer: ValueComposer<T, U>
    ) {
        return this.unwrap(components).then(currentValues => {
            const newValue = new Value<U>(
                composer.call(_undefined, currentValues)
            ), listener = () => {
                this.unwrap(components).then(newValues => {
                    newValue.set(() => composer.call(_undefined, newValues));
                });
            };
            const componentArray = _Array.isArray(components) ? components : _Object.values(components),
                values = new Array<Value>();
            componentArray.forEach(component => {
                if (component && (component as any)._isXV) {
                    values.push(component as Value);
                    (component as Value)._listeners.push(listener);
                }
            });
            newValue.addDestroyCallback(() => {
                values.forEach(value => {
                    const { _listeners } = value;
                    _removeIndex(_listeners, _listeners.indexOf(listener));
                });
            });
            return newValue;
        });
    }

    static composeSync<T extends {} = any, U = unknown>(
        components: T, composer: ValueComposer<T, U>
    ) {
        const newValue = new Value<U>(
            composer.call(_undefined, this.unwrapSync(components))
        ), listener = () => {
            newValue.setSync(composer.call(_undefined, this.unwrapSync(components)));
        };
        const componentArray = _Array.isArray(components) ? components : _Object.values(components),
            values = new Array<Value>();
        componentArray.forEach(component => {
            if (component && (component as any)._isXV) {
                values.push(component as Value);
                (component as Value)._listeners.push(listener);
            }
        });
        newValue.addDestroyCallback(() => {
            values.forEach(value => {
                const { _listeners } = value;
                _removeIndex(_listeners, _listeners.indexOf(listener));
            });
        });
        return newValue;
    }

    static join(components: any[], separator?: string) {
        return this.compose(components, fragments => fragments.join(separator || ''));
    }

    static joinSync(components: any[], separator?: string) {
        return this.composeSync(components, fragments => fragments.join(separator || ''));
    }

    static defaultNodeTransform(value: any) {
        return _Array.isArray(value) ? value.flat(_Infinity).map(toNode) : toNode(value);
    }

    constructor(initialValue: T) {
        this._current = initialValue;
        this.update = this.update.bind(this);
    }

    readonly active: boolean = true;
    protected readonly _isXV = true;
    private _current: T;
    private _getCallbacks = new Array<ValueGetCallback<T>>();
    private _setCallbacks = new Array<ValueSetCallback<T>>();
    private _forceAsync = false;
    private _listeners = new Array<ValueListener<T>>();
    private _destroyCallbacks = new Array<ValueDestroyCallback>();

    destroy() {
        (this.active as boolean) = false;
        this._listeners.length = this._setCallbacks.length = 0;
        const { _getCallbacks } = this;
        if (_getCallbacks.length) {
            const { _current } = this;
            _getCallbacks.forEach(callback => {
                callback(_current);
            });
            _getCallbacks.length = 0;
        }
        const { _destroyCallbacks } = this;
        if (_destroyCallbacks.length) {
            _destroyCallbacks.forEach(listener => {
                listener();
            });
            _destroyCallbacks.length = 0;
        }
        removeSchedule(this.update);
        return this;
    }

    get() {
        return new _Promise<T>(resolve => {
            this._getCallbacks.push(resolve);
            addSchedule(this.update);
        });
    }

    getSync() {
        return this._current;
    }

    set(callback: ValueSetCallback<T>, force?: boolean) {
        this._setCallbacks.push(callback);
        if (force) {
            this._forceAsync = true;
        }
        addSchedule(this.update);
        return this;
    }

    setSync(newValue: T, force?: boolean) {
        if (this.active) {
            const { _current: oldValue } = this;
            this._current = newValue;
            if (force || !Value.compare(oldValue, newValue)) {
                this._listeners.forEach(listener => {
                    listener.call(this, newValue, oldValue);
                });
            }
            this._setCallbacks.length = 0;
            const { _getCallbacks } = this;
            if (_getCallbacks.length) {
                const { _current } = this;
                _getCallbacks.forEach(callback => {
                    callback(_current);
                });
                _getCallbacks.length = 0;
            }
            removeSchedule(this.update);
        }
        return this;
    }

    update() {
        const { _current: oldValue, _setCallbacks, _getCallbacks } = this,
            newValue = _setCallbacks.reduce((current, callback) => callback(current), oldValue);
        _setCallbacks.length = 0;
        this._current = newValue;
        _getCallbacks.forEach(callback => {
            callback(newValue);
        });
        _getCallbacks.length = 0;
        if (this._forceAsync || !Value.compare(oldValue, newValue)) {
            this._listeners.forEach(listener => {
                listener.call(this, newValue, oldValue);
            });
        }
        return this;
    }

    addListener(listener: ValueListener<T>) {
        this._listeners.push(listener);
        return this;
    }

    removeListener(listener: ValueListener<T>) {
        const { _listeners } = this,
            index = _listeners.indexOf(listener);
        if (~index) {
            _removeIndex(_listeners, index);
        }
        return this;
    }

    addDestroyCallback(callback: ValueDestroyCallback) {
        this._destroyCallbacks.push(callback);
        return this;
    }

    removeDestroyCallback(callback: ValueDestroyCallback) {
        const { _destroyCallbacks } = this,
            index = _destroyCallbacks.indexOf(callback);
        if (~index) {
            _removeIndex(_destroyCallbacks, index);
        }
        return this;
    }

    map<U = unknown>(callback: (this: this, value: T) => U) {
        return this.get().then(current => {
            const newValue = new Value<U>(callback.call(this, current)),
                listener = (value: T) => { newValue.set(() => callback.call(this, value)); },
                { _listeners } = this;
            if (this.active) {
                _listeners.push(listener);
                newValue.addDestroyCallback(() => {
                    _removeIndex(_listeners, _listeners.indexOf(listener));
                });
            }
            return newValue;
        });
    }

    mapSync<U = unknown>(callback: (this: this, value: T) => U) {
        const newValue = new Value<U>(callback.call(this, this._current)),
            listener = (value: T) => { newValue.setSync(callback.call(this, value)); },
            { _listeners } = this;
        if (this.active) {
            _listeners.push(listener);
            newValue.addDestroyCallback(() => {
                _removeIndex(_listeners, _listeners.indexOf(listener));
            });
        }
        return newValue;
    }

    toTextNode(transform?: (this: this, value: T) => string) {
        const { _current } = this,
            textNode = _document.createTextNode(
                transform ? transform.call(this, _current) : _current as unknown as string
            );
        if (this.active) {
            this._listeners.push(value => {
                textNode.data = transform ? transform.call(this, value) : value as unknown as string;
            });
        }
        return textNode;
    }

    toNodes(transform?: (this: this, value: T) => Node | Node[]): Node[] {
        transform = transform || Value.defaultNodeTransform;
        const { _current } = this;
        let nodes = _normalizeNodes(_toArray(transform.call(this, _current)));
        if (this.active) {
            this._listeners.push(value => {
                const newNodes = _normalizeNodes(_toArray(transform!.call(this, value))),
                    parentNode = (nodes as Node[]).length && (nodes as Node[])[0].parentNode;
                if (parentNode) {
                    replaceChildren(parentNode, newNodes, nodes);
                    nodes = newNodes;
                }
            });
        }
        return nodes;
    }

}
