import { ReactiveList } from "./ReactiveList";
import { ReactiveValue } from "./ReactiveValue";
import { Utils } from "./Utils";

/**
 * Make a type reactive
 * (e.g., `number[]` -> `ReactiveList<number>`)
 */
export type ToReactive<T> =
    T extends (infer U)[]
    ? ReactiveList<U>
    : (
        T extends object
        ? (
            T extends Function
            ? ReactiveValue<T>
            : { [K in keyof T]: ReactiveValue<T[K]>; }
        )
        : ReactiveValue<T>
    );
/** dts2md break */
/**
 * Create a reactive wrapper from the given value
 */
export const toReactive = <T>(value: T): ToReactive<T> => {
    if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
            return new ReactiveList(value) as ToReactive<T>;
        } else {
            const object = Object.create(value as any);
            Utils.iterate(value as any, (key, value) => {
                object[key] = new ReactiveValue(value);
            });
            return object as ToReactive<T>;
        }
    } else {
        return new ReactiveValue(value) as ToReactive<T>;
    }
};
