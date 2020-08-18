import { Reactive, ReactiveWatcher, ReactiveMapper } from "./Reactive";
import { Utils } from "./Utils";
import { Component } from "./createComponent";

/**
 * Type of reactive value setters which receives
 * the old value and returns a new one
 */
export type ReactiveValueSetter<T> = (currentValue: T) => T;
/** dts2md break */
/**
 * Type of object keys
 */
export type Key = string | number | symbol;
/** dts2md break */
/**
 * Type of internal reactive link records
 */
export interface ReactiveLink<T, K extends Key, U> {
    target: Record<K, U>;
    key: K;
    watcher: ReactiveWatcher<T>;
}
/** dts2md break */
/**
 * Type of internal reactive value bindings
 */
export interface ReactiveValueBinding<T> {
    event: string;
    listener: (event: Event) => void;
    watcher: ReactiveWatcher<T>;
}
/** dts2md break */
/**
 * Class of reactive values
 */
export class ReactiveValue<T> extends Reactive<T, T>{
    /** dts2md break */
    /**
     * Get corresponding input event name of the element
     */
    static getBindingEvent(element: HTMLElement) {
        return ((
            element.tagName === 'INPUT'
            && element.getAttribute('type') === 'range'
            || element.tagName === 'SELECT'
        )
            ? 'change'
            : 'input'
        );
    }
    /** dts2md break */
    /**
     * Compose a new reactive value from existing ones
     * @param origins origin reactive values
     * @param composer a function that receives current values
     * of origins and returns a new value
     */
    static compose<T>(
        origins: ReactiveValue<any>[],
        composer: ReactiveMapper<unknown[], T>,
    ) {
        const extractValues = () => (
            origins.map(origin => origin.current)
        );
        const value = new ReactiveValue(composer(extractValues()));
        value.linkOrigins(origins, () => {
            value.setSync(composer(extractValues()));
        });
        return value;
    }
    /** dts2md break */
    /**
     * The comparing function used internally
     */
    isEqual = Utils.isEqual;
    /** dts2md break */
    private _setters = new Array<ReactiveValueSetter<T>>();
    private _origins: Reactive<any, any>[] = [];
    private _originWatcher: ReactiveWatcher<any> | null = null;
    private _links = new Array<ReactiveLink<T, any, any>>();
    private _bindings = new Map<HTMLElement, ReactiveValueBinding<T>>();
    private _nodeWatchers = new Map<Node, ReactiveWatcher<T>>();
    /** dts2md break */
    /**
     * Update the value asynchronously
     */
    set(setter: ReactiveValueSetter<T>) {
        this._setters.push(setter);
        this._setSchedule();
        return this;
    }
    /** dts2md break */
    /**
     * Update the value synchronously
     */
    setSync(value: T) {
        if (!this.isEqual(this.current, value)) {
            this.current = value;
            this._setters.length = 0;
            this._setSchedule();
        }
        return this;
    }
    /** dts2md break */
    update() {
        const { _setters } = this,
            value = _setters.reduce((cur, setter) => setter(cur), this.current);
        if (_setters.length && this.isEqual(this.current, value)) {
            return;
        } else {
            _setters.length = 0;
        }
        this.current = value;
        this._getters.forEach(getter => {
            getter(value);
        });
        this._watchers.forEach(watcher => {
            watcher(value);
        });
    }
    /** dts2md break */
    /**
     * Map the reactive value to another one
     * @param mapper A transform function
     */
    map<U>(mapper: ReactiveMapper<T, U>) {
        const value = new ReactiveValue(mapper(this.current));
        value.linkOrigins([this], originalValue => {
            value.setSync(mapper(originalValue));
        });
        return value;
    }
    /** dts2md break */
    /**
     * Link the origin reactive value(s) (used internally)
     */
    linkOrigins<T>(origins: Reactive<any, T>[], watcher: ReactiveWatcher<T>) {
        if (this._origins.length) {
            this.unlinkOrigins();
        }
        this._origins = origins;
        this._originWatcher = watcher;
        origins.forEach(origin => {
            origin.watch(watcher);
        });
        return this;
    }
    /** dts2md break */
    /**
     * Unlink the origin reactive value(s) (used internally)
     */
    unlinkOrigins() {
        const { _origins } = this;
        if (_origins.length) {
            _origins.forEach(origin => {
                origin.unwatch(this._originWatcher!);
            });
            _origins.length = 0;
        }
        return this;
    }
    /** dts2md break */
    /**
     * Link the reactive value with specific property
     * of the object so that the property is synchronized
     * when the reactive value changes
     * @param target The target object
     * @param key The key of the property to link
     * @param mapper Optional transform function
     */
    link<U extends Record<K, T>, K extends Key>(
        target: U, key: K
    ): U;
    link<U extends Record<K, V>, K extends Key, V>(
        target: U, key: K, mapper?: ReactiveMapper<T, V>
    ): U;
    link<U extends Record<K, T | V>, K extends Key, V>(
        target: U, key: K, mapper?: ReactiveMapper<T, V>
    ) {
        if (!this._links.some(link => link.target === target && link.key === key)) {
            target[key] = (mapper ? mapper(this.current) : this.current) as U[K];
            const watcher = (value: T) => {
                target[key] = (mapper ? mapper(value) : value) as U[K];
            };
            this._links.push({ target, key, watcher });
            this._watchers.push(watcher);
        }
        return target;
    }
    /** dts2md break */
    /**
     * Unlink a previously linked property
     */
    unlink<U>(target: U, key: keyof U) {
        const index = this._links.findIndex(
            link => link.target === target && link.key === key
        );
        if (~index) {
            this.unwatch(this._links[index].watcher);
            Utils.removeIndex(this._links, index);
        }
        return this;
    }
    /** dts2md break */
    /**
     * Map the reactive value to a text node
     * @param mapper Optional transform function
     */
    toText(mapper?: ReactiveMapper<T, string>) {
        return this.link(document.createTextNode(''), 'data', mapper);
    }
    /** dts2md break */
    /**
     * Link the reactive value with a node so that
     * the node is synchronized with the reactive value
     * @param node Target node
     * @param mapper Optional transform function (default: `Utils.toNode`)
     */
    linkNode(node: Node, mapper: ReactiveMapper<T, Node> = Utils.toNode) {
        if (!this._nodeWatchers.has(node)) {
            const isComponent = (mapper as Component<any, [], Node>)._isComponent;
            let oldNode = node;
            const watcher = (value: T) => {
                if (oldNode.parentNode) {
                    if (oldNode !== node && isComponent) {
                        (mapper as Component<any, [], Node>).patch(oldNode, value);
                    } else {
                        const newNode = mapper(value);
                        oldNode.parentNode.replaceChild(newNode, oldNode);
                        oldNode = newNode;
                    }
                }
            };
            this._watchers.push(watcher);
            this._nodeWatchers.set(node, watcher);
            watcher(this.current);
        }
        return node;
    }
    /** dts2md break */
    /**
     * Unlink a previously linked node
     */
    unlinkNode(node: Node) {
        const watcher = this._nodeWatchers.get(node);
        if (watcher) {
            if ((watcher as Component<any, [], Node>)._isComponent) {
                (watcher as Component<any, [], Node>).destroy(node);
            }
            this.unwatch(watcher);
            this._nodeWatchers.delete(node);
        }
        return this;
    }
    /** dts2md break */
    /**
     * Map the reactive value to a DOM node
     * @param mapper Optional transform function (default: `Utils.toNode`)
     */
    toNode(mapper: ReactiveMapper<T, Node> = Utils.toNode) {
        return this.linkNode(mapper(this.current), mapper);
    }
    /** dts2md break */
    /**
     * Bind the reactive value with the input element
     * so that the reactive value is updated when
     * the value of the input element changes
     * (Here input elements refer to any elements
     * that accept input data from users)
     * @param element The input element
     */
    bind(element: HTMLElement) {
        if (!this._bindings.has(element)) {
            const event = ReactiveValue.getBindingEvent(element),
                listener = () => {
                    this.setSync((element as any).value);
                },
                watcher = (value: T) => {
                    (element as any).value = value;
                };
            element.addEventListener(event, listener);
            (element as any).value = this.current;
            this._watchers.push(watcher);
            this._bindings.set(element, { event, listener, watcher });
        }
        return this;
    }
    /** dts2md break */
    /**
     * Unbind a previously bound element
     */
    unbind(element: HTMLElement) {
        const binding = this._bindings.get(element);
        if (binding) {
            element.removeEventListener(binding.event, binding.listener);
            this.unwatch(binding.watcher);
            this._bindings.delete(element);
        }
        return this;
    }

}
