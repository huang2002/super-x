import { _Object, _Array, _document, _Infinity } from "./references";

export type ElementType<T extends string> =
    T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element;

export const _removeIndex = (array: unknown[], index: number) => {
    const end = array.length - 1;
    for (let i = index; i < end; i++) {
        array[i] = array[i + 1];
    }
};

export const _removeStart = (array: unknown[], count: number) => {
    const end = array.length - count;
    for (let i = 1; i <= end; i++) {
        array[i - 1] = array[i];
    }
    array.length -= count;
};

export const _isString = (value: unknown): value is string => typeof value === 'string';

export const _iterate = <T>(
    object: { [key: string]: T; },
    callback: (value: T, key: string) => void
) => {
    _Object.keys(object).forEach(key => {
        callback(object[key], key);
    });
};

export const _toArray = <T>(value: T): (T extends any[] ? T : [T]) => {
    return (_Array.isArray(value) ? value : [value]) as T extends any[] ? T : [T];
};

const FRAGMENT_TYPE = _document.DOCUMENT_FRAGMENT_NODE;

export const _normalizeNodes = (nodes: Node[], noFlat?: boolean): Node[] => {
    const result = nodes.map(
        node => node.nodeType === FRAGMENT_TYPE ?
            _normalizeNodes(_Array.from(node.childNodes), true) :
            node
    );
    return noFlat ? result : result.flat(_Infinity);
};
