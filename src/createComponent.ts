import { ReactiveValue } from "./ReactiveValue";
import { ReactiveList } from "./ReactiveList";
import { toReactive } from "./toReactive";
import { Utils } from "./Utils";

export type NormalizeReactive<T> =
    T extends ReactiveValue<infer U> ? U :
    T extends ReactiveList<infer U> ? readonly U[] :
    T extends object ? {
        [K in keyof T]: (
            T[K] extends ReactiveValue<infer U> ? U :
            T[K] extends ReactiveList<infer U> ? readonly U[] :
            T[K]
        );
    } :
    T;

export interface Component<
    T extends { [key: string]: ReactiveValue<any>; } | ReactiveValue<any>,
    U extends unknown[],
    V extends Node
    > {
    (options: T, ...args: U): V;
    _isComponent: true;
    patch(node: V, options: T): void;
    destroy(node: V): void;
}

export const createComponent = <
    T extends { [key: string]: ReactiveValue<any>; } | ReactiveValue<any>,
    U extends unknown[],
    V extends Node
>(
    factory: (options: T, ...args: U) => V
) => {
    const optionMap = new Map<V, T>();
    const component: Component<NormalizeReactive<T>, U, V> = (options, ...args) => {
        const $options = toReactive(options) as unknown as T,
            node = factory($options, ...args);
        optionMap.set(node, $options);
        return node;
    };
    component._isComponent = true;
    component.patch = (node, options) => {
        const $options = optionMap.get(node);
        if ($options) {
            if ($options instanceof ReactiveValue) {
                $options.setSync(options);
            } else {
                Utils.setProperties($options, options as any);
            }
        }
    };
    component.destroy = node => {
        const $options = optionMap.get(node);
        if ($options) {
            Utils.destory($options);
            optionMap.delete(node);
        }
    };
    return component;
};
