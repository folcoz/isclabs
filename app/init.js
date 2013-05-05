// Definición de variables PREVIAS A LA CARGA de ISC y RequireJS
var isc_useSimpleNames = false,
    isc_css3Mode = "supported",// "on", "off"
    isomorphicDir = "/lib/isomorphic/v8.3p-pro/",
    requirejs = { // RequireJS configuration
        paths: {
            underscore: "../../lib/underscore/lodash-1.2.0.min",
            signals: "../../lib/signals/signals-1.0.0.min",
            moment: "../../lib/moment/moment-2.0.0.min",
            when: "../../lib/when/when-2.0.0"
        }

//        shim: {
//            underscore: {
//                exports: "_"
//            }
//        }

//        deps:['i18n'],
//        callback: function (i18n) {
//            if (typeof console !== "undefined") {
//                console.log(i18n.appname);
//            }
//        }
    };

// Define application global namespace
var APPINIT = (function (window, document, undefined) {
    var app = {
        DEFAULT_LOCALE: "es"
    };

    function namespace() {
        var targetObject,
            ns,
            parts,
            i,
            len;
        if (arguments.length > 1) {
            targetObject = arguments[0];
            ns = arguments[1];
        }
        else if (arguments.length === 1) {
            targetObject = app;
            ns = arguments[0];
        }
        else {
            throw new Error("namespace function must be passed at least 1 argument of type string");
        }

        parts = ns.split(".");
        for (i = 0, len = parts.length; i < len; i++) {
            if (!targetObject[parts[i]]) {
                targetObject[parts[i]] = {};
            }
            targetObject = targetObject[parts[i]];
        }
        return targetObject;
    }

    function loadScript(url, callback) {
        var script = document.createElement("script"),
            entry;
        script.async = true;
        script.src = url;
        entry = document.getElementsByTagName("script")[0];
        //entry.parentNode.insertBefore(script, entry);
        entry.parentNode.appendChild(script);
        if (typeof callback === 'function') {
            script.onload = script.onreadystatechange = function () {
                var rdyState = script.readyState;
                if (!rdyState || /complete|loaded/.test(script.readyState)) {
                    script.onload = null;
                    script.onreadystatechange = null;
                    callback();
                }
            }
        }
    }

    function decode(s) {
        return decodeURIComponent(s || "").replace("+", " ");
    }

    function parseParams(query) {
        var args = query.split("&"),
            params = {},
            pair,
            key,
            value,
            i;
        for (i = 0; i < args.length; i++) {
            pair = args[i].split("=");
            key = decode(pair[0]);
            value = decode(pair[1]);
            params[key] = value;
        }
        return params;
    }

    function getQuery() {
        var search = window.location.search,
            hasQueryParams = search !== "";
        return hasQueryParams? search.substring(1) : search;
    }

    function getQueryParams() {
        var query = getQuery(),
            params;
        if (query === "") return {};
        params = parseParams(query);
        app.utils.getQueryParams = function () {
            return params;
        };
        return params;
    }

    function getFragment() {
        var hash = window.location.hash,
            hasFragment = hash !== "";
        return hasFragment? hash.substring(1) : hash;
    }

    function getFragmentParams() {
        var fragment = getFragment(),
            params;
        if (fragment === "") return {};
        params = parseParams(fragment);
        app.utils.getFragmentParams = function () {
            return params;
        };
        return params;
    }

    function addProperties(target, source) {
        var pname;
        for (pname in source) {
            if (source.hasOwnProperty(pname)) {
                target[pname] = source[pname];
            }
        }
    }

    function getAllParams() {
        var params = {},
            fparams = getFragmentParams(),
            qparams = getQueryParams();
        addProperties(params, fparams);
        addProperties(params, qparams);
        app.utils.getAllParams = function () {
            return params;
        };
        return params;
    }

    function getAppDir() {
        var url = window.location.href,
            pos = url.lastIndexOf("/"),
            path = url.substring(0, pos+1);
        return path;
    }

    function getAppPath() {
        var url = window.location.href,
            posQuery = url.indexOf("?"),
            posHash = url.indexOf("#"),
            path;
        if (posHash !== -1) {
            path = url.substring(0, posHash);
        }
        else if (posQuery !== -1) {
            path = url.substring(0, posQuery);
        }
        else {
            path = url;
        }
        return path;
    }

    function initLocale() {
        var params = getAllParams(),
            locale = params.locale || app.DEFAULT_LOCALE,
            localeSuffix = (locale === "en") ? "" : "_" + locale,
            urlFwkI18n = isomorphicDir + "locales/frameworkMessages" + localeSuffix + ".properties",
            urlAppI18n = app.path.locales + "app_messages" + localeSuffix;

        app.locale = locale;

        app.loadISCLocale = function () {
            loadScript(urlFwkI18n);
        };

        requirejs.paths = requirejs.paths || {};
        requirejs.paths.i18n = urlAppI18n;
    }

    function mainScriptFile() {
        var params = getAllParams(),
            hasDebug = ('debug' in params),
            isDesar = params.config === "desar",
            minSuffix;
        if (hasDebug) {
            minSuffix = params.debug === "n"? ".min" : "";
        }
        else if (isDesar) {
            minSuffix = "";
        }
        else {
            minSuffix = ".min";
        }
        return "app/main" + minSuffix + ".js";
    }

    app.loadMainModule = function () {
        var mainScriptTag = document.createElement('script'),
            file = mainScriptFile();
        mainScriptTag.async = true;
        mainScriptTag.src = "/lib/requirejs/require-2.1.2.js";
        mainScriptTag.setAttribute("data-main", file);

        document.body.appendChild(mainScriptTag);
    };

    app.utils = {
        namespace: namespace,
        loadScript: loadScript,
        addProperties: addProperties,
        getFragment: getFragment,
        getQuery: getQuery,
        getQueryParams: getQueryParams,
        getFragmentParams: getFragmentParams,
        getAllParams: getAllParams,
        getAppDir: getAppDir,
        getAppPath: getAppPath
    };

    app.path = {
        base: app.utils.getAppDir()
    };
    app.path.app = app.path.base + "app/";
    app.path.locales = app.path.app + "locales/";
    app.path.data = app.path.app + "data/";
    app.path.testData = app.path.data + "test/";

    initLocale();

    return app;
})(window, document);

// Inicialización tras carga de SmartClient
APPINIT.init = function () {
    this.loadISCLocale();
    this.loadMainModule();
};