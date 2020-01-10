import { Reactive, ReactiveWatcher, ReactiveMapper } from "./Reactive";
import { Utils } from "./Utils";
import { ReactiveValue } from "./ReactiveValue";

export type ReactiveListMapper<T, U> = (originalValue: T, index: number) => U;

export type ReactiveListEvent<T> =
    { type: 'replace', index: number, value: T } |
    { type: 'insert', index: number, value: T } |
    { type: 'push', value: T } |
    { type: 'delete', index: number } |
    { type: 'setSync', list: readonly T[] };

export class ReactiveList<T> extends Reactive<readonly T[], ReactiveListEvent<T>> {

    static defaultTag = 'ul';

    constructor(initialList?: readonly T[]) {
        super(initialList || []);
    }

    private _events = new Array<ReactiveListEvent<T>>();
    private _elementWatchers = new Map<HTMLElement, ReactiveWatcher<ReactiveListEvent<T>>>();

    private _emit(event: ReactiveListEvent<T>) {
        this._events.push(event);
        this._setSchedule();
        return this;
    }

    replace(index: number, value: T) {
        return this._emit({ type: 'replace', index, value });
    }

    insert(index: number, value: T) {
        return this._emit({ type: 'insert', index, value });
    }

    unshift(value: T) {
        return this._emit({ type: 'insert', index: 0, value });
    }

    push(value: T) {
        return this._emit({ type: 'push', value });
    }

    delete(index: number) {
        return this._emit({ type: 'delete', index });
    }

    pop() {
        return this._emit({ type: 'delete', index: this.current.length - 1 });
    }

    shift() {
        return this._emit({ type: 'delete', index: 0 });
    }

    setSync(list: readonly T[]) {
        this._events.length = 0;
        this.current = list;
        return this._emit({ type: 'setSync', list: list.slice() });
    }

    update() {
        const { current, _watchers } = this;
        this._events.forEach(event => {
            switch (event.type) {
                case 'replace':
                    (current as T[])[event.index] = event.value;
                    break;
                case 'insert':
                    Utils.insertIndex(current as T[], event.index, event.value);
                    break;
                case 'push':
                    (current as T[]).push(event.value);
                    break;
                case 'delete':
                    Utils.removeIndex((current as T[]), event.index);
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

    toValue(): ReactiveValue<readonly T[]>;
    toValue<U>(mapper?: ReactiveMapper<readonly T[], U>): ReactiveValue<U>;
    toValue<U>(mapper?: ReactiveMapper<readonly T[], U>) {
        const value = new ReactiveValue(mapper ? mapper(this.current) : this.current);
        value.linkOrigin(this, () => {
            value.setSync(mapper ? mapper(this.current) : this.current);
        });
        return value;
    }

    linkElement(element: HTMLElement, mapper: ReactiveListMapper<T, Node> = Utils.toNode) {
        if (!this._elementWatchers.has(element)) {
            element.innerHTML = '';
            element.appendChild(Utils.createFragment(this.current.map(mapper)));
            const watcher = (event: ReactiveListEvent<T>) => {
                const { childNodes } = element;
                switch (event.type) {
                    case 'replace':
                        element.replaceChild(
                            mapper(event.value, event.index),
                            childNodes[event.index]
                        );
                        break;
                    case 'insert':
                        element.insertBefore(
                            mapper(event.value, event.index),
                            childNodes[event.index]
                        );
                        break;
                    case 'push':
                        element.appendChild(mapper(event.value, this.current.length - 1));
                        break;
                    case 'delete':
                        element.removeChild(childNodes[event.index]);
                        break;
                    case 'setSync':
                        element.innerHTML = '';
                        element.appendChild(Utils.createFragment(event.list.map(mapper)));
                        break;
                }
            };
            this._elementWatchers.set(element, watcher);
            this._watchers.push(watcher);
        }
        return element;
    }

    unlinkElement(element: HTMLElement) {
        const watcher = this._elementWatchers.get(element);
        if (watcher) {
            this.unwatch(watcher);
            this._elementWatchers.delete(element);
        }
        return this;
    }

    toElement(tag = ReactiveList.defaultTag, mapper?: ReactiveListMapper<T, Node>) {
        return this.linkElement(document.createElement(tag), mapper);
    }

}
