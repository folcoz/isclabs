// Here I use exports instead of returning a module object
// just for the sake of it!
define(['exports','i18n','underscore'], function (exports, i18n, _) {

    var plantilla = _.template(i18n.requirejsDynLoad.message, null, {variable: "data"});
    var secuencia = 0;

    exports.mensaje = function () {
        var msg = plantilla({num: ++secuencia});
        return msg;
    };
});