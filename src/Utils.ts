import { ReactiveValue } from "./ReactiveValue";
import { ReactiveList } from "./ReactiveList";

export const Utils = {

    removeIndex(array: any[], index: number) {
        for (let i = index; i < array.length - 1; i++) {
            array[i] = array[i + 1];
        }
        array.length--;
    },

    insertIndex<T>(array: T[], index: number, value: T) {
        for (let i = index; i < array.length - 1; i++) {
            array[i + 1] = array[i];
        }
        array[index] = value;
    },

    createFragment(nodes: unknown[]) {
        const fragment = document.createDocumentFragment();
        nodes.forEach(node => {
            fragment.appendChild(Utils.toNode(node));
        });
        return fragment;
    },

    toNode(value: unknown) {
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
                    return value.toText();
                } else if (value instanceof ReactiveList) {
                    return value.toElement();
                }
        }
        return document.createTextNode('');
    },

} as const;
