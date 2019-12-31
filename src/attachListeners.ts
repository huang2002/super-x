export interface ListenerMap {
    [key: string]: EventListener | {
        listener: EventListener;
        options: EventListenerOptions;
    };
}

export const attachListeners = (target: EventTarget, listeners: ListenerMap) => {
    Object.keys(listeners).forEach(event => {
        const listenerObject = listeners[event];
        if (typeof listenerObject === 'object') {
            target.addEventListener(event, listenerObject.listener, listenerObject.options);
        } else {
            target.addEventListener(event, listenerObject);
        }
    });
};
