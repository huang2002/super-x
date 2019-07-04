import { _Object } from "./references";

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
