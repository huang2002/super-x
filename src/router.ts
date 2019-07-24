import { _toArray, _normalize } from "./utils";
import { HistoryLike, createHistory } from "./histories";

export type RouteMap<T extends string = string> = Record<T, (router: HistoryLike<T>) => any>;

type RouteNames<T extends RouteMap> = T extends RouteMap<infer U> ? U : never;

export const createRouter = <T extends RouteMap = RouteMap>(
    defaultRoute: RouteNames<T> | HistoryLike<RouteNames<T>>, routeMap: T
) => {
    const routeCache = new Map<RouteNames<T>, any>(),
        history = ((defaultRoute as any)._isXV ?
            defaultRoute :
            createHistory(defaultRoute as RouteNames<T>)
        ) as HistoryLike<RouteNames<T>>;
    return history.mapSync(routeName => {
        if (routeCache.has(routeName)) {
            return routeCache.get(routeName);
        } else {
            const route = _normalize(_toArray(
                routeMap[routeName](history as unknown as HistoryLike<string>)
            ));
            routeCache.set(routeName, route);
            return route;
        }
    });
};
