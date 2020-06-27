import { ReactiveValue } from "./ReactiveValue";
import { ReactiveList } from "./ReactiveList";
import { toReactive } from "./toReactive";
import { Utils } from "./Utils";

/**
 * Transform a reactive type into corresponding normal type
 * (e.g., `ReactiveValue<number>` -> `number`)
 */
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
/** dts2md break */
/**
 * Type of internal component objects
 */
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
/** dts2md break */
/**
 * Create a component factory from a normal function
 * which accepts reactive inputs and outputs the DOM
 * structure of the components. Components are designed
 * to present DOM structures that will be updated partly
 * and frequently, such as list items, which have similar
 * DOM structures but different data. They are specially
 * handled internally so that only necessary(reactive)
 * parts are updated, which improves performance.
 * (Please note that only the first parameter is transformed
 * into reactive value, so if you expect several parameters
 * for the function, pass them as a whole as the first one,
 * or they won't be transformed)
 * @param factory A DOM-structure-producing factory
 * @returns The component factory
 * @example
 * ```js
 * const DataPresenter = X.createComponent(
 *     $data => X.createElement('p', null, $data)
 * );
 * ```
 */
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
            Utils.destroy($options);
            optionMap.delete(node);
        }
    };
    return component;
};
