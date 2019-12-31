import { Utils } from "./Utils";

export type ScheduleCallback = () => void;

export interface ScheduleItem {
    id: number;
    callback: ScheduleCallback;
};

const _scheduleItems = new Array<ScheduleItem>();
let _willTick = false,
    _id = 0;

export let tickLimit = 12;

const _tick = () => {
    _willTick = false;
    const deadline = Date.now() + tickLimit;
    while (Date.now() < deadline && _scheduleItems.length) {
        const item = _scheduleItems.shift()!;
        item.callback();
    }
    if (_scheduleItems.length) {
        _requestTick();
    }
};

const _requestTick = () => {
    requestAnimationFrame(_tick);
    _willTick = true;
};

export const setSchedule = (callback: ScheduleCallback) => {
    const id = _id++;
    _scheduleItems.push({ id, callback });
    if (!_willTick) {
        _requestTick();
    }
    return id;
};

export const clearSchedule = (id: number) => {
    const index = _scheduleItems.findIndex(item => item.id === id);
    if (~index) {
        Utils.removeIndex(_scheduleItems, index);
    }
};
