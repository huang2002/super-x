import { Utils } from "./Utils";
import { setAttributes } from "./setAttributes";

/**
 * Create an HTML element and optionally set
 *its attributes and child nodes
 * (Internally, `setAttributes` is used to set
 * attributes so that directives are supported
 * here out of the box)
 * @param tag The tag of the element
 * @param attributes Optional attributes
 * @param children Optional child nodes
 */
export const createElement = (tag: string, attributes?: object | null, ...children: unknown[]) => {
    const element = document.createElement(tag);
    if (attributes) {
        setAttributes(element, attributes);
    }
    if (children.length) {
        element.appendChild(Utils.createFragment(children.flat(Infinity).map(Utils.toNode)));
    }
    return element;
};
