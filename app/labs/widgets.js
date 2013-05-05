/**
 * Módulo para explorar modos de implementar widgets de SmartClient
 */
define(['exports'], function (exports) {
    // Las variables y funciones del módulo son privadas
    // al módulo (salvo las exportadas explícitamente) y
    // pueden actuar como "statics" de varias clases
    var contadorComun = 0;

    function incComun() {
        contadorComun += 1;
    }

    function defineCanvasContador() {
        var contadorClase = 0, // contador 'static' privado a esta clase
            incContadorClase = function () {
                contadorClase += 1;
            };

        var propsCanvasContador = {
            autoDraw: false,
            dynamicContents: true,

            inc: function () {
                this.contador += 1;
            },
            incTodos: function () {
                incComun();
                incContadorClase();
                this.inc();
                this.dynamicContentsVars = {
                    contadorComun: contadorComun,
                    contadorClase: contadorClase
                };
                this.markForRedraw();
            },
            initWidget: function () {
                this.Super("initWidget", arguments);
                this.contador = 0;
                this.contents = "Contador módulo: ${contadorComun} <br>" +
                    "Contador clase: ${contadorClase} <br>" +
                    "Contador instancia: ${this.contador} ";
            }
        };
        var clase = isc.defineClass("AppCanvasContador", isc.Canvas).addProperties(propsCanvasContador);
        return clase;
    }

    exports.incComun = incComun;
    exports.CanvasContador = defineCanvasContador();

});