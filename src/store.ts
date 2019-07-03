import { WrapValue, _iterate } from "./utils";
import { Value } from "./Value";

export const createStore = <T extends {}>(defaults: T) => {
    const store = {} as WrapValue<T>;
    _iterate(defaults, (name, value) => {
        (store as any)[name] = new Value(value);
    });
    return store;
};
