import { Utils } from "./Utils";

/**
 * Type of listener object definition
 */
export interface ListenerObject {
    listener: EventListener;
    options: EventListenerOptions | boolean;
}
/** dts2md break */
/**
 * Type of definition of listeners
 * (object maps, eventName -> listener)
 */
export interface ListenerMap {
    [key: string]: EventListener | ListenerObject;
}
/** dts2md break */
/**
 * Attach specific event listeners to the event target
 * @param target Event target
 * @param listeners Event listeners
 */
export const attachListeners = (target: EventTarget, listeners: ListenerMap) => {
    Utils.iterate(listeners, (event, listenerObject: EventListener | ListenerObject) => {
        if (typeof listenerObject === 'object') {
            target.addEventListener(event, listenerObject.listener, listenerObject.options);
        } else {
            target.addEventListener(event, listenerObject);
        }
    });
};
