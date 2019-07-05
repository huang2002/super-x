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
]);

export const setAttribute = (element: Element, name: string | symbol, value: any) => {
    if (directives.has(name)) {
        directives.get(name)!(element, value);
    } else {
        if (value && value._isXV) {
            (value as Value).addListener(value => {
                setAttribute(element, name, value);
            });
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
