import { _document, _Array, _Infinity } from "./references";
import { setAttributes } from "./attribute";
import { Value } from "./Value";
import { ElementType, _isString } from "./utils";

export const createFragment = (nodes: any[]) => {
    const fragment = _document.createDocumentFragment();
    appendChildren(fragment, nodes);
    return fragment;
};

export const appendChild = (element: Node, childNode: any) => {
    if (childNode._isXV) {
        childNode = (childNode as Value<Node>).toTextNode();
    }
    element.appendChild(
        _isString(childNode) ?
            _document.createTextNode(childNode) :
            childNode as Node
    );
};

export const appendChildren = (element: Node, childNodes: any[]) => {
    childNodes.flat(_Infinity).forEach(childNode => {
        appendChild(element, childNode);
    });
};

export const createElement = <T extends string>(
    tag: T, attributes?: object | null, ...childNodes: any[]
): ElementType<T> => {
    const element = attributes && (attributes as any).xmlns ?
        _document.createElementNS((attributes as any).xmlns, tag) :
        _document.createElement(tag);
    if (attributes) {
        setAttributes(element, attributes);
    }
    if (childNodes.length) {
        appendChildren(element, childNodes);
    }
    return element as ElementType<T>;
};
