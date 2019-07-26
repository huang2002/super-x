import { _toArray, _normalize } from "./utils";
import { HistoryLike, createHistory } from "./histories";

export type RouteCallback<T extends string = string> = (history: HistoryLike<T>) => any;
export type RouteRenderer<T extends string = string> = (matched: boolean, history: HistoryLike<T>) => any;
export type Route<T extends string = string> =
    ({ path: T; exact?: boolean; } | { pattern: RegExp; }) &
    ({ use: RouteCallback<T>; } | { render: RouteRenderer<T>; });

export const createRouter = <T extends string = string>(
    init: T | HistoryLike<T>, routes: Route<T>[]
) => {
    const resultCache = new Map<T, any>(),
        history = ((init as any)._isXV ? init : createHistory(init as T)) as HistoryLike<T>;
    return history.mapSync(path => {
        if (resultCache.has(path)) {
            return resultCache.get(path);
        } else {
            const result = new Array<any>();
            routes.forEach(route => {
                const matched = 'pattern' in route ?
                    route.pattern.test(path) :
                    route.exact ? route.path === path : path.startsWith(route.path);
                if ('render' in route) {
                    result.push(route.render(matched, history));
                } else if (matched) {
                    result.push(route.use(history));
                }
            });
            resultCache.set(path, result);
            return result;
        }
    });
};
