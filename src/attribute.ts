import { _Boolean, _Array, _Object, _Map } from "./references";
import { Value } from "./Value";
import { directives } from "./directive";
import { _isString, _iterate } from "./utils";
import { StyleProperties } from "./style";

export type AttributeSetter = (element: Element, value: any) => void;

export const updateVersion = (element: Element, attributeName: string) => {
    const newVersion = +element.getAttribute(attributeName)! + 1 + '';
    element.setAttribute(attributeName, newVersion);
    return newVersion;
};

const _VERSION_PREFIX = 'data-x-v-';

export const attributeSetters = new _Map<string | symbol, AttributeSetter>([
    ['style', (element, style: string | StyleProperties) => {
        if (_isString(style)) {
            element.setAttribute('style', style);
        } else {
            const { style: eleStyle } = element as HTMLElement;
            _iterate(style, (value, name) => {
                if (_isString(value)) {
                    (eleStyle as any)[name] = value;
                } else {
                    const versionName = `${_VERSION_PREFIX}style-${name}`,
                        version = updateVersion(element, versionName),
                        listener = (value: unknown) => {
                            if (element.getAttribute(versionName) === version) {
                                (eleStyle as any)[name] = value;
                            } else {
                                (value as Value).removeListener(listener);
                            }
                        };
                    (value as Value).addListener(listener);
                    (eleStyle as any)[name] = (value as Value).getSync();
                }
            });
        }
    }],
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

export const setAttribute = (element: Element, name: string, value: any) => {
    if (directives.has(name)) {
        directives.get(name)!(element, value);
    } else {
        if (value && value._isXV) {
            const versionName = _VERSION_PREFIX + name,
                version = updateVersion(element, versionName),
                listener = (value: unknown) => {
                    if (element.getAttribute(versionName) === version) {
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
