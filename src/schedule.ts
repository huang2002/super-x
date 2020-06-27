import { Utils } from "./Utils";

/**
 * Type of schedule callbacks
 */
export type ScheduleCallback = () => void;

interface ScheduleItem {
    id: number;
    callback: ScheduleCallback;
};

const _scheduleItems = new Array<ScheduleItem>();
let _willTick = false,
    _id = 0;
/** dts2md break */
/**
 * Time limitation of each tick
 */
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
/** dts2md break */
/**
 * Add a callback to the schedule
 * @returns A unique id
 */
export const setSchedule = (callback: ScheduleCallback) => {
    const id = _id++;
    _scheduleItems.push({ id, callback });
    if (!_willTick) {
        _requestTick();
    }
    return id;
};
/** dts2md break */
/**
 * Remove a callback from the schedule
 * @param id The id returned by `setSchedule`
 */
export const clearSchedule = (id: number) => {
    const index = _scheduleItems.findIndex(item => item.id === id);
    if (~index) {
        Utils.removeIndex(_scheduleItems, index);
    }
};
