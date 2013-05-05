/*global define, isc */

/**
 * Define un módulo con clases y funciones relacionados con los modelos
 * utilizados por la aplicación.
 */
define(['underscore', 'i18n', 'model/ds', 'base/rpc', 'model/classhierarchy'], function (_, i18n, ds, rpc, hier) {
    'use strict';

    var module = {};

    module.ds = ds;
    module.hier = hier;

    module.propiedadesConfig = function (props) {
        return _.map(props, function (value, key) {
            return {propiedad:key, valor:value};
        });
    };

    module.iscProperties = function () {
        var result = [];
        for (var pname in isc) {
            if (isc.hasOwnProperty(pname) && typeof(isc[pname]) !== 'function') {
                result.push({propiedad:pname, valor:isc[pname]});
            }
        }
        return result;
    };

    module.loadFile_old = function (filepath, callback) {
        rpc.sendRequest(filepath, callback, {evalResult:false});
    };

    module.loadFile = function (filepath) {
        return rpc.asyncRequest(filepath, {evalResult: false, httpMethod: "GET"});
    };

    return module;
});