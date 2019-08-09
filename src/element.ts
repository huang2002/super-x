import { _document, _Array, _Infinity, _null, _Node, _Promise, _fragment } from "./references";
import { setAttributes } from "./attribute";
import { Value } from "./Value";
import { ElementType, _createPlaceholder } from "./utils";

export const createFragment = (nodes: any[]) => {
    const fragment = _document.createDocumentFragment();
    appendChildren(fragment, nodes);
    return fragment;
};

export const toNode = (value: any) => {
    if (typeof value === 'boolean' || value == _null) {
        return _createPlaceholder();
    } else if (value instanceof _Node) {
        return value;
    } else {
        return _document.createTextNode(value);
    }
};

export const appendChild = (parentNode: Node, childNode: any) => {
    if (childNode && childNode._isXV) {
        childNode = (childNode as Value<Node>).toNodes(parentNode);
    }
    if (_Array.isArray(childNode)) {
        appendChildren(parentNode, childNode);
    } else {
        parentNode.appendChild(toNode(childNode));
    }
    return parentNode;
};

export const appendChildren = (parentNode: Node, childNodes: any[]) => {
    childNodes.flat(_Infinity).forEach(childNode => {
        appendChild(parentNode, childNode);
    });
    return parentNode;
};

const _placeholder = _createPlaceholder();
export const replaceChildren = (parentNode: Node, newNodes: Node[], oldNodes: Node[]) => {
    const firstOldNode = oldNodes[0];
    oldNodes = oldNodes.filter(oldNode => !newNodes.includes(oldNode));
    if (!oldNodes.length) {
        parentNode.insertBefore(_placeholder, firstOldNode);
        oldNodes.push(_placeholder);
    }
    const lastIndex = oldNodes.length - 1;
    oldNodes.forEach((oldNode, i) => {
        if (i < lastIndex) {
            parentNode.removeChild(oldNode);
        } else {
            parentNode.replaceChild(appendChildren(_fragment, newNodes), oldNode);
        }
    });
    return parentNode;
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

export const createPlaceholder = (
    promise: PromiseLike<any>, loadingMsg?: unknown, onRejected?: (reason: unknown) => unknown
) => {
    const value = Value.of(loadingMsg);
    promise.then(result => {
        value.setSync(result);
    }, reason => {
        value.setSync(onRejected && onRejected(reason));
    });
    return value;
};
