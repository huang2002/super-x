import { ReactiveValue } from "./ReactiveValue";
import { createElement } from "./createElement";
import { Utils } from "./Utils";

/**
 * The id of the stylesheet element used by `super-x`
 */
export const STYLE_ID = 'x-stylesheet';
/** dts2md break */
/**
 * The prefix of classes defined by `super-x`
 */
export let classPrefix = 'x-class-';

let _stylesheet: CSSStyleSheet | null = null;
let _id = 0;
/** dts2md break */
/**
 * Type of style property definition
 */
export type StyleProperties = Record<string, string | ReactiveValue<string>>;
/** dts2md break */
/**
 * Type of style variation definition
 */
export type StyleVariations = Record<string, StyleProperties>;
/** dts2md break */
/**
 * Insert some CSS style definition
 * @param selector CSS selector
 * @param properties Style properties
 * @param variations Optional style variations (e.g., `:hover`)
 * @example
 * ```js
 * X.insertStyle(`.${someClassName}`, {
 *     textAlign: 'center',
 * }, {
 *     ':hover': {
 *         color: 'red',
 *     },
 * });
 * ```
 */
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
/** dts2md break */
/**
 * Create a unique style class
 * @param properties Style properties
 * @param variations Optional style variations
 * @returns A unique class name
 * @example
 * ```js
 * const MY_CLASS_NAME = X.createClass({
 *     textAlign: 'right',
 * }, {
 *     ':hover': {
 *         color: 'blue',
 *     },
 * });
 *
 * const myText = X.createElement('span', {
 *     class: MY_CLASS_NAME,
 * },
 *     'hello'
 * );
 * ```
 */
export const createClass = (
    properties: StyleProperties,
    variations?: StyleVariations,
) => {
    const className = classPrefix + _id++;
    insertStyle(`.${className}`, properties, variations);
    return className;
};
