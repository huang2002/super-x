import { ReactiveValue } from "./ReactiveValue";
import { createElement } from "./createElement";
import { Utils } from "./Utils";

export const STYLE_ID = 'x-stylesheet';
export let classPrefix = 'x-class-';

let _stylesheet: CSSStyleSheet | null = null;
let _id = 0;

export type StyleProperties = Record<string, string | ReactiveValue<string>>;
export type StyleVariations = Record<string, StyleProperties>;

export const insertStyle = (
    selector: string,
    properties: StyleProperties,
    variations?: StyleVariations,
) => {

    if (!_stylesheet) {
        const styleElement = document.getElementById(STYLE_ID) ||
            document.head.appendChild(createElement('style', { id: STYLE_ID }));
        _stylesheet = (styleElement as HTMLStyleElement).sheet as CSSStyleSheet;
    }

    const ruleIndex = _stylesheet.cssRules.length;
    _stylesheet.insertRule(`${selector}{}`, ruleIndex);
    const style = (_stylesheet.cssRules[ruleIndex] as CSSStyleRule).style;
    Utils.setProperties(style, properties);

    if (variations) {
        Utils.iterate(variations, (varSuffix, varProps) => {
            const varIndex = _stylesheet!.cssRules.length;
            _stylesheet!.insertRule(`${selector}${varSuffix}{}`, varIndex);
            const varStyle = (_stylesheet!.cssRules[varIndex] as CSSStyleRule).style;
            Utils.setProperties(varStyle, varProps);
        });
    }

};

export const createClass = (
    properties: StyleProperties,
    variations?: StyleVariations,
) => {
    const className = classPrefix + _id++;
    insertStyle(`.${className}`, properties, variations);
    return className;
};
