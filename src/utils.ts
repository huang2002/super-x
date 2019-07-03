import { Value } from "./Value";
import { _Object } from "./references";

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

export type WrapValue<T extends {}> = {
    [K in keyof T]: Value<T[K]>;
};

export type UnwrapValue<T extends readonly Value<any>[]> = {
    [K in keyof T]: T[K] extends Value<infer U> ? U : T[K];
};

export type ElementType<T extends string> =
    T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T] : Element;

export const _iterate = <T>(
    object: { [key: string]: T; },
    callback: (key: string, value: T) => void
) => {
    _Object.keys(object).forEach(key => {
        callback(key, object[key]);
    });
};
