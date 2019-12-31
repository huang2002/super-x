import { Reactive, ReactiveWatcher, ReactiveMapper } from "./Reactive";

export type ReactiveValueSetter<T> = (currentValue: T) => T;

export interface ReactiveValueBinding<T> {
    event: string;
    listener: (event: Event) => void;
    watcher: ReactiveWatcher<T>;
}

export class ReactiveValue<T> extends Reactive<T, T>{

    static getBindingEvent(element: HTMLElement) {
        return (element.tagName === 'INPUT' &&
            element.getAttribute('type') === 'range' ||
            element.tagName === 'SELECT') ?
            'change' : 'input';
    }

    protected _setters = new Array<ReactiveValueSetter<T>>();
    private _origin: ReactiveValue<any> | null = null;
    private _originWatcher: ReactiveWatcher<any> | null = null;
    private _textWatchers = new Map<Text, ReactiveWatcher<T>>();
    private _bindings = new Map<HTMLElement, ReactiveValueBinding<T>>();

    set(setter: ReactiveValueSetter<T>) {
        this._setters.push(setter);
        this._setSchedule();
        return this;
    }

    setSync(value: T) {
        this.current = value;
        this._setters.length = 0;
        this._setSchedule();
        return this;
    }

    update() {
        const value = this._setters.reduce((cur, setter) => setter(cur), this.current);
        this._setters.length = 0;
        this.current = value;
        this._getters.forEach(getter => {
            getter(value);
        });
        this._watchers.forEach(watcher => {
            watcher(value);
        });
    }

    map<U>(mapper: ReactiveMapper<T, U>) {
        const reactive = new ReactiveValue(mapper(this.current));
        reactive._origin = this;
        this._watchers.push(reactive._originWatcher = originalValue => {
            reactive.setSync(mapper(originalValue));
        });
        return reactive;
    }

    unlinkOrigin() {
        const { _origin } = this;
        if (_origin) {
            _origin.unwatch(this._originWatcher!);
            this._origin = null;
        }
        return this;
    }

    linkText(text: Text, mapper: ReactiveMapper<T, string> = String) {
        if (!this._textWatchers.has(text)) {
            const watcher = (value: T) => {
                text.data = mapper(value);
            };
            this._textWatchers.set(text, watcher);
            this._watchers.push(watcher);
        }
        return text;
    }

    unlinkText(text: Text) {
        const watcher = this._textWatchers.get(text);
        if (watcher) {
            this.unwatch(watcher);
            this._textWatchers.delete(text);
        }
        return this;
    }

    toText(mapper: ReactiveMapper<T, string> = String) {
        return this.linkText(document.createTextNode(mapper(this.current)));
    }

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
