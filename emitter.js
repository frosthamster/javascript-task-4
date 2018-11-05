'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/*
ох, как же его не хватает
*/
function defaultDict(factory) {
    const dict = new Map();

    const _get = dict.get.bind(dict);
    dict.get = function (key) {
        if (!dict.has(key)) {
            dict.set(key, factory());
        }

        return _get(key);
    };

    return dict;
}


class Callback {
    constructor(context, handler, predicate) {
        this.context = context;
        this.handler = handler;
        this.predicate = predicate;
        this.runsCount = 0;
    }

    run() {
        if (this.predicate(this.runsCount++)) {
            this.handler.apply(this.context);
        }
    }
}


class Event {
    constructor() {
        this._listeners = defaultDict(() => []);
    }

    add(callback) {
        this._listeners.get(callback.context).push(callback);
    }

    removeListener(listenerId) {
        this._listeners.set(listenerId, []);
    }

    runCallbacks() {
        for (let callbacks of this._listeners.values()) {
            for (let callback of callbacks) {
                callback.run();
            }
        }
    }
}


function* prefixes(event, delimiter = '.') {
    let result = event.split(delimiter);

    while (result.length > 0) {
        yield result.join(delimiter);
        result.pop();
    }
}


/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const events = defaultDict(() => new Event());

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Function} predicate - additional condition for event
         * @returns {ThisType}
         */
        on: function (event, context, handler, predicate = () => true) {
            events.get(event).add(new Callback(context, handler, predicate));

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {ThisType}
         */
        off: function (event, context) {
            events.get(event).removeListener(context);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {ThisType}
         */
        emit: function (event) {
            for (let subEvent of prefixes(event)) {
                events.get(subEvent).runCallbacks();
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {ThisType}
         */
        several: function (event, context, handler, times) {
            return this.on(event, context, handler, (runsCount) => runsCount < times);
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {ThisType}
         */
        through: function (event, context, handler, frequency) {
            return this.on(event, context, handler, (runsCount) => runsCount % frequency === 0);
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
