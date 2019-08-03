import { Value } from "./Value";
import { _singleton } from "./utils";
import { _null } from "./references";

export interface HistoryLike<T extends string = string> extends Value<T> {
    back(): void;
    forward(): void;
}

export const createHistory = <T extends string = string>(init: T) => {
    const $history = Value.of(init) as HistoryLike<T>,
        history = [init],
        future = new Array<T>();
    let backForwardFlag = false;
    $history.addListener(path => {
        if (backForwardFlag) {
            backForwardFlag = false;
            return;
        }
        history.push(path);
        future.length = 0;
    });
    $history.back = () => {
        if (history.length > 1) {
            backForwardFlag = true;
            future.push(history.pop()!);
            $history.setSync(history[history.length - 1]);
        }
    };
    $history.forward = () => {
        if (future.length) {
            backForwardFlag = true;
            const path = future.pop()!;
            history.push(path);
            $history.setSync(path);
        }
    };
    return $history;
};

export const getHistory = _singleton(() => {
    const _history = history,
        _location = location,
        $history = Value.of(_location.pathname) as HistoryLike;
    let backForwardFlag = false;
    window.addEventListener('popstate', () => {
        $history.setSync(_location.pathname);
    });
    $history.addListener(path => {
        if (backForwardFlag) {
            backForwardFlag = false;
        } else {
            _history.pushState(_null, '', path);
        }
    });
    $history.back = () => {
        backForwardFlag = true;
        _history.back();
    };
    $history.forward = () => {
        backForwardFlag = true;
        _history.forward();
    };
    return $history;
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
    const $hashbang = Value.of(history[0]) as HistoryLike;
    let backForwardFlag = false;
    window.addEventListener('hashchange', () => {
        const currentHash = _location.hash;
        if (HASHBANG_PATTERN.test(currentHash)) {
            const path = currentHash.slice(2);
            history.push(path);
            $hashbang.setSync(path);
        }
    });
    $hashbang.addListener(path => {
        _location.hash = HASHBANG_PREFIX + path;
        if (!backForwardFlag) {
            future.length = 0;
        }
    });
    $hashbang.back = () => {
        if (history.length > 1) {
            backForwardFlag = true;
            future.push(history.pop()!);
            $hashbang.setSync(history[history.length - 1]);
        }
    };
    $hashbang.forward = () => {
        if (future.length) {
            backForwardFlag = true;
            const path = future.pop()!;
            history.push(path);
            $hashbang.setSync(path);
        }
    };
    return $hashbang;
});
