import { ReactiveValue } from "./ReactiveValue";
import { attachListeners, ListenerMap } from "./attachListeners";

export type DirectiveHandler = (element: HTMLElement, value: unknown) => void;

export const directives = new Map<string, DirectiveHandler>([

    ['bind', (element, reactiveValue) => {
        (reactiveValue as ReactiveValue<string>).bind(element);
    }],

    ['classes', (element, classes) => {
        if (!classes) {
            element.setAttribute('class', '');
        }
        if (typeof classes === 'object') {
            element.setAttribute('class', (
                Array.isArray(classes) ?
                    classes.filter(Boolean) :
                    Object.keys(classes!).filter(key => (classes as any)[key])
            ).join(' '));
        } else {
            element.setAttribute('class', classes as string);
        }
    }],

    ['listeners', (element, listeners) => {
        attachListeners(element, listeners as ListenerMap);
    }],

    ['style', (element, style) => {
        if (style && typeof style === 'object') {
            const { style: elementStyle } = element;
            Object.keys(style!).forEach(key => {
                (elementStyle as any)[key] = (style as any)[key];
            });
        } else {
            element.setAttribute('style', style as string);
        }
    }],

    ['ref', (element, reference) => {
        (reference as ReactiveValue<Element>).setSync(element);
    }],

]);
