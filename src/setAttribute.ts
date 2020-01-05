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
            const toClassName = (classNames: object) => (
                Array.isArray(classNames) ?
                    classNames.filter(Boolean) :
                    Object.keys(classNames).filter(key => (classNames as any)[key])
            ).join(' ');
            if (classes instanceof ReactiveValue) {
                (classes as ReactiveValue<string[]>)
                    .link(element, 'className', toClassName);
            } else {
                element.setAttribute('class', toClassName(classes!));
            }
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
                const value = (style as any)[key];
                if (value instanceof ReactiveValue) {
                    value.link(elementStyle, key);
                } else {
                    (elementStyle as any)[key] = value;
                }
            });
        } else {
            element.setAttribute('style', style as string);
        }
    }],

    ['ref', (element, reference) => {
        (reference as ReactiveValue<Element>).setSync(element);
    }],

]);

export const setAttributes = (element: HTMLElement, attributes: object) => {
    Object.keys(attributes).forEach(key => {
        const value = (attributes as any)[key];
        if (directives.has(key)) {
            directives.get(key)!(element, value);
        } else if (value instanceof ReactiveValue) {
            value.link(element, key);
        } else {
            element.setAttribute(key, value);
        }
    });
};
