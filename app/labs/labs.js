/*global define, isc, require, APPINIT, Highcharts */
/*jshint evil:false */

/**
 * Modulo: labs/labs
 * Contiene toda la funcionalidad de los distintos laboratorios / demos de SmartClient
 * utilizados en la aplicacion.
 */
define(["i18n", "underscore", "model/models", "base/config", "moment", "when", "base/ui", "base/events", "base/rpc", "labs/todos", "labs/wrapperapi"], function (i18n, _, models, config, moment, when, ui, events, rpc, todos, wrapperapi) {
    'use strict';

    var module = {};

    // Función auxiliar para crear la especificación de un Tab que contiene un editor
    // de código.
    function createEditorTab(name) {
        return {
            name: name,
            title: i18n.mvpDynamic.tabs[name],
            width: 110,
            icon: "icon_code.png",
            pane: isc.DynamicForm.create({
                autoDraw: false,
                width: "100%",
                height: "100%",
                numCols: 1,
                overflow: 'hidden',
                fields: [
                    {
                        name: 'code',
                        type: 'textarea',
                        showTitle: false,
                        width: "100%",
                        height: "100%",
                        textBoxStyle: "codeEditor"
                    }
                ]
            })
        };
    }

    // *** Simple control subclassing ***
    function defineGridPropiedades() {
        var i18nGP = i18n.GridPropiedades,
            gridPropiedadesDef = {
                defaultFields:[
                    {name:'propiedad', title:i18nGP.propiedad_title},
                    {name:'valor', title:i18nGP.valor_title}
                ],
                initWidget:function () {
                    ui.superInitWidget(this, arguments);
                    this.propiedadClick = this.propiedadClick || function (record) {
                    };
                    this.cellDoubleClick = function (record, rowNum, colNum) {
                        this.propiedadClick(record);
                    };
                }
            };
        return isc.ClassFactory.defineClass("AppGridPropiedades", isc.ListGrid).addProperties(gridPropiedadesDef);
    }
    var GridPropiedades = defineGridPropiedades();

    // *** Model View Presenter lab ***
    function defineDynamicMVPView() {
        var dynamicMVPViewDef = {
            explanationDefaults: {
                _constructor: isc.HTMLFlow,
                height: 32,
                styleName: "labExplanation",
                contents: i18n.mvpDynamic.explanation
            },
            tabSetDefaults: {
                _constructor: isc.TabSet,
                autoDraw: false,
                height: "*",
                tabs: [
                    {
                        name: 'result',
                        title: i18n.mvpDynamic.tabs.result,
                        icon: "[SKIN]/Window/headerIcon.png",
                        width: 110,
                        pane: isc.Canvas.create({
                            autoDraw: false,
                            width: "100%", height: "100%"
                        })
                    },
                    createEditorTab('model'),
                    createEditorTab('view'),
                    createEditorTab('presenter')
                ]
            },
            buttonsPanelDefaults: {
                _constructor: isc.HLayout,
                autoDraw: false,
                height: 32,
                defaultLayoutAlign: 'center',
                membersMargin: 8
            },
            testButtonDefaults: {
                _constructor: isc.IButton,
                autoParent: "buttonsPanel",
                title: i18n.mvpDynamic.testButton,
                disabled: true,
                click: function () {
                    ui.getPresenter(this).runMVPCode();
                }
            },
            resetButtonDefaults: {
                _constructor: isc.IButton,
                autoParent: "buttonsPanel",
                title: i18n.mvpDynamic.resetButton,
                click: function () {
                    ui.getPresenter(this).loadMVPCode();
                }
            },

            initWidget: function () {
                ui.superInitWidget(this, arguments);

                // add explanation
                this.addAutoChild("explanation");
                // add tabSet
                this.addAutoChild("tabSet");
                // add actions panel
                this.addAutoChildren(["buttonsPanel", "testButton", "resetButton"]);
            },

            setTabTextContent: function (tabId, text) {
                var t = this.tabSet.getTab(tabId);
                if (t && t.pane) {
                    t.pane.setValue('code', text);
                }
            },

            getTabTextContent: function (tabId) {
                var t = this.tabSet.getTab(tabId);
                if (t) {
                    var txt = t.pane.getValue('code');
                    return txt;
                }
                else {
                    return "";
                }
            },

            setResultView: function (newView) {
                var t = this.tabSet.getTab("result");
                if (t) {
                    if (t.pane && t.pane.children) {
                        //t.pane.destroy();
                        var child = t.pane.children[0];
                        if (child) {
                            t.pane.removeChild(child);
                            child.destroy();
                        }
                    }
                    //t.setPane(newView);
                    t.pane.addChild(newView);
                    this.tabSet.selectTab(t);
                }
            },

            enableTest: function (flag) {
                this.testButton.setDisabled(!flag);
            }
        };
        return isc.ClassFactory.defineClass("DynamicMVPView", isc.VLayout).addProperties(dynamicMVPViewDef);
    }
    var DynamicMVPView = defineDynamicMVPView();

    function defineDynamicMVPPresenter() {
        var dynamicMVPPresenterDef = {
            init: function () {
                this.Super("init", arguments);

                this.view.presenter = this;
            },

            loadTextFile: function (type) {
                var filepath = config.props.dataPath + "mvp/" + type + ".txt";
                var that = this;
                var carga = models.loadFile(filepath);
                carga.then(function (data) {
                    that.view.setTabTextContent(type, data);
                });
                return carga;
            },

            run: function () {
                var that = this;
                this.loadMVPCode().then(function () {
                    that.view.show();
                    that.runMVPCode();
                });
            },

            runMVPCode: function () {
                var prefix = "(function () {";
                var suffix = "})();";

                var modelCode = this.view.getTabTextContent("model");
                var viewCode = this.view.getTabTextContent("view");
                var presenterCode = this.view.getTabTextContent("presenter");

                var allCode = [prefix, modelCode, viewCode, presenterCode, suffix].join("\n");
                var v = isc.eval(allCode);

                // asignar la vista creada al pane del tab de resultados
                this.view.setResultView(v);
            },

            loadMVPCode: function () {
                var that = this;
                var filesToLoad = [
                    this.loadTextFile("model"),
                    this.loadTextFile("view"),
                    this.loadTextFile("presenter")
                ];
                var fileLoading = when.all(filesToLoad).then(
                    function () {
                        that.view.enableTest(true);
                    }, function () {
                        that.view.enableTest(false);
                    }
                );
                return fileLoading;
            }
        };
        return isc.ClassFactory.defineClass("AppDynamicMVPPresenter", isc.Class).addProperties(dynamicMVPPresenterDef);
    }
    var DynamicMVPPresenter = defineDynamicMVPPresenter();

    // *** Dynamic creation & destruction of controls ***
    function defineControlCreationView() {
        var controlCreationViewDef = {
            toolbarDefaults: {
                _constructor: isc.HStack,
                height:40,
                membersMargin:4,
                defaultLayoutAlign:"center"
            },
            formDefaults: {
                _constructor: isc.DynamicForm,
                autoParent: "toolbar",
                width:250, height:24,
                colWidths:[150, 100],
                fields:[
                    {
                        name:"numCtls",
                        title:i18n.creationPerformance_numCtls_title,
                        editorType:'spinner',
                        min:1, max:10, step:1, defaultValue:3,
                        required:true,
                        width:100
                    }
                ]
            },
            createButtonDefaults: {
                _constructor: isc.Button,
                autoParent: "toolbar",
                title:i18n.creationPerformance_botonCrear_title
            },
            destroyButtonDefaults: {
                _constructor: isc.Button,
                autoParent: "toolbar",
                title:i18n.creationPerformance_botonDestruir_title
            },
            paneDefaults: {
                _constructor: isc.HLayout,
                autoDraw:false,
                width:"100%",
                height:"100%",
                overflow:'auto'
            },

            initWidget: function () {
                ui.superInitWidget(this, arguments);
                this.createForm();
                this.createPane();
            },

            createForm: function () {
                var that = this;
                this.addAutoChildren(["toolbar", "form"]);
                this.addAutoChild("createButton", {
                    click: function () {
                        that.createControls(that.form.getValue("numCtls"));
                    }
                });
                this.addAutoChild("destroyButton", {
                    click: function () {
                        that.destroyControls();
                    }
                });
            },

            createPane:function () {
                this.addAutoChild("pane", {});
            },

            createControls:function (numToCreate) {
                var i,
                    formSpec = {
                        fields:[
                            {
                                title:"Code",
                                name:"countryCode",
                                type:"text",
                                required:true
                            },
                            {
                                title:"Country",
                                name:"countryName",
                                type:"text",
                                required:true
                            },
                            {
                                title:"Capital",
                                name:"capital",
                                type:"text"
                            },
                            {
                                title:"Government",
                                name:"government",
                                length:500,
                                type:"text"
                            },
                            {
                                title:"Continent",
                                valueMap:[
                                    "Europe",
                                    "Asia",
                                    "North America",
                                    "Australia/Oceania",
                                    "South America",
                                    "Africa"
                                ],
                                name:"continent",
                                type:"text"
                            },
                            {
                                title:"G8",
                                name:"member_g8",
                                type:"boolean"
                            },
                            {
                                title:"Nationhood",
                                name:"independence",
                                type:"date"
                            },
                            {
                                title:"Area (km&sup2;)",
                                name:"area",
                                type:"float"
                            },
                            {
                                title:"Population",
                                name:"population",
                                type:"integer"
                            },
                            {
                                title:"GDP ($M)",
                                name:"gdp",
                                type:"float"
                            },
                            {
                                title:"Info",
                                detail:true,
                                name:"article",
                                type:"link"
                            }
                        ]
                    };
                for (i = 0; i < numToCreate; i++) {
                    this.pane.addMember(isc.DynamicForm.create(formSpec));
                }
            },

            destroyControls:function () {
                var controls = this.pane.members.slice();
                this.pane.removeMembers(this.pane.members);
                _.each(controls, function (ctl) {
                    ctl.destroy();
                });
            }
        };
        return isc.ClassFactory.defineClass("AppControlCreationView", isc.VLayout).addProperties(controlCreationViewDef);
    }
    var ControlCreationView = defineControlCreationView();

    // *** Reusable layout lab ***
    function defineReusableLayoutView() {
        var reusableLayoutViewDef = {
            autoDraw: false,
            styleName: "reusableLayout",

            topbarDefaults: {
                _constructor: isc.Label,
                contents: i18n.reusableLayout.topbar,
                height: 70,
                align: "center",
                styleName: "topbar"
            },
            mainAreaDefaults: {
                _constructor: isc.HLayout,
                width: "100%", height: "100%"
            },
            sidebarDefaults: {
                _constructor: isc.Label,
                autoParent: "mainArea",
                contents: i18n.reusableLayout.sidebar,
                width: 160,
                showResizeBar: true,
                align: "center",
                styleName: "sidebar"
            },
            contentAreaDefaults: {
                _constructor: isc.Label,
                autoParent: "mainArea",
                width: "100%",
                contents: i18n.reusableLayout.contentArea,
                align: "center",
                styleName: "contentArea"
            },

            initWidget: function () {
                ui.superInitWidget(this, arguments);

                this.addAutoChildren(["topbar", "mainArea", "sidebar", "contentArea"]);
            }
        };
        return isc.ClassFactory.defineClass("ReusableLayoutView", isc.VLayout).addProperties(reusableLayoutViewDef);
    }
    var ReusableLayoutView = defineReusableLayoutView();

    // *** External sites lab ***
    function defineExternalSitesView() {
        var makeButton = function (title, url) {
            return {
                title: title,
                url: url,
                //width: 100,
                height: 28,
                click: function () {
                    events.externalSiteRequested.dispatch(this.url);
                }
            };
        };
        var externalSitesViewDef = {
            autoDraw: false,
            width: "100%",
            height: "100%",
            layoutMargin: 8,
            membersMargin: 8,

            toolbarDefaults: {
                _constructor: isc.Toolbar,
                autoDraw: false,
                membersMargin: 4,
                height: 30,
                buttonDefaults: {
                    align: 'right',
                    baseStyle: 'menuButton',
                    actionType: 'radio',
                    radioGroup: 'externalSitesMenu',
                    padding: 8,
                    showFocused: false
                }
            },

            sitePanelDefaults: {
                _constructor: isc.HTMLPane,
                height: "*",
                autoDraw: false,
                contentsType: "page"
                //showEdges: true
            },

            loadExternalSite: function (url) {
                this.sitePanel.setContentsURL(url);
                // Hack para arreglar problema con el dimensionamiento
                // del iframe en Google Chrome
                var that = this;
                isc.Timer.setTimeout(function () {
                    that.sitePanel.resizeBy(1, 1);
                    that.sitePanel.resizeBy(-1, -1);
                }, 100);
            },

            initWidget: function () {
                ui.superInitWidget(this, arguments);

                events.externalSiteRequested.add(this.loadExternalSite, this);

                this.addAutoChild("toolbar", {
                    buttons: [
                        makeButton("Wikipedia", "http://www.wikipedia.org"),
                        makeButton("Highcharts", "http://www.highcharts.com/"),
                        makeButton("CEPSA", "http://www.cepsa.com/"),
                        makeButton("Bing", "http://www.bing.com/"),
                        makeButton("Google (!)", "http://www.google.com/")
                    ]
                });
                this.addAutoChild("sitePanel");
            },

            destroy: function () {
                events.externalSiteRequested.remove(this.loadExternalSite, this);
                this.Super("destroy", arguments);
            }
        };
        return isc.ClassFactory.
            defineClass("ExternalSitesView", isc.VLayout).
            addProperties(externalSitesViewDef);
    }
    var ExternalSitesView = defineExternalSitesView();

    // *** RequireJS dynamic load ***
    function defineRequireJsDynLoadView() {
        var requireJsDynLoadViewDef = {
            title: i18n.requirejsDynLoad.button_title_first,
            width: 200,

            click: function () {
                var that = this;
                require(["model/dynamic"], function (module) {
                    isc.say(module.mensaje());
                    that.setTitle(i18n.requirejsDynLoad.button_title_next);
                });
            }
        };
        return isc.ClassFactory.defineClass("RequireJsDynLoadView", isc.Button).addProperties(requireJsDynLoadViewDef);
    }
    var RequireJsDynLoadView = defineRequireJsDynLoadView();

    // *** ViewLoader demo lab ***

    // *** SQL Table CRUD lab ***
    function defineSqlTableCrudView() {
        var sqlTableCrudViewDef = {
            autoDraw: false,
            width: "100%",
            height: "100%",
            membersMargin: 8,

            gridDefaults: {
                _constructor: isc.ListGrid,
                width: 460,
                height: 200,
                canEdit: true,
                canRemoveRecords: true,
                showFilterEditor: true,
                autoFetchData: true
            },

            addNewBtnDefaults: {
                _constructor: isc.Button,
                width: 120,
                title: "Añadir",
                click: function () {
                    this.grid.startEditingNew();
                }
            },

            exportBtnDefaults: {
                _constructor: isc.Button,
                width: 120,
                title: "Exportar como Excel",
                click: function () {
                    this.grid.exportData({
                        exportResults: true,
                        exportAs: 'ooxml', //"xls",
                        exportToClient: true,
                        exportDisplay: "download",
                        exportFilename: "prueba"
                    });
                }
            },

            initWidget: function () {
                ui.superInitWidget(this, arguments);

                var gridProps = {
                    dataSource: this.dataSource,
                    fields: this.fields
                };
                this.addAutoChild("grid", gridProps);
                this.addAutoChild("addNewBtn", {grid: this.grid});
                this.addAutoChild("exportBtn", {grid: this.grid});
            }
        };
        return isc.ClassFactory.defineClass("SqlTableCrudView", isc.VLayout).addProperties(sqlTableCrudViewDef);
    }
    var SqlTableCrudView = defineSqlTableCrudView();

    function defineHighchartsCanvas() {
        var highchartsCanvasDefinition = {

            //redrawOnResize: false,
            overflow: "hidden",

            initWidget: function () {
                ui.superInitWidget(this, arguments);
                this.highcharts = this.highcharts || {
                    chart: {
                    },
                    title: this.getID()
                };
            },

            draw: function () {
                if (!this.readyToDraw()) {
                    return this;
                }
                this.Super("draw", arguments);
                this._createChart();
            },

            getInnerHTML: function () {
                return "<div id='" + this._chartContainerId() + "' style='width:100%;height:100%;'></div>";
            },

            _chartContainerId: function () {
                return this.getID() + "_chart_container";
            },

            _createChart: function () {
                this.highcharts.chart.renderTo = this._chartContainerId();
                this._chart = new Highcharts.Chart(this.highcharts);
            },

            // extra functions -------------------------------

            _destroyChart: function () {
                if (this._chart) {
                    this._chart.destroy();
                    delete this._chart;
                }
            },

            destroy: function () {
                this._destroyChart();
                this.Super("destroy", arguments);
            },

            redraw: function (reason) {
                this._destroyChart();
                this.Super("redraw", arguments);
                this._createChart();
            },

            hide: function () {
                this.Super("hide");
                this._destroyChart();
            },

            show: function () {
                var wasVisible = this.isVisible();
                this.Super("show");
                if (!wasVisible) {
                    this.markForRedraw("show()");
                }
            }
        };
        return isc.defineClass("HighchartsCanvas", isc.Canvas).addProperties(highchartsCanvasDefinition);
    }
    var HighchartsCanvas = defineHighchartsCanvas();

    // *** LABORATORIOS ***

    var labViewCreators = {

        simpleControlSubclassing: function (container) {
            return GridPropiedades.create({
                autoDraw: false,
                width: 500,
                height: 200,
                data: models.propiedadesConfig(config.props),

                propiedadClick: function (prop) {
                    //isc.say("Doble click sobre grid " + this.ID + ":<br/>" + prop.propiedad + "=" + prop.valor);
                    wrapperapi.showAlert("Doble click sobre grid " + this.ID + ":\n" + prop.propiedad + "=" + prop.valor);
                }
            });
        },

        mvpDynamic: function (container) {
            var view = DynamicMVPView.create({});
            DynamicMVPPresenter.create({view: view});
            return view;
        },

        creationPerformance: function (container) {
            return ControlCreationView.create({});
        },

        reusableLayout: function (container) {
            return ReusableLayoutView.create({});
        },

        externalSite: function (container) {
            return ExternalSitesView.create({});
        },

        requirejsDynLoad: function (container) {
            return RequireJsDynLoadView.create({});
        },

        viewLoaderDemo: function (container) {
            var viewLoader = isc.ViewLoader.create({
                autoDraw: false,
                loadingMessage: i18n.viewLoaderDemo.loadingMessage
            });
            var labView = isc.VLayout.create({
                width: "100%",
                height: "100%",
                membersMargin: 8,
                members: [
                    isc.Button.create({
                        autoDraw: false,
                        title: i18n.viewLoaderDemo.loadButtonTitle,
                        click: function () {
                            viewLoader.setViewURL("app/view/dynamic_view.js");
                        }
                    }),
                    viewLoader
                ]
            });
            return labView;
        },

        treeDemo: function (container) {
            var tree = models.hier.createTree(),
                treeGrid = isc.TreeGrid.create({
                    autoDraw: false,
                    width: "100%",
                    height: "100%",
                    data: tree,
                    fields: [
                        {name: "className", title: i18n.treeDemo.classNameTitle, treeField: true}
                    ]
                });
            treeGrid.sort("className", "ascending");
            return treeGrid;
        },

        sqlTableCRUD: function (container) {
            return SqlTableCrudView.create({
                dataSource: models.ds.usuariosDS,
                fields:[
                    //{name:"Id"},
                    {name:"Nombre"},
                    {name:"Version", width: 40},
                    {name:"Fecha_alta"},
                    {name:"Email"}
                ]});
        },

        springDataSource: function (container) {
            return SqlTableCrudView.create({
                dataSource: module.sampleDataDS,
                fields:[
//                    {
//                        type:"integer",
//                        title:"Id",
//                        name:"id",
//                        primaryKey:true,
//                        autoGenerated:true,
//                        hidden:true
//                    },
                    {
                        type:"text",
                        title:"Texto",
                        name:"text"
                    },
                    {
                        type:"double",
                        title:"Numero",
                        name:"number"
                    },
                    {
                        type:"date",
                        title:"Fecha",
                        name:"date"
                    }
                ]
            });
        },

        dataBinding: function (container) {
            var grid = isc.ListGrid.create({
                    ID: "databGrid",
                    autoDraw: false,
                    width: 600,
                    height: 200,
                    dataSource: labsDS,
                    autoFetchData: true,
                    showFilterEditor: true,
                    //canEdit: true,
                    //canRemoveRecords: true,
                    recordClick: function (viewer, record, rowNum, field, fieldNum, value, rawValue) {
                        editRecord();
                    }
                }),
                form = isc.DynamicForm.create({
                    ID: "databForm",
                    autoDraw: false,
                    dataSource: labsDS,
                    disabled: true
                }),
                details = isc.DetailViewer.create({
                    ID: "databDetails",
                    autoDraw: false,
                    width: 280,
                    dataSource: labsDS,
                    showEmptyMessage: false
                }),
                saveButton = isc.Button.create({
                    autoDraw: false,
                    title: "Guardar",
                    disabled: true,
                    click: function () {
                        saveRecord();
                    }
                }),
                addNewButton = isc.Button.create({
                    autoDraw: false,
                    title: "Nuevo",
                    width: 60,
                    click: function () {
                        editNewRecord();
                    }
                }),
                removeButton = isc.Button.create({
                    autoDraw: false,
                    title: "Eliminar",
                    width: 60,
                    disabled: true,
                    click: function () {
                        if (form.isNewRecord()) {
                            disableEditing();
                            return;
                        }
                        // Si hay canvas asociado, destruirlo para no fugar memoria
                        var lab = _.where(models.labs, {id: form.getValues().id});
                        if (lab && lab[0] && lab[0].canvas) {
                            lab[0].canvas.destroy();
                            delete lab[0].canvas;
                        }
                        form.dataSource.removeData(form.getValues(), function (dsresp, data, dsreq) {
                            if (dsresp.status === 0) {
                                details.setData(null);
                                disableEditing();
                            }
                        });
                    }
                }),
                layout = isc.HStack.create({
                    width: "100%",
                    height: "100%",
                    membersMargin: 8,
                    members: [
                        grid,
                        isc.VStack.create({
                            width: 300,
                            members: [
                                form,
                                isc.HStack.create({
                                    height: 40,
                                    layoutMargin: 8,
                                    membersMargin: 4,
                                    members: [
                                        saveButton, addNewButton, removeButton
                                    ]
                                }),
                                details
                            ]
                        })
                    ]
                }),
                enableEditing = function () {
                    form.enable();
                    saveButton.enable();
                    addNewButton.disable();
                    removeButton.enable();
                },
                disableEditing = function () {
                    form.clearValues();
                    form.disable();
                    saveButton.disable();
                    addNewButton.enable();
                    removeButton.disable();
                },
                editRecord = function () {
                    form.clearErrors();
                    form.editSelectedData(grid);

                    details.viewSelectedData(grid);

                    enableEditing();
                },
                editNewRecord = function () {
                    form.editNewRecord();
                    details.setData(null);
                    enableEditing();
                    form.focusInItem(0);
                },
                saveRecord = function () {
                    form.saveData(function (dsresp, data, dsreq) {
                        if (dsresp.status === 0) {
                            details.setData(form.getValues());
                            form.clearValues();
                            disableEditing();
                        }
                    });
                };
            return layout;
        },

        dynamicContents: function (container) {
            var dynLabel = null;
            var labLayout = isc.VLayout.create({
                membersMargin: 4,
                descripcionDefaults: {
                    _constructor: isc.HTMLFlow,
                    height: 32,
                    styleName: "labExplanation",
                    contents: i18n.dynamicContents.description
//                    ,click: function () {
//                        isc.EventHandler.handleEvent(this, "customEvent", {inventado: true, contenido: this.getContents()});
//                    }
                },
//                customEvent: function (e, eventInfo) {
//                    if (eventInfo && eventInfo.contenido) {
//                        isc.say(eventInfo.contenido);
//                    }
//                },
                toolbarDefaults: {
                    _constructor: isc.Toolbar,
                    membersMargin: 4,
                    buttons: [
                        {
                            name: "create",
                            title: i18n.dynamicContents.createButtonTitle,
                            width: 60,
                            click: function () {
                                labLayout.createLabel();
                                labLayout.toolbar.getButton("destroy").enable();
                                this.disable();
                            }
                        },
                        {
                            name: "destroy",
                            title: i18n.dynamicContents.destroyButtonTitle,
                            width: 60,
                            disabled: true,
                            click: function () {
                                labLayout.destroyLabel();
                                // this.parentElement === labLayout.toolbar
                                this.parentElement.getButton("create").enable();
                                this.disable();
                            }
                        },
                        {
                            name: "cargar",
                            title: i18n.dynamicContents.loadButtonTitle,
                            autoFit: true,
                            click: function () {
                                labLayout.descripcion.setContentsURL("[APP]app/data/test/html_fragment.html");
                            }
                        },
                        {
                            name: "resetear",
                            title: i18n.dynamicContents.resetButtonTitle,
                            autoFit: true,
                            click: function () {
                                labLayout.descripcion.setContents(i18n.dynamicContents.description);
                            }
                        }
                    ]
                },
                statefulDefaults: {
                    ID: "stateful",
                    _constructor: isc.StatefulCanvas,
                    dynamicContents: true,
                    contents: "<u>StatefulCanvas</u><br/>" +
                        "actionType: ${this.getActionType()}<br/>" +
                        "state: ${this.getState()}<br/>" +
                        "selected: ${this.isSelected()}<br/>" +
                        "baseStyle: ${this.baseStyle}<br/>" +
                        "CSS style: ${this.baseStyle}${this.getStateSuffix()}",
                    redrawOnStateChange: true,
                    padding: 8,
                    border: "1px solid #8b0000",
                    baseStyle: "stateful",
                    actionType: "checkbox",
                    showRollOver: true,
                    showDown: true,
                    height: 50, // se ajustará al contenido porque overflow es "visible"
                    width: "50%"
                },
                createLabel: function () {
                    if (dynLabel) {
                        return;
                    }
                    var origin = labLayout.toolbar.getPageRect();
                    dynLabel = isc.Label.create({
                        left: origin[0],
                        top: origin[1] + origin[3] + 8,
                        width: 100,
                        height: 40,
                        styleName: "dynLabel",
                        dynamicContents: true,
                        contents: "[ ${this.getLeft()}, ${this.getTop()} ]",
                        align: "center",
                        canDragReposition: true,
                        dragAppearance: "target",
                        dragRepositionMove: "this.markForRedraw()"
                        //dragRepositionStop: "this.markForRedraw()"
                    });
                },
                destroyLabel: function () {
                    if (dynLabel) {
                        dynLabel.destroy();
                        dynLabel = null;
                    }
                },
                initWidget: function () {
                    ui.superInitWidget(this, arguments);
                    this.addAutoChild("descripcion", {});
                    this.addAutoChild("toolbar", {});
                    this.addAutoChild("stateful");
                }
            });
            return labLayout;
        },

        treeDataBinding: function (container) {
            var treeGrid = isc.TreeGrid.create({
                ID: "treeGrid",
                autoDraw: false,
                dataSource: treeDS,
                width: 600,
                height: 200,
                autoFetchData: true,
                showFilterEditor: true,
                canEdit: true,
                dataProperties: {
                    fetchMode: "local",
                    loadDataOnDemand: false,
                    isFolderProperty: "isSection",
                    keepParentsOnFilter: true
                },
                fields: [
                    {name: "title", title: "Título", treeField: true},
                    {name: "description", title: "Descripción"},
                    {name: "value", title: "Valor"}
                ]
            });
            return treeGrid;
        },

        windowDemo: function (container) {
            var form = isc.DynamicForm.create({
                autoDraw: false,
                fields:[
                    {
                        defaultValue: "Sample Form",
                        type: "header"
                    },
                    {
                        title:"Code",
                        name:"countryCode",
                        type:"text",
                        required:true
                    },
                    {
                        title:"Country",
                        name:"countryName",
                        type:"text",
                        required:true
                    },
                    {
                        title:"Capital",
                        name:"capital",
                        type:"text"
                    },
                    {
                        title:"Government",
                        name:"government",
                        length:500,
                        type:"text"
                    },
                    {
                        title:"Continent",
                        visible: false,
                        valueMap:[
                            "Europe",
                            "Asia",
                            "North America",
                            "Australia/Oceania",
                            "South America",
                            "Africa"
                        ],
                        name:"continent",
                        type:"text"
                    },
                    {
                        title:"G8",
                        visible: false,
                        name:"member_g8",
                        type:"boolean"
                    },
                    {
                        title:"Nationhood",
                        visible: false,
                        name:"independence",
                        type:"date"
                    },
                    {
                        title:"Area (km&sup2;)",
                        visible: false,
                        name:"area",
                        type:"float"
                    },
                    {
                        title:"Population",
                        visible: false,
                        name:"population",
                        type:"integer"
                    },
                    {
                        title:"GDP ($M)",
                        visible: false,
                        name:"gdp",
                        type:"float"
                    }
                ]
            });
            var toggleButton = isc.Button.create({
                title: i18n.windowDemo.expand,
                click: function () {
                    var formItems = form.getItems();
                    var findField = function (name) {
                        var index = -1;
                        var field = _.find(formItems, function (item, ndx) {
                            index = ndx;
                            return item.name === name;
                        });
                        return {field: field, index: index};
                    };
                    var continentField = findField("continent");
                    var accion = this.title === i18n.windowDemo.expand? "show" : "hide";
                    for (var i = continentField.index; i < formItems.length; i++) {
                        formItems[i][accion]();
                    }
                    this.setTitle(accion === "show"? i18n.windowDemo.contract : i18n.windowDemo.expand);
                }
            });
            var toolbar = isc.HStack.create({
                autoDraw: false,
                width: "100%",
                height: 28,
                align: "center",
                defaultLayoutAlign: "center",
                membersMargin: 8,
                members: [
                    toggleButton,
                    isc.Button.create({
                        autoDraw: false,
                        title: i18n.windowDemo.close,
                        click: function () {
                            win.hide();
                        }
                    })
                ]
            });
            var vlayout = isc.VStack.create({
                autoDraw: false,
                overflow: "visible",
                height: 20,
                width: "100%",
                defaultLayoutAlign: "center",
                membersMargin: 4,
                layoutMargin: 4,
                members: [
                    form,
                    toolbar
                ]
            });
            var win = isc.Window.create({
                title: i18n.windowDemo.title,
                autoDraw: false,
                autoSize: true,
                //autoCenter: true,
                width: 310,
                isModal: true,
                showModalMask: true,
                items: [
                    vlayout
                ],
                show: function () {
                    this.moveTo(button.getPageLeft() + 200, button.getPageTop());
                    this.Super("show", arguments);
                    delete this.show;
                }
            });
            var button = isc.Button.create({
                title: i18n.windowDemo.showButton,
                click: function () {
                    win.show();
                }
            });
            return button;
        },

        listGridDemo: function (container) {
            var booleanWithValueIcons = false;
            var acciones = ["imprimir", "guardar", "buscar", "rehacer", "deshacer"];
            var siguienteAccion = function (accion) {
                var ndx = _.indexOf(acciones, accion) + 1;
                return acciones[ndx % acciones.length];
            };
            var gridData = function () {
                var data = [],
                    enlaces = ["http://www.cepsa.com/", "http://www.google.es/", "http://www.wikipedia.org/", "http://www.infoq.com/"],
                    textoEnlaces = ["cepsa", "google", "wikipedia", "infoq"],
                    linkIndex,
                    i;
                for (i = 0; i < 50; i++) {
                    linkIndex = _.random(0, enlaces.length - 1);
                    data.push({
                        text: "Ejemplo " + (i + 1),
                        integer: Math.round(Math.random() * (i + 100)),
                        float: Math.round(Math.random() * 10000) / 100,
                        date: moment().
                            subtract('months', Math.round(Math.random() * 12)).
                            add('days', Math.round(Math.random() * 15)).
                            toDate(),
                        time: moment().
                            subtract('hours', Math.round(Math.random() * 12)).
                            add('minutes', Math.round(Math.random() * 60)).
                            add('seconds', Math.round(Math.random() * 60)).
                            toDate(),
                        boolean: Math.random() < 0.5,
                        link: enlaces[linkIndex],
                        linkText: textoEnlaces[linkIndex],
                        action: acciones[_.random(0, acciones.length - 1)]
                    });
                }
                return data;
            };
            var gridFields = function () {
                var fields = [
                    {name: "text"},
                    {name: "integer", type: 'integer',
                        editorType: 'spinner',
                        autoFitWidth: true, autoFitWidthApproach: 'title'},
                    {name: "float", type: 'float',
                        autoFitWidth: true, autoFitWidthApproach: 'title'},
                    {name: "date", type: 'date'},
                    {name: "time", type: 'time'},
                    {name: "boolean", type: 'boolean'},
                    {name: "link", type: 'link'},
                    {
                        name: "icon",
                        title: "icon",
                        type: 'icon',
                        icon: "[SKIN]/headerIcons/settings.png",
                        canEdit: false,
                        recordClick: "isc.say('Configurar ' + record.text)",
                        showHover: true,
                        hoverHTML: function (record, value, rowNum, colNum, grid) {
                            return "Configuración del registro<br/><strong>" + record.text + "</strong>";
                        } /*,
                        formatCellValue: function (value, record, rowNum, colNum, grid) {
                            return "<button class='button'>Config.</button>";
                        } */
                    },
                    {
                        name: "action",
                        title: "valueIcons",
                        valueIcons: {
                            imprimir: "[SKINIMG]/actions/print.png",
                            guardar: "[SKINIMG]/actions/save.png",
                            buscar: "[SKINIMG]/actions/search.png",
                            rehacer: "[SKINIMG]/actions/redo.png",
                            deshacer: "[SKINIMG]/actions/undo.png"
                        },
                        //showValueIconOnly: true,
                        //canEdit: false,
                        editorType: "select",
                        editorValueMap: acciones,
                        recordClick: function (viewer, record, recordNum, field, fieldNum, value, rawValue) {
                            record.action = siguienteAccion(rawValue);
                            viewer.refreshCell(recordNum, fieldNum);
                        }
                    },
                    {
                        name: "summary",
                        type: "summary",
                        recordSummaryFunction: "record.integer + record.float", //"sum",
                        formatCellValue: "value.toCurrencyString('')",
                        align: "right",
                        sortNormalizer: function (record, fieldName, context) {
                            return record.integer + record.float;
                        },
                        showHover: true,
                        hoverHTML: "return 'Suma de los campos integer y float';",
                        baseStyle: "labRecordSummaryCell"
                    }
                ];
                if (booleanWithValueIcons) {
                    var booleanField = _.where(fields, {name: "boolean"})[0];
                    booleanField.valueIcons = {
                        "false": "[SKINIMG]/actions/exclamation.png",
                        "true": "[SKINIMG]/actions/accept.png"
                    };
                    booleanField.showValueIconOnly = true;
                }
                return fields;
            };
            var gridProps = function () {
                return {
                    autoDraw: false,
                    width: 700,
                    height: 201,
                    canEdit: true,
                    autoFitData: "vertical",
                    autoFitMaxRecords: 10,
                    //booleanTrueImage: "[SKINIMG]/actions/accept.png",
                    //booleanFalseImage: "[SKINIMG]/actions/exclamation.png",
                    fields: gridFields(),
                    data: gridData()
                };
            };
            var createGrid = function () {
                return isc.ListGrid.create(gridProps());
            };
            var grid;
            var createToolbar = function () {
                var tbar = isc.HStack.create({
                    autoDraw: false,
                    members: [
                        isc.ImgButton.create({
                            autoDraw: false,
                            width: 22,
                            height: 22,
                            imageType: "center",
                            src: "[SKIN]/FileBrowser/refresh.png",
                            showRollOver: false,
                            showDown: false,
                            click: function () {
                                refreshGrid();
                            },
                            canHover: true,
                            getHoverHTML: function () {
                                return "Recrear el ListGrid";
                            }
                        }),
                        isc.DynamicForm.create({
                            autoDraw: false,
                            colWidths: [0, 150],
                            fields: [
                                {
                                    name: "useValueIcons",
                                    type: "checkbox",
                                    title: "boolean con valueIcons",
                                    value: booleanWithValueIcons,
                                    changed: function (form, item, value) {
                                        booleanWithValueIcons = value;
                                    }
                                }
                            ]
                        }),
                        isc.Button.create({
                            autoDraw: false,
                            title: "Exportar datos",
                            click: function () {
                                exportGrid();
                            }
                        })
                    ]
                });
                return tbar;
            };
            var toolbar;
            var layout = isc.VStack.create({
                autoDraw: false,
                width: "100%",
                overflow: "auto",
                membersMargin: 8,

                initWidget: function () {
                    ui.superInitWidget(this, arguments);
                    grid = createGrid();
                    toolbar = createToolbar();
                    this.addMembers([grid, toolbar]);
                }
            });
            var refreshGrid = function () {
                layout.removeMember(0);
                grid.destroy();
                grid = createGrid();
                layout.addMember(grid, 0);
            };
            var exportGrid = function () {
                grid.exportClientData({
                    exportAs: 'ooxml',
                    exportToClient: true,
                    exportDisplay: 'window',
                    exportFilename: "prueba-export-cliente"
                });
            };
            return layout;
        },

        eventBusDemo: function (container) {
            return isc.DynamicForm.create({
                width: 300,
                numCols: 3,
                colWidths: [100, 54, "*"],
                fields: [
                    {
                        name: "labIndex",
                        type: 'integer',
                        editorType: 'spinner',
                        min: 0,
                        max: module.labs.length - 1,
                        value: 0,
                        title: "Nº de lab",
                        width: 50
                    },
                    {
                        name: "btnIr",
                        type: 'button',
                        title: "Ir",
                        width: 50,
                        startRow: false,
                        endRow: false,
                        click: function () {
                            var labIndex = this.form.getValue("labIndex");
                            events.labRequested.dispatch(labIndex);
                            //isc.Event.handleEvent(this, "someLabRequested", {src: this.form, index: labIndex});
                        }
                    }
                ]
            });
        },

        highchartsDemo: function (container) {
            var chart = HighchartsCanvas.create({
                autoDraw: false,
                redrawOnResize: true,
                width: 600,
                height: 400,
                highcharts: {
                    chart: {
                        type: 'column',
                        borderWidth: 3,
                        events: {
                            click: function () {
                                // Actualiza los valores de las series con números aleatorios entre 0 y 10
                                var series = this.series,
                                    numPoints = series[0].points.length,
                                    someValue = function () {
                                        return Math.round(Math.random() * 10);
                                    },
                                    i,
                                    pt1,
                                    pt2,
                                    avg;
                                for (i = 0; i < numPoints; i++) {
                                    pt1 = someValue();
                                    pt2 = someValue();
                                    avg = (pt1 + pt2) / 2;
                                    series[0].points[i].update(pt1);
                                    series[1].points[i].update(pt2);
                                    series[2].points[i].update(avg);
                                }
                            }
                        }
                    },
                    title: {
                        text: i18n.highchartsDemo.title
                    },
                    xAxis: {
                        categories: i18n.highchartsDemo.categories
                    },
                    yAxis: {
                        title: {
                            text: i18n.highchartsDemo.yAxisTitle
                        }
                    },
                    series: [
                        {
                            name: i18n.highchartsDemo.seriesNames[0],
                            data: [4, 5, 1]
                        },
                        {
                            name: i18n.highchartsDemo.seriesNames[1],
                            data: [5, 3, 7]
                        },
                        {
                            name: i18n.highchartsDemo.seriesNames[2],
                            data: [4.5, 4, 4],
                            type: 'spline'
                        }
                    ]
                }
            });
            return chart;
        },

        todoSample: function (container) {
            var EMPTY_TASK_MSG = i18n.todoSample.emptyTaskMessage,
                todoList = todos.createTodoList(),
                pendingRemovals = _.template(i18n.todoSample.clearCompletedItemsTemplate);

            var layout = isc.VLayout.create({
                autoDraw: false,
                width: 522,

                titleDefaults: {
                    _constructor: isc.Label,
                    width: "100%",
                    height: 48,
                    align: "center",
                    contents: i18n.todoSample.title,
                    wrap: false,
                    styleName: "apptitle"
                },

                formDefaults: {
                    _constructor: isc.DynamicForm,
                    width: "100%",
                    numCols: 3,
                    fields: [
                        {
                            name: "newTask",
                            type: "text",
                            emptyDisplayValue: EMPTY_TASK_MSG,
                            selectOnFocus: true,
                            showTitle: false,
                            colSpan: 3,
                            width: "100%",
                            textBoxStyle: "apptitle",
                            editorEnter: function (form, item, value) {
                                if (item.getDisplayValue() === item.emptyDisplayValue) {
                                    item.emptyDisplayValue = "";
                                    item.setValue("");
                                    form.markForRedraw();
                                }
                            },
                            editorExit: function (form, item, value) {
                                if (!item.getValue()) {
                                    item.emptyDisplayValue = EMPTY_TASK_MSG;
                                    form.markForRedraw();
                                }
                            }
                        },
                        {
                            name: "markAll",
                            height: 22,
                            type: "checkbox",
                            title: i18n.todoSample.markAllTitle,
                            colSpan: 2,
                            showTitle: false,
                            changed: function (form, item, value) {
                                this.form.parentElement.todosGrid.markAll(value);
                            }
                        },
                        {
                            name: "removeCompleted",
                            type: "button",
                            title: "",
                            visible: false,
                            startRow: false,
                            endRow: false,
                            colSpan: 1,
                            width: "*",
                            click: function () {
                                this.form.parentElement.todosGrid.removeCompleted();
                                this.form.getItem("markAll").setValue(false);
                            }
                        }
                    ],
                    saveOnEnter: true,
                    submit: function () {
                        var newTask = this.getItem("newTask");
                        var txt = newTask.getValue();
                        if (txt !== "") {
                            // Save Item
                            this.parentElement.todosGrid.addData(todos.createTodo({text: txt}));
                            // Init text entry item
                            newTask.setValue("");
                        }
                    }
                },

                spacerDefaults: {
                    _constructor: isc.LayoutSpacer,
                    height: 12
                },

                initWidget: function () {
                    var that = this;
                    ui.superInitWidget(that, arguments);

                    this.addAutoChild("title");
                    this.addAutoChild("form");
                    this.addAutoChild("spacer");
                    this.todosGrid = todos.createTodoView(todoList, {
                        width: 522,
                        height: "*"
                    });
                    this.addMember(this.todosGrid);

                    this.todosGrid.todosUpdated.add(function (ev) {
                        var boton = that.form.getItem("removeCompleted");
                        boton.setTitle(pendingRemovals({numCompleted: ev.numCompleted}));
                        boton[ev.numCompleted > 0? "show" : "hide"]();
                    });
                },

                destroy: function () {
                    if (this.todosGrid && this.todosGrid.dataSource && this.todosGrid.dataSource.todosUpdated) {
                        this.todosGrid.dataSource.todosUpdated.dispose();
                    }
                    this.Super("destroy", arguments);
                }
            });

            layout.todosGrid.addData(todos.createTodo({text: "Start learning Backbone", done: true}));
            layout.todosGrid.addData(todos.createTodo({text: "Start learning AngularJS"}));
            layout.todosGrid.addData(todos.createTodo({text: "Start writing a Todo sample app using SmartClient", done: true}));
            layout.todosGrid.addData(todos.createTodo({text: "Finish the Todo sample app"}));

            return layout;
        },

        wrapperapiSample: function (container) {
            var layout = isc.VLayout.create({
                autoDraw: false,

                soundButtonDefaults: {
                    _constructor: isc.IButton,
                    autoFit: true,
                    title: i18n.wrapperapiSample.soundButtonTitle,
                    click: function () {
                        wrapperapi.playSound("outofspec");
                    }
                },

                delayedShowOnTopFormDefaults: {
                    _constructor: isc.DynamicForm,
                    fields: [
                        {
                            name: "delayInSeconds",
                            title: i18n.wrapperapiSample.delayInSecondsTitle,
                            type: "integer",
                            editorType: "spinner",
                            defaultValue: 5,
                            min: 1, max: 10, step: 1,
                            width: 50
                        },
                        {
                            name: "showOnTopButton",
                            title: i18n.wrapperapiSample.showOnTopButtonTitle,
                            type: "button",
                            click: function (form, item) {
                                var seconds = form.getItem("delayInSeconds").getValue();
                                isc.Timer.setTimeout(function () {
                                    wrapperapi.showOnTop(seconds * 1);
                                    wrapperapi.playSound("horse");
                                }, seconds * 1000);
                            }
                        }
                    ]
                },

                initWidget: function () {
                    ui.superInitWidget(this, arguments);
                    this.addAutoChild("soundButton");
                    this.addAutoChild("delayedShowOnTopForm");
                }
            });
            return layout;
        },

        longrunTest: function (container) {
            var MAX_ITERATIONS = 5000000;
            var countLabelTemplate = _.template(i18n.longrunTest.countLabel, null, {variable: "data"});
            var labLayout = isc.VLayout.create({
                autoDraw: false,
                membersMargin: 4,

                descriptionDefaults: {
                    _constructor: isc.HTMLFlow,
                    height: 32,
                    styleName: "labExplanation",
                    contents: i18n.longrunTest.description
                },

                toolbarDefaults: {
                    _constructor: isc.Toolbar,
                    membersMargin: 4,
                    buttons: [
                        {
                            name: "badButton",
                            title: i18n.longrunTest.badButton,
                            width: 180,
                            click: function () {
                                labLayout.count(MAX_ITERATIONS);
                            }
                        },
                        {
                            name: "goodButton",
                            title: i18n.longrunTest.goodButton,
                            width: 180,
                            click: function () {
                                labLayout.count2(MAX_ITERATIONS);
                            }
                        },
                        {
                            name: "cancelButton",
                            title: i18n.longrunTest.cancelButton,
                            width: 180,
                            click: function () {
                                labLayout.cancelCount();
                            }
                        }
                    ]
                },

                countLabelDefaults: {
                    _constructor: isc.Label,
                    height: 30,
                    autoFit: true,
                    wrap: false,

                    updateCount: function (n) {
                        this.setContents(countLabelTemplate({count: n}));
                    }
                },

                cancelled: false,

                count: function (limit) {
                    var i;
                    this.cancelled = false;
                    for (i = 0; i < limit; i++) {
                        // useless
                        if (i % 1000 === 0) {
                            this.countLabel.updateCount(i);
                        }
                        // useless
                        if (this.cancelled) {
                            this.countLabel.updateCount(i);
                            return;
                        }
                    }
                    this.countLabel.updateCount(limit);
                },

                count2: function (limit) {
                    var that = this;
                    that.cancelled = false;

                    function countBlock(start, blockSize, limit) {
                        var i,
                            n,
                            finished;
                        for (i = 0; i < blockSize; i++) {
                            n = start + i;
                            finished = that.cancelled || n >= limit;
                            if (finished) {
                                that.countLabel.updateCount(n);
                                return;
                            }
                            if (n % blockSize === 0) {
                                that.countLabel.updateCount(n);
                            }
                        }
                        if (!finished) {
                            _.defer(countBlock, n, blockSize, limit);
                        }
                    }

                    countBlock(0, 5000, limit);
                },

                cancelCount: function () {
                    this.cancelled = true;
                    this.countLabel.updateCount(0);
                },

                initWidget: function () {
                    ui.superInitWidget(this, arguments);

                    this.addAutoChild("description");
                    this.addAutoChild("toolbar");
                    this.addAutoChild("countLabel");
                    this.countLabel.updateCount(0);
                }
            });

            return labLayout;
        }
    };

    function labTitle(lab) {
        return lab.title || i18n.lab_titles[lab.id] || lab.id;
    }

    function createLabCanvas(lab, container) {
        var canvasCreationFn = labViewCreators[lab.fn];
        lab.canvas = canvasCreationFn.call(lab, container);
    }

    function makeLab(id, canvasCreationFname) {
        var lab = {
            id: id,
            fn: canvasCreationFname || id
        };
        lab.title = labTitle(lab);
        return lab;
    }

    var labs = [
        makeLab("simpleControlSubclassing"),
        makeLab("mvpDynamic"),
        makeLab("creationPerformance"),
        makeLab("reusableLayout"),
        makeLab("externalSite"),
        makeLab("requirejsDynLoad"),
        makeLab("viewLoaderDemo"),
        makeLab("treeDemo"),
        makeLab("sqlTableCRUD"),
        makeLab("springDataSource"),
        makeLab("dataBinding"),
        makeLab("dynamicContents"),
        makeLab("treeDataBinding"),
        makeLab("windowDemo"),
        makeLab("listGridDemo"),
        makeLab("eventBusDemo"),
        makeLab("highchartsDemo"),
        makeLab("todoSample"),
        makeLab("wrapperapiSample"),
        makeLab("longrunTest")
    ];

    var labsDS = isc.DataSource.create({
        clientOnly: true,
        fields: [
            {name: "id", type: "text", length: 50, primaryKey: true},
            {name: "title", type: "text", length: 50},
            {name: "fn", title: "Function Name", type: "text", length: 50}
        ],
        cacheData: labs
    });

    var treeDS = isc.DataSource.create({
        clientOnly: true,
        dataURL: APPINIT.path.testData + "tree_data.json",
        fields: [
            {name: "idNode", type: "integer", primaryKey: true},
            {name: "parentId", type: "integer", foreignKey: "idNode"},
            {name: "title"},
            {name: "description"},
            {name: "value"},
            {name: "isSection"}
        ]
    });

    rpc.loadDS("sampleDataDS").then(function (dsNames) {
        //console.log(dsNames);
        module.sampleDataDS = isc.DataSource.get("sampleDataDS");
    });

//    var sampleDataDS = isc.RestDataSource.create({
//        allowAdvancedCriteria:true,
//        operationBindings:[
//            {
//                operationType:"fetch"
//            }
//        ],
//        fields:[
//            {
//                type:"text",
//                title:"Texto",
//                name:"text"
//            },
//            {
//                type:"double",
//                title:"Numero",
//                name:"number"
//            },
//            {
//                type:"date",
//                title:"Fecha",
//                name:"date"
//            }
//        ],
//        ID:"sampleDataDS",
//        dataURL: config.getProperty("restURL"),
//        dataFormat: "json",
//        jsonPrefix: "",
//        jsonSuffix: ""
//    });

    module = {
        labs: labs,
        createCanvas: createLabCanvas,
        ds: labsDS,
        GridPropiedades: GridPropiedades,
        HighchartsCanvas: HighchartsCanvas
        //sampleDataDS: sampleDataDS
    };

    return module;
});