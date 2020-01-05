import { Utils } from "./Utils";

export interface ListenerObject {
    listener: EventListener;
    options: EventListenerOptions | boolean;
}

export interface ListenerMap {
    [key: string]: EventListener | ListenerObject;
}

export const attachListeners = (target: EventTarget, listeners: ListenerMap) => {
    Utils.iterate(listeners, (event, listenerObject: EventListener | ListenerObject) => {
        if (typeof listenerObject === 'object') {
            target.addEventListener(event, listenerObject.listener, listenerObject.options);
        } else {
            target.addEventListener(event, listenerObject);
        }
    });
};
