/*global define */

/**
 * Mensajes internacionalizados: español
 */
define(function () {
    'use strict';

    var module = {
        locale: "es",

        appname:"Estudio de Isomorphic SmartClient",

        unknown_user:"&lt;Desconocido&gt;",
        userid_text:"Usuario: ${this.username}",

        sample_template:"el más guapo del barrio (<%= data.nombre %>)",

        untitled:"Sin título",
        labs_nav_title:"Laboratorios:",
        no_lab_selected:"Ninguno seleccionado",

        lab_titles:{
            'simpleControlSubclassing':"Especializar un control",
            'mvpDynamic':"Ejemplo de Model View Presenter",
            'creationPerformance':"Creación y destrucción de controles",
            'reusableLayout':"Layout reutilizable",
            'externalSite':"Sitios externos",
            'requirejsDynLoad':"Carga dinámica con requirejs",
            'viewLoaderDemo':"Demo de isc.ViewLoader",
            'treeDemo':"Jerarquía de Clases ISC",
            'sqlTableCRUD':"Mantenimiento de una tabla sql",
            'springDataSource': "DataSource basado en Spring",
            'dataBinding':"Data Binding (cliente)",
            'dynamicContents':"Demo de Canvas.dynamicContents",
            'treeDataBinding':"Tree Data Binding",
            'windowDemo':"Demo de Window",
            'listGridDemo':"Campos de ListGrid",
            'eventBusDemo':"Demo bus de eventos",
            'highchartsDemo':"Integración simple con Highcharts",
            'todoSample':"Lista de cosas por hacer",
            'wrapperapiSample':"Controlar aplicación host",
            'longrunTest':"Prueba de script de larga duración"
        },

        creationPerformance_numCtls_title:"Nº de formularios a crear",
        creationPerformance_botonCrear_title:"Crear",
        creationPerformance_botonDestruir_title:"Destruir",

        mvpDynamic:{
            explanation:"En las pestañas de abajo se puede experimentar con un ejemplo de código que sigue " +
                "el patrón Modelo-Vista-Presentador.",
            testButton:"Probar",
            resetButton:"Resetear",
            tabs:{
                result:"Resultado",
                model:"Modelo",
                view:"Vista",
                presenter:"Presentador"
            }
        },

        reusableLayout:{
            topbar:"Barra superior",
            sidebar:"Barra lateral",
            contentArea:"Área de contenido"
        },

        requirejsDynLoad:{
            button_title_first:"Cargar el módulo (1ª vez)",
            button_title_next:"Invocar el módulo (ya cargado)",
            message: "Mensaje proporcionado por un módulo dinámico (<%= data.num %>)"
        },

        viewLoaderDemo: {
            loadButtonTitle: "Cargar vista",
            loadingMessage: "Vista no cargada todavía..."
        },

        treeDemo: {
            classNameTitle: "Clase"
        },

        dynamicContents: {
            description: "Los botones de abajo permiten crear / destruir un control isc.Label cuyo contenido " +
                "se actualiza al arrastrarlo a otra posición en la pantalla.",
            createButtonTitle: "Crear",
            destroyButtonTitle: "Destruir",
            loadButtonTitle: "Cargar fragmento HTML",
            resetButtonTitle: "Resetear fragmento HTML"
        },

        windowDemo: {
            showButton: "Mostrar ventana",
            title: "Ventana ajustada al contenido",
            expand: "Expandir",
            contract: "Contraer",
            close: "Cerrar"
        },

        highchartsDemo: {
            title: "Consumo de Frutas",
            categories: ['Manzanas', 'Plátanos', 'Naranjas'],
            yAxisTitle: "Piezas consumidas",
            seriesNames: ["María", "Juan", "Promedio"]
        },

        todoSample: {
            title: "Cosas por hacer",
            emptyTaskMessage: "¿Qué hay que hacer?",
            clearCompletedItemsTemplate: "Eliminar <%= numCompleted %> elemento<%= (numCompleted===0 || numCompleted>1)? 's' : '' %> completado<%= (numCompleted===0 || numCompleted>1)? 's' : '' %>",
            clearCompletedItemsTitle: "Eliminar 0 elementos completados",
            markAllTitle: "Marcar todos como completados"
        },

        wrapperapiSample: {
            soundButtonTitle: "Reproducir sonido",
            delayInSecondsTitle: "Retraso (segundos)",
            showOnTopButtonTitle: "Mostrar por encima"
        },

        longrunTest: {
            description: "Una técnica para evitar errores por scripts que se ejecutan durante mucho tiempo.",
            countLabel: "Contador: <%= data.count %>",
            badButton: "Iniciar contador (error)",
            goodButton: "Iniciar contador (sin error)",
            cancelButton: "Cancelar"
        },

        // GridPropiedades
        GridPropiedades:{
            propiedad_title:"Propiedad",
            valor_title:"Valor"
        }

    };

    // Formato de fechas en España
    Date.setShortDisplayFormat("toEuropeanShortDate");
    Date.setInputFormat("DMY");

    return module;
});
