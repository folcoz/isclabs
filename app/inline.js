var toggler = {
    toggle: function() {
        if (this.isVisible()) {
            this.hide();
        }
        else {
            this.show();
        }
    }
};

var app = {

    init: function() {

        var that = this;

        this.toggleButton = isc.Button.create({
            position: "relative", autoDraw: false,
            height: 22,
            autoFit: true,
            title: "Muestra/Oculta otro botón",
            baseStyle: "buttonRounded",

            click: function() {
                that.addLabelButton.toggle();
            }

        });

        this.addLabelButton = isc.Button.create({
            position: "relative", autoDraw: false,
            height: 22,
            autoFit: true,
            title: "Añadir etiqueta con fecha/hora",

            click: function() {
                // Añadir un nuevo control al contenedor.
                that.addLabel(new Date().toString());
            }

        });

        isc.addProperties(this.addLabelButton, toggler);

        this.labelsContainer = isc.VStack.create({
            position: "relative", autoDraw: false,
            width: 400,
            height: 100,
            overflow: "auto",
            border: "2px solid lightgray",

            doubleClick: function() {
                this.removeMembers(this.members);
            }
        });


        this.formsContainer = isc.VStack.create({
            position: "relative",
            autoDraw: false,
            membersMargin: 4,
            height: 1
        });

        this.addFormButton = isc.Button.create({
            position:"relative", autoDraw:false,
            autoFit:true,
            title:"Añadir",
            click: function() {
                that.addForm();
            }
        });

        isc.Class.delayCall("toggle", null, 2000, that.addLabelButton);
    },

    addLabel: function (txt) {
        this.labelsContainer.addMember(
            isc.Label.create({
                height: 20,
                autoFit: true, wrap: false,
                contents: txt
            })
        );
    },

    addForm: function () {
        var that = this;

        function formulariosValidos() {
            var contenedor = that.formsContainer;
            var ok = true;
            for (var i=0; i<contenedor.members.length; i++) {
                var ctrl = contenedor.getMember(i);
                if (ctrl.isA('DynamicForm')) {
                    ok = ok && ctrl.validate();
                }
            }
            return ok;
        }

        if (!formulariosValidos()) {
            //isc.say('Corrija los errores antes de añadir más formularios.');
            //return;
        }

        var form = isc.DynamicForm.create({
            autoDraw: false,
            fields: [
                {name:'nombre', title:'Nombre', type:'text', required:true},
                {name:'randomIndex', title:'Edad', editorType:'spinner', min:18, max:120, defaultValue:28},
                {name:'estadoCivil', title:'Estado civil', type:'select', required:true,
                    valueMap:{
                        'S':'Soltero/a',
                        'C':'Casado/a',
                        'V':'Viudo/a'
                    }
                }
            ]
        });
        this.formsContainer.addMember(form);
    }

};

app.init();