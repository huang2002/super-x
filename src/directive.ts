import { Value } from "./Value";
import { addSchedule } from "./schedule";
import { _iterate } from "./utils";

export interface InputElement extends Element {
    value: string;
}

export type DirectiveSetter = (element: Element, value: any) => void;

export let getInputEvent = (element: InputElement): string =>
    element.tagName === 'INPUT' && element.getAttribute('type') === 'range' ? 'change' : 'input';

export const bind = (element: InputElement, value: Value) => {
    value.get().then(current => {
        element.value = current as string;
        const EVENT = getInputEvent(element);
        const _inputListener = () => {
            value.set(() => element.value);
        };
        element.addEventListener(EVENT, _inputListener);
        const _listener = (newValue: unknown) => {
            if (element.value !== newValue) {
                element.value = newValue as string;
            }
        };
        value.addListener(_listener)
            .addDestroyCallback(() => {
                element.removeEventListener(EVENT, _inputListener);
                value.removeListener(_listener);
            });
    });
    return element;
};

export const bindSync = (element: InputElement, value: Value) => {
    addSchedule(() => {
        element.value = value.getSync() as string;
        const EVENT = getInputEvent(element);
        const _inputListener = () => {
            value.setSync(element.value);
        };
        element.addEventListener(EVENT, _inputListener);
        const _listener = (newValue: unknown) => {
            if (element.value !== newValue) {
                element.value = newValue as string;
            }
        };
        value.addListener(_listener)
            .addDestroyCallback(() => {
                element.removeEventListener(EVENT, _inputListener);
                value.removeListener(_listener);
            });
    });
    return element;
};

export interface Listeners {
    [event: string]: EventListener | [EventListener, EventListenerOptions | boolean];
}

export const directives = new Map<string | symbol, DirectiveSetter>([
    ['bind', (element, value: Value) => {
        bind(element as InputElement, value);
    }],
    ['bindSync', (element, value: Value) => {
        bindSync(element as InputElement, value);
    }],
    ['listeners', (element, listeners: Listeners) => {
        _iterate(listeners, (listener, event) => {
            if (typeof listener === 'function') {
                element.addEventListener(event, listener);
            } else {
                element.addEventListener(event, listener[0], listener[1]);
            }
        });
    }],
]);
