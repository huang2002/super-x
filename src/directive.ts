import { Value } from "./Value";
import { setSchedule } from "./schedule";

export interface InputElement extends Element {
    value: string;
}

export type DirectiveSetter = (element: Element, value: any) => void;

export let getInputEvent = (element: InputElement): string =>
    element.tagName === 'INPUT' && element.getAttribute('type') === 'range' ? 'change' : 'input';

export const bind = (element: InputElement, value: Value) => {
    value.get(current => {
        element.value = current as string;
        const EVENT = getInputEvent(element);
        const _inputListener = () => {
            value.set(() => element.value);
        };
        element.addEventListener(EVENT, _inputListener);
        const _listener = (newValue: unknown) => {
            element.value = newValue as string;
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
    setSchedule(() => {
        element.value = value.getSync() as string;
        const EVENT = getInputEvent(element);
        const _inputListener = () => {
            value.setSync(element.value);
        };
        element.addEventListener(EVENT, _inputListener);
        const _listener = (newValue: unknown) => {
            element.value = newValue as string;
        };
        value.addListener(_listener)
            .addDestroyCallback(() => {
                element.removeEventListener(EVENT, _inputListener);
                value.removeListener(_listener);
            });
    });
    return element;
};

export const directives = new Map<string | symbol, DirectiveSetter>([
    ['bind', (element, value: Value) => {
        bind(element as InputElement, value);
    }],
    ['bindSync', (element, value: Value) => {
        bindSync(element as InputElement, value);
    }],
]);
