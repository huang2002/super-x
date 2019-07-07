import { Value } from "./Value";
import { _toArray, _normalizeNodes } from "./utils";

export type RouteMap<T extends string = string> = Record<T, (router: Value<T>) => any>;

type RouteNames<T extends RouteMap> = T extends RouteMap<infer U> ? U : never;

export const createRouter = <T extends RouteMap = RouteMap>(
    defaultRoute: RouteNames<T> | Value<RouteNames<T>>, routeMap: T
) => {
    const routes = new Map<RouteNames<T>, any>(),
        router = ((defaultRoute as any)._isXV ?
            defaultRoute :
            Value.of(defaultRoute)
        ) as Value<RouteNames<T>>;
    return router.mapSync(routeName => {
        if (routes.has(routeName)) {
            return routes.get(routeName);
        } else {
            const route = _normalizeNodes(_toArray(routeMap[routeName](router as unknown as Value<string>)));
            routes.set(routeName, route);
            return route;
        }
    });
};
