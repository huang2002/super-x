import { Value } from "./Value";
import { _singleton } from "./utils";
import { _null } from "./references";

export interface HistoryLike<T extends string = string> extends Value<T> {
    back(): void;
}

export const createHistory = <T extends string = string>(init: T) => {
    const result = Value.of(init) as HistoryLike<T>,
        history = new Array<T>();
    result.addListener(path => {
        history.push(path);
    });
    result.back = () => {
        if (history.length) {
            result.setSync(history[--history.length - 1]);
        }
    };
    return result;
};

export const getHistory = _singleton(() => {
    const _history = history,
        _location = location,
        result = Value.of(_location.pathname) as HistoryLike;
    window.addEventListener('popstate', () => {
        result.setSync(_location.pathname);
    });
    result.addListener(path => {
        _history.pushState(_null, '', path);
    }).back = () => {
        _history.back();
    };
    return result;
});

export const getHashbang = _singleton((init?: string) => {
    const _location = location,
        initHash = _location.hash,
        history = new Array<string>(),
        HASHBANG_PATTERN = /^#!/;
    if (HASHBANG_PATTERN.test(initHash)) {
        history.push(initHash.slice(2));
    } else {
        init = init || '';
        history.push(init);
        _location.hash = '#!' + init;
    }
    const result = Value.of(history[0]) as HistoryLike;
    let backFlag = false;
    window.addEventListener('hashchange', () => {
        if (backFlag) {
            backFlag = false;
            return;
        }
        const currentHash = _location.hash;
        if (HASHBANG_PATTERN.test(currentHash)) {
            const path = currentHash.slice(2);
            history.push(path);
            result.setSync(path);
        }
    });
    result.addListener(path => {
        _location.hash = '#!' + path;
    }).back = () => {
        if (history.length) {
            backFlag = true;
            _location.hash = '#!' + history[--history.length - 1];
        }
    };
    return result;
});
