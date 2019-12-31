import { Utils } from "./Utils";
import { directives } from "./directives";

export const createElement = (tag: string, attributes?: object | null, ...children: unknown[]) => {
    const element = document.createElement(tag);
    if (attributes) {
        Object.keys(attributes).forEach(key => {
            const value = (attributes as any)[key];
            if (directives.has(key)) {
                directives.get(key)!(element, value);
            } else {
                element.setAttribute(key, value);
            }
        });
    }
    if (children.length) {
        element.appendChild(Utils.createFragment(children.flat(Infinity).map(Utils.toNode)));
    }
    return element;
};
