import { _toArray, _normalize } from "./utils";
import { HistoryLike, createHistory } from "./histories";

export type RouteCallback<T extends string = string> = (history: HistoryLike<T>) => any;
export type RouteMap<T extends string = string> =
    { [K in T]: RouteCallback<T>; } &
    { [path: string]: RouteCallback<T>; };

export const createRouter = <T extends string = string>(
    init: T | HistoryLike<T>, routeMap: RouteMap<T>, defaultCallback?: RouteCallback<T>
) => {
    const routeCache = new Map<T, any>(),
        history = ((init as any)._isXV ? init : createHistory(init as T)) as HistoryLike<T>;
    let defaultRouteCache: any;
    return history.mapSync(routeName => {
        if (routeCache.has(routeName)) {
            return routeCache.get(routeName);
        } else if (routeName in routeMap) {
            const route = _normalize(_toArray(
                routeMap[routeName](history)
            ));
            routeCache.set(routeName, route);
            return route;
        } else {
            return defaultCallback && (
                defaultRouteCache || (defaultRouteCache = defaultCallback(history))
            );
        }
    });
};
