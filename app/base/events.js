/**
 * Eventos que han de ser controlados globalmente por la aplicación.
 */
define(['signals', 'underscore'], function (Signal, _) {

    var events = {
        labSelected: new Signal(),
        labRequested: new Signal(),
        externalSiteRequested: new Signal()
    };

    // ========================================================================

    function createEvent(eventName) {
        if (eventName in events) return false;
        events[eventName] = new Signal();
        return true;
    }

    function createEvents(eventNames) {
        if (_.isArray(eventNames)) {
            _.each(eventNames, createEvent);
        }
    }

    function disposeSignal(signalName, sgnal) {
        sgnal.dispose();
        delete events[signalName];
    }

    function removeEvent(eventName) {
        var s;
        if (eventName in events) {
            s = events[eventName];
            if (s instanceof Signal) {
                disposeSignal(eventName, s);
            }
        }
    }

    function destroy() {
        _.forOwn(events, function (value, name) {
            if (value instanceof Signal) {
                disposeSignal(name, value);
            }
        });
    }

    events.createEvent = createEvent;
    events.createEvents = createEvents;
    events.removeEvent = removeEvent;
    events.destroy = destroy;

    return events;
});