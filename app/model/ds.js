/*global define, isc */

/**
 * DataSources
 */
define(['base/config'], function (config) {
    'use strict';

    var module = {};

    module.sampleItemsDS = isc.DataSource.create({
        ID: "sampleItemsDS",
        dataURL: config.props.fetchSampleItemsActionURL,
        //clientOnly: true,
        fields: [
            //{name: "pk", type: "sequence", primaryKey: true, hidden: true},
            {name: "nombre", type: "text", length: 20},
            {name: "indice", type: "integer"}
        ]
    });

    module.usuariosDS = isc.DataSource.create({
        allowAdvancedCriteria:false,
        serverType:"sql",
        ID:"usuarios",
        fields: [
            {name: "Id", type: "sequence", title: "Identificador", primaryKey: true},
            {name: "Version", type: "integer", title: "Versión"},
            {name: "Fecha_alta", type: "date", title: "Fecha de alta"},
            {name: "Nombre", title: "Nombre", type: "text"}
        ]
    });

    return module;
});