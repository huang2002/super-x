import { _Object, _Array, _document, _Infinity, _null, _undefined } from "./references";

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

export const _replace = (array: unknown[], newElements: unknown[], oldElements: unknown[]) => {
    const index = array.indexOf(oldElements[0]);
    if (~index) {
        const { length: oldLength } = array,
            { length: newCount } = newElements,
            { length: oldCount } = oldElements,
            deltaCount = newCount - oldCount;
        let i;
        for (i = index + oldCount; i < oldLength; i++) {
            array[i + deltaCount] = array[i];
        }
        if (deltaCount < 0) {
            array.length += deltaCount;
        }
        for (i = 0; i < newCount; i++) {
            array[index + i] = newElements[i];
        }
    }
};

export const _copy = (target: unknown[], source: unknown[]) => {
    const { length } = source;
    target.length = length;
    for (let i = 0; i < length; i++) {
        target[i] = source[i];
    }
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

export const _normalize = (nodes: Node[], noFlat?: boolean): Node[] => {
    const result = nodes.map(
        node => node.nodeType === FRAGMENT_TYPE ?
            _normalize(_Array.from(node.childNodes), true) :
            node
    );
    return noFlat ? result : result.flat(_Infinity);
};

export const _singleton = <T extends (...args: any[]) => any>(factory: T) => {
    let instance: ReturnType<T> | void;
    return function (this: any) {
        return instance === _undefined ?
            instance = factory.apply(this, arguments as unknown as any[]) :
            instance;
    } as T;
};

export const _createPlaceholder = () => _document.createTextNode('');
