import { _Boolean, _Array, _Object } from "./references";
import { Value, ValueListener } from "./Value";
import { directives } from "./directive";
import { _isString, _iterate } from "./utils";
import { StyleProperties } from "./style";

export type AttributeSetter = (element: Element, value: any) => void;

export interface Listeners {
    [event: string]: EventListener | [EventListener, EventListenerOptions];
}

type StyleValueRecord = [Value<string>, ValueListener<string>];

const _styleValueRecords = new Map<CSSStyleDeclaration, StyleValueRecord[]>();

export const attributeSetters = new Map<string | symbol, AttributeSetter>([
    ['style', (element, style: StyleProperties | string) => {
        const { style: elementStyle } = element as HTMLElement;
        if (_styleValueRecords.has(elementStyle)) {
            _styleValueRecords.get(elementStyle)!.forEach(record => {
                record[0].removeListener(record[1]);
            });
        }
        if (_isString(style)) {
            _styleValueRecords.delete(elementStyle);
            element.setAttribute('style', style);
        } else {
            const records = new Array<StyleValueRecord>();
            _iterate(style, (value, name) => {
                if ((value as any)._isXV) {
                    const _listener = (newValue: string) => {
                        (elementStyle as any)[name] = newValue;
                    };
                    (value as Value<string>).addListener(_listener);
                    records.push([value as Value<string>, _listener]);
                } else {
                    (elementStyle as any)[name] = value;
                }
            });
            _styleValueRecords.set(elementStyle, records);
        }
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
        if (value && (value as any)._isXV) {
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
