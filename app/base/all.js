/*global define */

/**
 * Aglutina la plataforma base sobre un sólo módulo
 */
define(['underscore', 'when', 'moment', 'base/config', 'base/events', 'base/rpc', 'base/ui'], function (_, when, moment, config, events, rpc, ui) {
    'use strict';

    return {
        _: _,
        when: when,
        moment: moment,
        config: config,
        events: events,
        rpc: rpc,
        ui: ui
    };
});