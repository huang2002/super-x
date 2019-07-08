import { _Boolean, _Array, _Object } from "./references";
import { Value } from "./Value";
import { directives } from "./directive";
import { _isString, _iterate } from "./utils";

export type AttributeSetter = (element: Element, value: any) => void;

export const attributeSetters = new Map<string | symbol, AttributeSetter>([
    ['class', (element, classList: string | object | unknown[]) => {
        if (classList && typeof classList === 'object') {
            element.setAttribute('class',
                (_Array.isArray(classList) ?
                    classList.filter(_Boolean) :
                    _Object.keys(classList).filter(k => (classList as any)[k])
                ).join(' ')
            );
        } else {
            element.setAttribute('class', classList);
        }
    }],
    ['html', (element, content: string) => {
        if (element.innerHTML !== content) {
            element.innerHTML = content;
        }
    }],
]);

export const VERSION_ATTRIBUTE = 'data-x-version';

export const setAttribute = (element: Element, name: string | symbol, value: any) => {
    if (directives.has(name)) {
        directives.get(name)!(element, value);
    } else {
        if (value && value._isXV) {
            const version = +element.getAttribute(VERSION_ATTRIBUTE)! + 1 + '';
            element.setAttribute(VERSION_ATTRIBUTE, version);
            const listener = (value: unknown) => {
                if (element.getAttribute(VERSION_ATTRIBUTE) === version) {
                    setAttribute(element, name, value);
                } else {
                    (value as Value).removeListener(listener);
                }
            };
            (value as Value).addListener(listener);
            value = (value as Value).getSync();
        }
        if (attributeSetters.has(name)) {
            attributeSetters.get(name)!(element, value);
        } else {
            element.setAttribute(name as string, value);
        }
    }
    return element;
};

export const setAttributes = <T extends {}>(element: Element, attributes: T) => {
    _iterate(attributes, (value, name) => {
        setAttribute(element, name, value);
    });
    return element;
};
