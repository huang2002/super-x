import { _now, _null } from "./references";
import { _removeStart, _removeIndex } from "./utils";

export type ScheduleCallback = () => void;

const _schedule = new Array<ScheduleCallback | null>();
let _willTick = false;

export type Ticker = (callback: () => void) => void;

export let tick: Ticker = requestAnimationFrame,
    tickLimit = 13;

export const update = () => {
    const deadline = _now() + tickLimit;
    for (let i = 0; i < _schedule.length; i++) {
        _schedule[i]!();
        _schedule[i] = _null;
        if (deadline < _now()) {
            _removeStart(_schedule, i + 1);
            return tick(update);
        }
    }
    _schedule.length = 0;
    _willTick = false;
};

export const addSchedule = (callback: ScheduleCallback) => {
    if (!~_schedule.indexOf(callback)) {
        _schedule.push(callback);
    }
    if (!_willTick) {
        _willTick = true;
        tick(update);
    }
};

export const removeSchedule = (callback: ScheduleCallback) => {
    const index = _schedule.indexOf(callback);
    if (~index) {
        _removeIndex(_schedule, index);
    }
};
