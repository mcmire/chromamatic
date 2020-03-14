import _ from "../vendor/lodash";

import { roundNumber } from "../lib/utils";

const ENABLED = false;

const benchmark = {
  timings: {},

  measuring(...args) {
    const fn = args.pop();

    if (ENABLED) {
      let options = { precision: 1 };
      if (_.isPlainObject(args[args.length - 1])) {
        options = args.pop();
      }
      const names = args;

      names.forEach(name => this._resetTimeFor(name));
      const totalElapsedTime = this._measureTotal(fn);
      names.forEach(name => this._printResultFor(name));
      const formattedTotalElapsedTime = roundNumber(
        totalElapsedTime,
        options.precision
      );
      console.debug(`total time: ${formattedTotalElapsedTime} ms`);
    } else {
      fn();
    }
  },

  time(name, fn) {
    if (ENABLED) {
      const t1 = performance.now();
      const returnValue = fn();
      const t2 = performance.now();
      const time = t2 - t1;

      if (name in this.timings) {
        this.timings[name].push(time);
      } else {
        this.timings[name] = [time];
      }

      return returnValue;
    } else {
      return fn();
    }
  },

  _resetTimeFor(name) {
    delete this.timings[name];
  },

  _measureTotal(fn, precision = 1) {
    const t1 = performance.now();
    const returnValue = fn();
    const t2 = performance.now();
    return t2 - t1;
  },

  _printResultFor(name, precision = 3) {
    let formattedElapsedTime;
    let n;

    if (name in this.timings) {
      const elapsedTime = this._averageTimeFor(name) * 1000;
      n = this.timings[name].length;
      formattedElapsedTime = roundNumber(elapsedTime, precision);
    } else {
      n = 0;
      formattedElapsedTime = 0;
    }

    console.debug(
      `average time for ${name} (n = ${n}): ${formattedElapsedTime} ms`
    );
  },

  _averageTimeFor(name) {
    if (name in this.timings) {
      const times = this.timings[name];
      const sum = _.sum(times);
      return sum / times.length;
    } else {
      return null;
    }
  }
};

export default benchmark;
