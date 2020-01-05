import { Utils } from "./Utils";
import { setAttributes } from "./setAttribute";

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
