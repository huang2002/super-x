import { _toArray, _normalize } from "./utils";
import { HistoryLike, createHistory } from "./histories";

export type RouteCallback<T extends string = string> = (router: HistoryLike<T>) => any;
export type RouteMap<T extends string = string> =
    { [K in T]: RouteCallback<T>; } &
    { [path: string]: RouteCallback<T>; };

export const createRouter = <T extends string = string>(
    init: T | HistoryLike<T>, routeMap: RouteMap<T>
) => {
    const routeCache = new Map<T, any>(),
        history = ((init as any)._isXV ? init : createHistory(init as T)) as HistoryLike<T>;
    return history.mapSync(routeName => {
        if (routeCache.has(routeName)) {
            return routeCache.get(routeName);
        } else {
            const route = _normalize(_toArray(
                routeMap[routeName](history)
            ));
            routeCache.set(routeName, route);
            return route;
        }
    });
};
