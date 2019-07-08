import { _document, _Array, _Infinity, _null } from "./references";
import { setAttributes } from "./attribute";
import { Value } from "./Value";
import { ElementType } from "./utils";

const _fragment = _document.createDocumentFragment();

export const createFragment = (nodes: any[]) => {
    const fragment = _document.createDocumentFragment();
    appendChildren(fragment, nodes);
    return fragment;
};

export const toNode = (value: any) => {
    if (typeof value === 'boolean' || value == _null) {
        return _document.createTextNode('');
    } else if (value instanceof Node) {
        return value;
    } else {
        return _document.createTextNode(value);
    }
};

export const appendChild = (node: Node, childNode: any) => {
    if (childNode && childNode._isXV) {
        childNode = (childNode as Value<Node>).toNodes();
    }
    if (_Array.isArray(childNode)) {
        appendChildren(node, childNode);
    } else {
        node.appendChild(toNode(childNode));
    }
    return node;
};

export const appendChildren = (node: Node, childNodes: any[]) => {
    childNodes.flat(_Infinity).forEach(childNode => {
        appendChild(node, childNode);
    });
    return node;
};

export const replaceChildren = (node: Node, newNodes: Node[], oldNodes: Node[]) => {
    const lastIndex = oldNodes.length - 1;
    oldNodes.forEach((oldNode, i) => {
        if (i < lastIndex) {
            node.removeChild(oldNode);
        } else {
            node.replaceChild(appendChildren(_fragment, newNodes), oldNode);
        }
    });
    return node;
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
