import { Value } from "./Value";
import { _singleton } from "./utils";
import { _null } from "./references";

export interface HistoryLike<T extends string = string> extends Value<T> {
    back(): void;
    forward(): void;
}

export const createHistory = <T extends string = string>(init: T) => {
    const result = Value.of(init) as HistoryLike<T>,
        history = [init],
        future = new Array<T>();
    let backForwardFlag = false;
    result.addListener(path => {
        if (backForwardFlag) {
            backForwardFlag = false;
            return;
        }
        history.push(path);
        future.length = 0;
    });
    result.back = () => {
        if (history.length > 1) {
            backForwardFlag = true;
            future.push(history.pop()!);
            result.setSync(history[history.length - 1]);
        }
    };
    result.forward = () => {
        if (future.length) {
            backForwardFlag = true;
            const path = future.pop()!;
            history.push(path);
            result.setSync(path);
        }
    };
    return result;
};

export const getHistory = _singleton(() => {
    const _history = history,
        _location = location,
        result = Value.of(_location.pathname) as HistoryLike;
    let backForwardFlag = false;
    window.addEventListener('popstate', () => {
        result.setSync(_location.pathname);
    });
    result.addListener(path => {
        if (backForwardFlag) {
            backForwardFlag = false;
        } else {
            _history.pushState(_null, '', path);
        }
    });
    result.back = () => {
        backForwardFlag = true;
        _history.back();
    };
    result.forward = () => {
        backForwardFlag = true;
        _history.forward();
    };
    return result;
});

export const getHashbang = _singleton((init?: string) => {
    const _location = location,
        initHash = _location.hash,
        history = new Array<string>(),
        future = new Array<string>(),
        HASHBANG_PATTERN = /^#!/,
        HASHBANG_PREFIX = '#!';
    if (HASHBANG_PATTERN.test(initHash)) {
        history.push(initHash.slice(2));
    } else {
        init = init || '';
        history.push(init);
        _location.hash = HASHBANG_PREFIX + init;
    }
    const result = Value.of(history[0]) as HistoryLike;
    let backForwardFlag = false;
    window.addEventListener('hashchange', () => {
        const currentHash = _location.hash;
        if (HASHBANG_PATTERN.test(currentHash)) {
            const path = currentHash.slice(2);
            history.push(path);
            result.setSync(path);
        }
    });
    result.addListener(path => {
        _location.hash = HASHBANG_PREFIX + path;
        if (!backForwardFlag) {
            future.length = 0;
        }
    });
    result.back = () => {
        if (history.length > 1) {
            backForwardFlag = true;
            future.push(history.pop()!);
            result.setSync(history[history.length - 1]);
        }
    };
    result.forward = () => {
        if (future.length) {
            backForwardFlag = true;
            const path = future.pop()!;
            history.push(path);
            result.setSync(path);
        }
    };
    return result;
});
