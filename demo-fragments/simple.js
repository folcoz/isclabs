
/*
 * Creación de un widget SmartClient.
 * A partir de aquí:
 * - Comprobar su ID (automático). ID vs var
 * - Posicionamiento absoluto vs relativo
 * - Propiedades left, top, width, height
 * - Cambiar la posición con .moveTo()
 * - .setXXX() vs .xxx = valor (ejemplo: .setHeight(44) vs .height = 44)
 * - Cambiar el título con .title + .markForRedraw()
 * - Cambiar el título con .setTitle()
 * - Añadir un manejador de evento: .click = function () {isc.say(this.title);}
 * - Propiedad overflow: "hidden", "visible", etc.
 */
var boton = isc.Button.create();


/*
 * Crear un widget parametrizado.
 */
var boton = isc.Button.create({
    left: 100,
    top: 50,
    width: 150,
    title: "Hola mundo SmartClient.<br>¿Cómo están ustedes?<br><b>¡Espero que todo el mundo esté bien!</b>",
    wrap: true,
    overflow: 'visible',

    click: function () {
        isc.say(this.getTitle());
    }
});

/*
 * Crear un widget con subcomponentes (children)
 * sin utilizar autochildren
 */
var contenedor = isc.Canvas.create({
    ID: "contenedor",
    left: 100,
    top: 50,
    width: 300,
    height: 100,
    border: "2px outset #ddd",
    backgroundColor: "lightgrey",
    canDragReposition: true,

    initWidget: function () {
        this.Super("initWidget", arguments);
        var that = this;

        this.boton = isc.Button.create({
            autoFit: true,
            title: "Color aleatorio",
            padding: 4,

            click: function () {
                that.setRandomBackground();
            }
        });

        this.colores = {
            "lightgrey": "Gris original",
            "#fff": "Blanco",
            "#f00": "Rojo",
            "#0f0": "Verde",
            "#00f": "Azul",
            "#ff0": "Amarillo"
        };

        this.formulario = isc.DynamicForm.create({
            left: 50,
            top: 38,
            fields: [
                {
                    name: "color",
                    type: 'select',
                    valueMap: this.colores,
                    changed: function (form, item, value) {
                        form.parentElement.setBackgroundColor(value);
                    }
                }
            ]
        });

        this.addChild(this.boton);
        this.addChild(this.formulario);
    },

    setRandomBackground: function () {
        function rndHexColor() {
            var color = _.random(0, 255).toString(16);
            if (color.length < 2) {
                color = "0" + color;
            }
            return color;
        }
        var backColor = "#" + rndHexColor() + rndHexColor() + rndHexColor();
        this.setBackgroundColor(backColor);
        if (!(backColor in this.colores)) {
            this.colores[backColor] = backColor;
            this.formulario.getItem("color").setValueMap(this.colores);
        }
        this.formulario.getItem("color").setValue(backColor);
    }
});

/*
 * Crear un widget con subcomponentes
 * usando el patrón autochildren
 */
var GRIS = "lightgrey";
var contenedor = isc.Canvas.create({
    ID: "contenedor",
    left: 100,
    top: 50,
    width: 292,
    height: 100,
    border: "2px outset #ddd",
    backgroundColor: GRIS,
    canDragReposition: true,

    coloresOriginales: {
        "lightgrey": "Gris original",
        "#fff": "Blanco",
        "#f00": "Rojo",
        "#0f0": "Verde",
        "#00f": "Azul",
        "#ff0": "Amarillo"
    },

    botonDefaults: {
        _constructor: isc.Button,
        autoFit: true,
        title: "Color aleatorio",
        padding: 4
    },

    formularioDefaults: {
        _constructor: isc.DynamicForm,
        left: 50,
        top: 38,
        fields: [
            {
                name: "color",
                title: "Color",
                type: 'select'
            }
        ]
    },

    selectColorInList: function (backColor) {
        var lista = this.formulario.getItem("color");
        if (!(backColor in this.colores)) {
            this.colores[backColor] = backColor;
            lista.setValueMap(this.colores);
        }
        lista.setValue(backColor);
    },

    setRandomBackground: function () {
        function rndHexColor() {
            var color = _.random(0, 255).toString(16);
            if (color.length < 2) {
                color = "0" + color;
            }
            return color;
        }
        var backColor = "#" + rndHexColor() + rndHexColor() + rndHexColor();
        this.setBackgroundColor(backColor);
        // Actualizar la lista de colores y seleccionar el color en la lista
        this.selectColorInList(backColor);
    },

    resetColors: function () {
        this.colores = _.clone(this.coloresOriginales);
        var fld = this.formulario.getItem("color");
        fld.setValueMap(this.colores);
        fld.setValue(GRIS);
        this.setBackgroundColor(GRIS);
    },

    resetearDefaults: {
        _constructor: isc.Button,
        title: "&nbsp;x&nbsp;",
        autoFit: true,
        click: "contenedor.resetColors()"
    },

    initWidget: function () {
        this.Super("initWidget", arguments);
        var that = this;
        this.colores = _.clone(this.coloresOriginales);

        this.addAutoChild("boton", {
            click: function () {
                that.setRandomBackground();
            }
        });

        this.addAutoChild("formulario", {
            destroy: function () {
                isc.say("Destruyendo el formulario " + this.ID);
                this.Super("destroy", arguments);
            }
        });
        var fldcolor = this.formulario.getItem("color");
        fldcolor.valueMap = this.colores;
        fldcolor.setValue(GRIS);
        fldcolor.changed = function (form, item, value) {
            form.parentElement.setBackgroundColor(value);
            // form.parentElement === that
        };

        this.addAutoChild("resetear", {contenedor: this});
        this.resetear.moveTo(this.width - 18, 0);
    }

});
