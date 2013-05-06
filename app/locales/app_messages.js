/*global define */

/**
 * Mensajes internacionalizados: inglés
 */
define(function () {
    'use strict';

    var module = {
        locale: "en",

        appname:"Isomorphic SmartClient Lab",

        unknown_user:"&lt;Unknown&gt;",
        userid_text:"${this.username} is the current user",

        sample_template:"<%= data.nombre %> (best in town)",

        untitled:"Untitled",
        labs_nav_title:"ISC Labs:",
        no_lab_selected:"No lab selected",

        lab_titles:{
            'simpleControlSubclassing':"Simple specializing of a control",
            'mvpDynamic':"Model View Presenter sample",
            'creationPerformance':"Control creation & destruction",
            'reusableLayout':"Reusable Layout",
            'externalSite':"Show external sites",
            'requirejsDynLoad':"Dynamic load with requirejs",
            'viewLoaderDemo':"isc.ViewLoader demo",
            'treeDemo':"ISC Class Hierarchy",
            'sqlTableCRUD':"Sql table maintenance",
            'dataBinding':"Data Binding",
            'dynamicContents':"Canvas.dynamicContents demo",
            'treeDataBinding':"Tree Data Binding",
            'windowDemo':"Window demo",
            'listGridDemo':"ListGrid fields demo",
            'eventBusDemo':"Event bus demo"
        },

        creationPerformance_numCtls_title:"Number of forms to create",
        creationPerformance_botonCrear_title:"Create",
        creationPerformance_botonDestruir_title:"Destroy",

        mvpDynamic:{
            explanation:"Use the tabs below to experiment with code that follows the Model-View-Presenter pattern.",
            testButton:"Test",
            resetButton:"Reset",
            tabs:{
                result:"Result",
                model:"Model",
                view:"View",
                presenter:"Presenter"
            }
        },

        reusableLayout:{
            topbar:"Top bar",
            sidebar:"Side bar",
            contentArea:"Content area"
        },

        requirejsDynLoad:{
            button_title_first:"Load the module (1st time)",
            button_title_next:"Invoke the module (already loaded)",
            message:"Message from dynamic module (<%= data.num %>)"
        },

        viewLoaderDemo:{
            loadButtonTitle:"Load view",
            loadingMessage:"View not loaded yet..."
        },

        treeDemo: {
            classNameTitle: "Class"
        },

        dynamicContents: {
            description: "Use the buttons below to create / destroy an isc.Label control that " +
                "updates its contents when dragged on the screen.",
            createButtonTitle: "Create",
            destroyButtonTitle: "Destroy",
            loadButtonTitle: "Load HTML fragment",
            resetButtonTitle: "Reset HTML fragment"
        },

        windowDemo: {
            showButton: "Show window",
            title: "Window adjusted to content",
            expand: "Expand",
            contract: "Contract",
            close: "Close"
        },

        // GridPropiedades
        GridPropiedades:{
            propiedad_title:"Property Name",
            valor_title:"Property Value"
        }

    };

    Date.setInputFormat("MDY");

    return module;
});
