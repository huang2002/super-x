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

export let defaultClassPlaceholder = /_/g;

export type StyleContent = (string | Value<string>)[];

export interface StyleContentCreator {
    (style: Style, placeholder: RegExp, className: string): StyleContent;
    (style: Style): StyleContent;
}

export const createStyleContent: StyleContentCreator = function (
    style: Style, placeholder?: RegExp, className?: string
) {
    const FULL_CLASS_NAME = placeholder && ('.' + className),
        styleContent = new Array<string | Value<string>>();
    _iterate(style, (outer, styleKey) => {
        styleContent.push(
            (placeholder ? styleKey.replace(placeholder!, FULL_CLASS_NAME!) : styleKey) + '{'
        );
        _iterate<string | Value<string> | StyleProperties>(outer, (inner, outerKey) => {
            if (_isString(inner)) {
                styleContent.push(`${outerKey}:${outer[outerKey]};`);
            } else if (inner && (inner as any)._isXV) {
                styleContent.push(outerKey + ':');
                styleContent.push(inner as Value<string>);
                styleContent.push(';');
            } else {
                styleContent.push(
                    (placeholder ? outerKey.replace(placeholder!, FULL_CLASS_NAME!) : outerKey) + '{'
                );
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
    return styleContent;
};

export const createClassName = () => `x-class-${_styleCount++}`;

let _styleElement: HTMLStyleElement | void;

export const createStyleClass = (style: Style, placeholder?: RegExp, className?: string) => {
    const CLASS_NAME = className || createClassName(),
        styleContent = createStyleContent(style, placeholder || defaultClassPlaceholder, CLASS_NAME);
    if (_styleElement) {
        appendChildren(_styleElement, styleContent);
    } else {
        _document.head.appendChild(
            _styleElement = createElement('style', { id: 'x-style', type: 'text/css' }, styleContent)
        );
    }
    return CLASS_NAME;
};
