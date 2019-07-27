import { Value } from "./Value";
import { addSchedule } from "./schedule";
import { _iterate } from "./utils";
import { HistoryLike } from "./histories";

export interface InputElement extends Element {
    value: string;
}

export type DirectiveHandler = (element: Element, value: any) => void;

export let getInputEvent = (element: InputElement): string =>
    (element.tagName === 'INPUT' && element.getAttribute('type') === 'range' ||
        element.tagName === 'SELECT') ? 'change' : 'input';

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

export const addEventListeners = (eventTarget: EventTarget, listeners: Listeners) => {
    _iterate(listeners, (listener, event) => {
        if (typeof listener === 'function') {
            eventTarget.addEventListener(event, listener);
        } else {
            eventTarget.addEventListener(event, listener[0], listener[1]);
        }
    });
};

export const directives = new Map<string | symbol, DirectiveHandler>([
    ['bind', (element, value: Value) => {
        bind(element as InputElement, value);
    }],
    ['bindSync', (element, value: Value) => {
        bindSync(element as InputElement, value);
    }],
    ['listeners', (element, listeners: Listeners) => {
        addEventListeners(element, listeners);
    }],
    ['history', (element, history: HistoryLike) => {
        element.addEventListener('click', event => {
            event.preventDefault();
            if (element.hasAttribute('back')) {
                history.back();
            } else if (element.hasAttribute('forward')) {
                history.forward();
            } else {
                history.setSync(element.getAttribute('href')!);
            }
        });
    }],
]);
