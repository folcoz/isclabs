/**
 * Vista cargada dinámicamente por un ViewLoader
 */
(function () {
    var labs = require("labs/labs"),
        models = require("model/models"),
        config = require("base/config");

    return labs.GridPropiedades.create({
        autoDraw: false,
        width: "100%",
        height: "100%",
        data: models.propiedadesConfig(config.props)
    });
}());
