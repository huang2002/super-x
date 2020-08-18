import { Reactive, ReactiveWatcher, ReactiveMapper, ReactiveGetter } from "./Reactive";
import { Utils } from "./Utils";
import { ReactiveValue } from "./ReactiveValue";
import { Component } from "./createComponent";
import { createElement } from './createElement';

/** dts2md break */
/**
 * Type of reactive list mappers
 */
export type ReactiveListMapper<T, U> =
    (originalValue: T, $index: ReactiveValue<number>) => U;
/** dts2md break */
/**
 * Type of reactive list events
 */
export type ReactiveListEvent<T> =
    | { type: 'replace', index: number, value: T, callback?: ReactiveGetter<T>; }
    | { type: 'insert', index: number, value: T; }
    | { type: 'push', value: T; }
    | { type: 'delete', index: number, callback?: ReactiveGetter<T>; }
    | { type: 'setSync', list: readonly T[]; };
/** dts2md break */
/**
 * Class of reactive lists
 */
export class ReactiveList<T> extends Reactive<readonly T[], ReactiveListEvent<T>> {
    /** dts2md break */
    /**
     * Default element tag used in `toElement`
     */
    static defaultTag = 'ul';
    /** dts2md break */
    constructor(initialList?: readonly T[]) {
        super(initialList || []);
        if (initialList && initialList.length) {
            for (let i = 0; i < initialList.length; i++) {
                this._$indices[i] = new ReactiveValue(i);
            }
        }
    }
    /** dts2md break */
    /**
     * The comparing function used internally
     * @default `Utils.isEqual`
     */
    isEqual = Utils.isEqual;
    /** dts2md break */
    private _events = new Array<ReactiveListEvent<T>>();
    private _elementWatchers = new Map<
        HTMLElement,
        ReactiveWatcher<ReactiveListEvent<T>>
    >();
    private _$indices = new Array<ReactiveValue<number>>();
    /** dts2md break */
    private _emit(event: ReactiveListEvent<T>) {
        this._events.push(event);
        this._setSchedule();
        return this;
    }
    /** dts2md break */
    /**
     * Replace the item at specific index with a new value (asynchronously)
     * @param callback A callback that receives the old item at that index
     */
    replace(
        index: number | ReactiveValue<number>,
        value: T,
        callback?: ReactiveGetter<T>
    ) {
        return this._emit({
            type: 'replace',
            index: index as number,
            value,
            callback,
        });
    }
    /** dts2md break */
    /**
     * Insert a new value at the given index (asynchronously)
     */
    insert(index: number | ReactiveValue<number>, value: T) {
        return this._emit({ type: 'insert', index: index as number, value });
    }
    /** dts2md break */
    /**
     * Insert a new value at the first index (asynchronously)
     */
    unshift(value: T) {
        return this._emit({ type: 'insert', index: 0, value });
    }
    /** dts2md break */
    /**
     * Push a new value to the end of the list (asynchronously)
     */
    push(value: T) {
        return this._emit({ type: 'push', value });
    }
    /** dts2md break */
    /**
     * Remove specific index from the list (asynchronously)
     * @param callback A callback that receives the deleted item
     */
    delete(index: number | ReactiveValue<number>, callback?: ReactiveGetter<T>) {
        return this._emit({ type: 'delete', index: index as number, callback });
    }
    /** dts2md break */
    /**
     * Remove the last item (asynchronously)
     * @param callback A callback that receives the removed item
     */
    pop(callback?: ReactiveGetter<T>) {
        return this._emit({
            type: 'delete',
            index: this.current.length - 1,
            callback,
        });
    }
    /** dts2md break */
    /**
     * Remove the first item (asynchronously)
     * @param callback A callback that receives the removed item
     */
    shift(callback?: ReactiveGetter<T>) {
        return this._emit({ type: 'delete', index: 0, callback });
    }
    /** dts2md break */
    /**
     * Set the entire list synchronously
     * (this will discard unprocessed asynchronous updates)
     */
    setSync(list: readonly T[]) {
        this._events.length = 0;
        if (this.isEqual(this.current, list)) {
            return this;
        }
        this.current = list;
        return this._emit({ type: 'setSync', list: list.slice() });
    }
    /** dts2md break */
    update() {
        const { current, _watchers, _$indices } = this;
        this._events.forEach(event => {
            if ((event as any).index instanceof ReactiveValue) {
                (event as any).index =
                    ((event as any).index as ReactiveValue<number>).current;
            }
            switch (event.type) {
                case 'replace':
                    if (event.callback) {
                        event.callback(current[event.index]);
                    }
                    if (!this.isEqual(current[event.index], event.value)) {
                        (current as T[])[event.index] = event.value;
                    }
                    break;
                case 'insert':
                    Utils.insertIndex(current as T[], event.index, event.value);
                    for (let i = event.index; i < _$indices.length; i++) {
                        _$indices[i].setSync(i + 1);
                    }
                    Utils.insertIndex(
                        _$indices,
                        event.index,
                        new ReactiveValue(event.index)
                    );
                    break;
                case 'push':
                    (current as T[]).push(event.value);
                    _$indices.push(new ReactiveValue(_$indices.length));
                    break;
                case 'delete':
                    if (event.callback) {
                        event.callback(current[event.index]);
                    }
                    Utils.removeIndex((current as T[]), event.index);
                    for (let i = event.index + 1; i < _$indices.length; i++) {
                        _$indices[i].setSync(i - 1);
                    }
                    Utils.removeIndex(_$indices, event.index);
                    break;
                case 'setSync':
                    for (let i = _$indices.length; i < current.length; i++) {
                        _$indices.push(new ReactiveValue(i));
                    }
                    break;
            }
            _watchers.forEach(watcher => {
                watcher(event);
            });
        });
        this._events.length = 0;
        this._getters.forEach(getter => {
            getter(current);
        });
    }
    /** dts2md break */
    /**
     * Map the reactive list to a single reactive value
     * @param mapper Optional transform function
     */
    toValue(): ReactiveValue<readonly T[]>;
    toValue<U>(mapper?: ReactiveMapper<readonly T[], U>): ReactiveValue<U>;
    toValue<U>(mapper?: ReactiveMapper<readonly T[], U>) {
        const value = new ReactiveValue(
            mapper ? mapper(this.current) : this.current
        );
        value.linkOrigins([this], () => {
            value.setSync(mapper ? mapper(this.current) : this.current);
        });
        return value;
    }
    /** dts2md break */
    /**
     * Link the target element with the reactive list
     * (The content of the target element will be
     * synchronized with the items of the reactive list)
     * @param element Target element
     * @param mapper Optional transform function (default: `Utils.toNode`)
     */
    linkElement(
        element: HTMLElement,
        mapper: ReactiveListMapper<T, Node> = Utils.toNode
    ) {
        if (!this._elementWatchers.has(element)) {
            const { current: init, _$indices } = this;
            element.innerHTML = '';
            element.appendChild(Utils.createFragment(
                init.map((item, i) => mapper(item, _$indices[i]))
            ));
            const watcher = (event: ReactiveListEvent<T>) => {
                const { current } = this;
                const childNodes = Array.from(element.childNodes);
                switch (event.type) {
                    case 'replace':
                        if ((mapper as Component<any, unknown[], Node>)._isComponent) {
                            (mapper as Component<any, unknown[], Node>).patch(
                                childNodes[event.index],
                                event.value
                            );
                        } else {
                            element.replaceChild(
                                mapper(event.value, _$indices[event.index]),
                                childNodes[event.index]
                            );
                        }
                        break;
                    case 'insert':
                        element.insertBefore(
                            mapper(event.value, _$indices[event.index]),
                            childNodes[event.index]
                        );
                        break;
                    case 'push':
                        element.appendChild(
                            mapper(event.value, _$indices[current.length - 1])
                        );
                        break;
                    case 'delete':
                        element.removeChild(childNodes[event.index]);
                        if ((mapper as Component<any, unknown[], Node>)._isComponent) {
                            (mapper as Component<any, unknown[], Node>).destroy(
                                childNodes[event.index]
                            );
                        }
                        break;
                    case 'setSync':
                        element.innerHTML = '';
                        element.appendChild(
                            Utils.createFragment(
                                current.map((item, i) => mapper(item, _$indices[i]))
                            )
                        );
                        break;
                }
            };
            this._elementWatchers.set(element, watcher);
            this._watchers.push(watcher);
        }
        return element;
    }
    /** dts2md break */
    /**
     * Unlink a previously linked element
     */
    unlinkElement(element: HTMLElement) {
        const watcher = this._elementWatchers.get(element);
        if (watcher) {
            this.unwatch(watcher);
            this._elementWatchers.delete(element);
        }
        return this;
    }
    /** dts2md break */
    /**
     * Map the reactive list to an automatically synchronized element
     * @param tag The tag of the result element
     * @param attributes Optional attributes for the result element
     * @param mapper Optional transform function
     * @returns An automatically synchronized element
     * @example
     * ```js
     * const $list = X.toReactive([0, 1, 2]);
     * const ListItem = X.createComponent(
     *     $x => X.createElement('li', null, $x)
     * );
     * const list = $list.toElement('ol', null, ListItem);
     * ```
     */
    toElement(
        tag = ReactiveList.defaultTag,
        attributes: object | null = null,
        mapper?: ReactiveListMapper<T, Node>
    ) {
        return this.linkElement(createElement(tag, attributes), mapper);
    }

}
