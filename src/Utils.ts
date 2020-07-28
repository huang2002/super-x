import { ReactiveValue } from "./ReactiveValue";
import { ReactiveList } from "./ReactiveList";

/**
 * Type of objects with reactive properties
 */
export type ReactiveObject<T extends object> = {
    [K in keyof T]: T[K] | ReactiveValue<T[K]>;
};
/** dts2md break */
/**
 * Namespace of utilities
 */
export namespace Utils {
    /** dts2md break */
    /**
     * Remove specific index from the array
     */
    export const removeIndex = (array: any[], index: number) => {
        for (let i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.length--;
    };
    /** dts2md break */
    /**
     * Insert a new value at the given index in the array
     */
    export const insertIndex = <T>(array: T[], index: number, value: T) => {
        for (let i = index; i < array.length - 1; i++) {
            array[i + 1] = array[i];
        }
        array[index] = value;
    };
    /** dts2md break */
    /**
     * Create a document fragment from an array of values
     * (`toNode` is used internally to transform the values)
     */
    export const createFragment = (nodes: unknown[]) => {
        const fragment = document.createDocumentFragment();
        nodes.forEach(node => {
            fragment.appendChild(Utils.toNode(node));
        });
        return fragment;
    };
    /** dts2md break */
    /**
     * Convert a value into a node
     * Rules:
     * - numbers/strings - corresponding text nodes
     * - `Node` instances - as is
     * - `ReactiveValue`/`ReactiveList` instances - invoke their
     *     `toNode`/`toElement` and returns the result
     * - others - empty text nodes
     */
    export const toNode = (value: unknown) => {
        switch (typeof value) {
            case 'number':
            case 'bigint':
                return document.createTextNode('' + value);
            case 'string':
                return document.createTextNode(value as string);
            case 'object':
                if (!value) {
                    break;
                }
                if (value instanceof Node) {
                    return value;
                } else if (value instanceof ReactiveValue) {
                    return value.toNode();
                } else if (value instanceof ReactiveList) {
                    return value.toElement();
                }
        }
        return document.createTextNode('');
    };
    /** dts2md break */
    /**
     * Iterate the properties of the object
     * (using `Object.keys` internally)
     */
    export const iterate = <T>(object: { [key: string]: T; }, iterator: (key: string, value: T) => void) => {
        Object.keys(object).forEach(key => {
            iterator(key, (object as any)[key]);
        });
    };
    /** dts2md break */
    /**
     * Set some properties of the object
     * (reactive values are handled automatically)
     */
    export const setProperties = <T extends object>(
        object: T,
        properties: Partial<ReactiveObject<T>>
    ) => {
        Utils.iterate(properties, (key, value) => {
            const originalValue = (object as any)[key],
                valueIsReactive = value instanceof ReactiveValue;
            if (originalValue instanceof ReactiveValue) {
                if (valueIsReactive) {
                    originalValue.linkOrigins([value as ReactiveValue<unknown>], newValue => {
                        originalValue.setSync(newValue);
                    });
                } else {
                    originalValue.setSync(value);
                }
            } else {
                if (valueIsReactive) {
                    (value as ReactiveValue<unknown>).link(object as Record<string, unknown>, key);
                } else {
                    (object as any)[key] = value;
                }
            }
        });
    };
    /** dts2md break */
    /**
     * Disable a reactive value/list/object (recursively)
     */
    export const destroy = (value: object) => {
        if (value instanceof ReactiveValue) {
            value.unlinkOrigins();
        } else {
            Utils.iterate(value as any, (key, property) => {
                if (property && typeof property === 'object') {
                    if (property instanceof ReactiveValue) {
                        property.unlinkOrigins();
                    } else {
                        Utils.destroy(property!);
                    }
                }
            });
        }
    };
    /** dts2md break */
    /**
     * Tells whether `a` equals `b` (shallow comparison based on `Object.is`)
     */
    export const isEqual = (a: unknown, b: unknown) => {
        if (Object.is(a, b)) {
            return true;
        } else if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
            return a.every((v, i) => Object.is(v, b[i]));
        } else if (typeof a === 'object' && typeof b === 'object' && a && b) {
            if (a instanceof Node) {
                if (b instanceof Node) {
                    return a.isEqualNode(b);
                } else {
                    return false;
                }
            } else if (b instanceof Node) {
                return false;
            }
            const keysA = Object.keys(a),
                keysB = Object.keys(b);
            if (keysA.length !== keysB.length) {
                return false;
            }
            return keysA.every(
                k => keysB.includes(k) && Object.is((a as any)[k], (b as any)[k])
            );
        } else {
            return false;
        }
    };

};
