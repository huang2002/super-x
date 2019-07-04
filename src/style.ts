import { Value } from "./Value";
import { createElement, appendChildren } from "./element";
import { _null, _document } from "./references";
import { _isString, _iterate } from "./utils";

export interface StyleProperties {
    [name: string]: string | Value<string>;
}

export interface Style {
    [outerKey: string]: StyleProperties | { [innerKey: string]: StyleProperties; };
}

let _styleCount = 0;

export const createClassName = () => `x-class-${_styleCount++}`;

export let defaultClassPlaceholder = /_/g;

let _styleElement: HTMLStyleElement | void;

export const createClass = (style: Style, placeholder?: RegExp) => {
    placeholder = placeholder || defaultClassPlaceholder;
    const CLASS_NAME = createClassName(),
        FULL_CLASS_NAME = '.' + CLASS_NAME,
        styleContent = new Array<string | Value<string>>();
    _iterate(style, (outer, styleKey) => {
        styleContent.push(styleKey.replace(placeholder!, FULL_CLASS_NAME) + '{');
        _iterate<string | Value<string> | StyleProperties>(outer, (inner, outerKey) => {
            if (_isString(inner)) {
                styleContent.push(`${outerKey}:${outer[outerKey]};`);
            } else if ((inner as any)._isXV) {
                styleContent.push(outerKey + ':');
                styleContent.push(inner as Value<string>);
                styleContent.push(';');
            } else {
                styleContent.push(outerKey.replace(placeholder!, FULL_CLASS_NAME) + '{');
                _iterate(inner as StyleProperties, (value, innerKey) => {
                    if (_isString(value)) {
                        styleContent.push(`${innerKey}:${value};`);
                    } else {
                        styleContent.push(innerKey + ':');
                        styleContent.push(value);
                        styleContent.push(';');
                    }
                });
                styleContent.push('}');
            }
        });
        styleContent.push('}');
    });
    if (_styleElement) {
        appendChildren(_styleElement, styleContent);
    } else {
        _document.head.appendChild(
            _styleElement = createElement('style', { id: 'x-style', type: 'text/css' }, styleContent)
        );
    }
    return CLASS_NAME;
};
