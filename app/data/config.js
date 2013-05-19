/*global APPINIT, define */

/**
 * Datos de configuración al arrancar la aplicación
 */
define(function () {
    'use strict';

    var servidorJavaIsomorphic = "/iscserverlab/isomorphic/";

    return {

        base: {
            basePath: APPINIT.path.base,
            appPath: APPINIT.path.app,
            localesPath: APPINIT.path.locales,
            dataPath: APPINIT.path.data,
            testDataPath: APPINIT.path.testData,
            IDACallURL: servidorJavaIsomorphic + "IDACall",
            httpProxyURL: servidorJavaIsomorphic + "HttpProxy",
            dsLoaderURL: servidorJavaIsomorphic + "DataSourceLoader",
            fetchUserInfoActionURL: APPINIT.path.testData + "userinfo.json",
            fetchSampleItemsActionURL: APPINIT.path.testData + "sample_items.json",
            fechaCarga: new Date(),
            homeCepsa:"http://www.cepsa.com",
            usarServicioCaro: false,
            mensaje: "hola, mundo"
        },

        desar: {
            fetchUserInfoActionURL: APPINIT.path.testData + "userinfo.json",
            mensaje: "Este es el entorno de desarrollo",
            'dev.only': "Esta propiedad sólo existe en desarrollo",

            helpers: {
                fillMockProps: function (grid) {
                    var datos = [];
                    for (var i = 0; i < 1000; i++) {
                        datos.push({propiedad: "Propiedad " + (i+1), valor: "Valor de ejemplo " + (i+1)});
                    }
                    grid.setData(datos);
                }
            }
        },

        test: {
            homeCepsa: "http://prewww.cepsa.com/"
        },

        prod: {
            homeCepsa: "https://www.cepsa.com/",
            usarServicioCaro: true
        }

    };

});