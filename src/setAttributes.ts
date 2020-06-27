import { ReactiveValue } from "./ReactiveValue";
import { attachListeners, ListenerMap } from "./attachListeners";
import { Utils } from "./Utils";

/**
 * Type of directive handlers
 */
export type DirectiveHandler = (element: HTMLElement, value: unknown) => void;
/** dts2md break */
/**
 * Map of directives that act as special attributes
 *
 * Built-in directives:
 * - `bind` - Bind the element with a reactive value
 * - `class` - Set the class names using object maps(className -> activeOrNot),
 *     string arrays(falsy items are ignored) or just normal strings
 * - `listeners` - Attach listeners according to the given definition
 *     (`attachListeners` is used internally)
 * - `style` - Set the style of the element using object maps(maybe reactive)
 *     or just normal strings
 * - `ref` - Get the reference of the element by giving
 *     a reactive value to receive the reference
 */
export const directives = new Map<string, DirectiveHandler>([

    ['bind', (element, reactiveValue) => {
        if (reactiveValue) {
            (reactiveValue as ReactiveValue<string>).bind(element);
        }
    }],

    ['class', (element, classes) => {
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
        if (listeners) {
            attachListeners(element, listeners as ListenerMap);
        }
    }],

    ['style', (element, style) => {
        if (style && typeof style === 'object') {
            Utils.setProperties(element.style, style as any);
        } else {
            element.setAttribute('style', style as string);
        }
    }],

    ['ref', (element, reference) => {
        if (reference) {
            (reference as ReactiveValue<HTMLElement>).setSync(element);
        }
    }],

]);
/** dts2md break */
/**
 * Set some attributes of the element
 * (directives and reactive values are handled automatically)
 * @param element Target element
 * @param attributes Attribute maps
 */
export const setAttributes = (element: HTMLElement, attributes: object) => {
    Utils.iterate(attributes as any, (key, value: string | ReactiveValue<any>) => {
        if (directives.has(key)) {
            directives.get(key)!(element, value);
        } else if (value instanceof ReactiveValue) {
            value.link(element, key);
        } else {
            element.setAttribute(key, value);
        }
    });
};
