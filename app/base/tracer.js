/*global define, isc */
/**
 * tracer es un módulo para trazar en la consola de isc
 * las llamadas a los métodos de un objeto.
 * Dependencias implícitas: isc
 */
define(function () {
    var PAD = "    ",
        module,
        level = 0;

    function funciones(obj) {
        var r = [],
            p;
        for (p in obj) {
            if (typeof obj[p] === "function") {
                r.push(p);
            }
        }
        return r;
    }

    function padding(n) {
        var i,
            s = "";
        for (i = 0; i < n; i += 1) {
            s = s.concat(PAD);
        }
        return s;
    }

    function invocationMessage(objName, fname, direction) {
        return padding(level) + direction + objName + "::" + fname + "()";
    }

    function goingIn(objName, fname) {
        var message;
        if (module.log) {
            message = invocationMessage(objName, fname, "> ");
            module.log(message);
        }
    }

    function goingOut(objName, fname) {
        var message;
        if (module.log) {
            message = invocationMessage(objName, fname, "< ");
            module.log(message);
        }
    }

    function iscLogWarn(message) {
        isc.Log.logWarn(message);
    }

    function consoleLog(message) {
        if (console && console.log) {
            console.log(message);
        }
    }

    function wrapInTracerFunc (obj, objName, fname, fn) {
        if (fn && fn.isTracer) return;

        var tracerFunc = function () {
            goingIn(objName, fname);
            try {
                level += 1;
                return fn.apply(this, arguments);
            }
            finally {
                level -= 1;
                goingOut(objName, fname);
            }
        };

        tracerFunc.originalFn = fn;
        tracerFunc.originalFnIsOwn = obj.hasOwnProperty(fname);
        tracerFunc.isTracer = true;
        obj[fname] = tracerFunc;
    }

    function trace(obj, objId) {
        if (typeof obj !== "object") return obj;

        var originales = funciones(obj),
            objName = objId || obj.ID || obj.name || "<unidentified>",
            fnoriginal,
            fname,
            i;

        for (i = 0; i < originales.length; i += 1) {
            fname = originales[i];
            fnoriginal = obj[fname];
            wrapInTracerFunc(obj, objName, fname, fnoriginal);
        }
        return obj;
    }

    function untrace(obj) {
        if (typeof obj !== "object") {
            return obj;
        }

        var fns = funciones(obj),
            i,
            fn;

        for (i = 0; i < fns.length; i += 1) {
            fn = obj[fns[i]];
            if (fn.isTracer && fn.originalFn) {
                if (fn.originalFnIsOwn) {
                    obj[fns[i]] = fn.originalFn;
                }
                else {
                    delete obj[fns[i]];
                }
            }
        }
        return obj;
    }

    module = {
        iscLogWarn: iscLogWarn,
        consoleLog: consoleLog,
        log: iscLogWarn,
        trace: trace,
        untrace: untrace
    };

    return module;
});