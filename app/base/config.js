/**
 * Modulo de configuracion por entornos
 */
define(['data/config', 'base/rpc', 'when'], function (configData, rpc, when) {

    var environmentName = APPINIT.utils.getAllParams().config || 'prod';

    var module = {

        getProperty: function(propertyName) {
            return configData[environmentName][propertyName] || configData.base[propertyName];
        },

        getAllProperties: function() {
            return isc.addProperties({}, configData.base, configData[environmentName]);
        },

        getCurrentConfigEnvironment: function() {
            return environmentName;
        }

    };

    module.current = environmentName;
    module.props = module.getAllProperties();

    /**
     * Solicita la información del usuario logado (via SSO)
     * @param callback
     */
    module.fetchUserInfo =  function (callback) {
        rpc.sendRequest(module.props.fetchUserInfoActionURL, callback);
    };

    module.asyncUserInfo = function () {
        return rpc.asyncRequest(module.props.fetchUserInfoActionURL);
    };

    // Initialize ISC URLs to back-end services
    isc.RPCManager.actionURL = module.getProperty("IDACallURL");
    isc.DataSource.addClassProperties({loaderURL: module.getProperty("dsLoaderURL")});
    isc.XMLTools.addClassProperties({httpProxyURL: module.getProperty("httpProxyURL")});

    // **** EJEMPLO de código que siempre es asíncrono pero que
    // puede evitar la operación remota si ya tiene los resultados.

    var _userinfo = null;

    function readUserInfo() {
        var resultado = when.defer();
        if (_userinfo !== null && _userinfo !== "error") {
            resultado.resolve(_userinfo);
        }
        else {
            module.asyncUserInfo().then(function (data) {
                    _userinfo = data;
                    resultado.resolve(_userinfo);
                },
                function (rpcResp, data, rpcReq) {
                    _userinfo = "error";
                    resultado.reject();
                });
        }
        return resultado.promise;
    }
    module.readUserInfo = readUserInfo;

    module.getUserInfo = function () {
        return _userinfo;
    }

    // ****

    return module;
});