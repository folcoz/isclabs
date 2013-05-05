/*global define, isc */

/**
 * base/rpc
 *
 * Utilidades generales de acceso remoto a datos.
 * Dependencias no AMD:
 * - ISC
 * - jQuery
 */
define(['when'], function (when) {
    'use strict';

//    isc.RPCManager.promptStyle = "dialog";
//    isc.RPCManager.showPrompt = true;
//    isc.RPCManager.defaultPrompt = "<h2>${loadingImage} Contactando con el servidor...</h2>";
//    var p = isc.Dialog.Prompt;
//    p.showModalMask = true;
//    p.showHeader = false;

    var module = {

        sendRequest: function (actionURL, callback, moreRequestParams) {
            var request = {
                actionURL: actionURL,
                useSimpleHttp: true,
                showPrompt: true,
                evalResult: true,
                callback: callback
            };
            if (moreRequestParams) {
                isc.addProperties(request, moreRequestParams);
            }
            isc.RPCManager.sendRequest(request);
        },

        asyncRequest: function (actionURL, moreRequestParams) {
            var deferred = when.defer(),
                request = {
                    actionURL: actionURL,
                    useSimpleHttp: true,
                    willHandleError: true,
                    showPrompt: true,
                    evalResult: true,
                    callback: function (res, data, req) {
                        if (res.status >= 0) {
                            deferred.resolve(data);
                        }
                        else {
                            deferred.reject(res, data, req);
                        }
                    }
                };
            if (moreRequestParams) {
                isc.addProperties(request, moreRequestParams);
            }
            isc.RPCManager.sendRequest(request);
            return deferred.promise;
        },

        loadDS: function (dsIds) {
            var deferred = when.defer();
            isc.DataSource.load(dsIds, function (dsNames) {
                deferred.resolve(dsNames);
            });
            return deferred.promise;
        }

    };

    return module;

});