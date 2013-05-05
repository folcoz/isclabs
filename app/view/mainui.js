/**
 * Módulo IU principal.
 * Define controles/layouts y funciones relacionadas.
 */
define(['underscore', 'i18n'], function (_, i18n) {

    var module = {};

    function createMainHeader(spec) {
        var mainHeaderProps = {
            height:34,
            defaultLayoutAlign:"center",

            logoDefaults: {
                _constructor: isc.Img,
                width: 123, height: 35,
                src: "logo.png"
            },

            leftAreaDefaults: {
                _constructor: isc.LayoutSpacer,
                width: 20
            },

            rightAreaDefaults: {
                _constructor: isc.LayoutSpacer,
                width: "*"
            },

            apptitleDefaults: {
                _constructor: isc.Label,
                autoFit: true,
                wrap: false,
                styleName: "apptitle"
            },

            userlabelDefaults: {
                _constructor: isc.Label,
                dynamicContents: true,
                contents: i18n.userid_text,
                styleName: "username",
                align: "right",
                autoFit: true,
                wrap: false
            },

            initWidget:function () {
                this.Super("initWidget", arguments);

                this.title = this.title || i18n.appname;
                this.username = this.username || i18n.unknown_user;

                this.addAutoChild("logo", {});
                this.addAutoChild("leftArea", {});
                this.addAutoChild("apptitle", {contents: this.title});
                this.addAutoChild("rightArea", {});
                this.addAutoChild("userlabel", {username: this.username});
            },

            setTitle:function (title) {
                this.title = title;
                if (this.apptitle) {
                    this.apptitle.setContents(title);
                }
            },

            setUsername:function (username) {
                if (this.userlabel) {
                    this.userlabel.username = username;
                    this.userlabel.markForRedraw();
                }
            }
        };
        return isc.HLayout.create(mainHeaderProps, spec);
    }

    function defineTitledPane() {
        var titledPaneClass = isc.ClassFactory.defineClass("AppTitledPane", isc.VLayout),
            addPaneMember = function (me) {
                me.pane.setProperties({width:"100%", height:"*", overflow:'hidden'});
                me.addMember(me.pane);
            },
            titledPaneClassDef = {
                titleLabelDefaults:{
                    _constructor:isc.Label,
                    wrap:false,
                    height:32
                },

                initWidget:function () {
                    this.Super("initWidget", arguments);

                    this.addAutoChild("titleLabel", {
                        contents:this.title || i18n.untitled,
                        styleName:this.titleStyleName
                    });

                    if (this.pane) {
                        addPaneMember(this);
                    }
                },

                setTitle:function (text) {
                    this.title = text;
                    if (this.titleLabel) {
                        this.titleLabel.setContents(text);
                    }
                },

                /**
                 * Establece el control de contenido (debe heredar de Canvas)
                 * @param canvas Control con el contenido.
                 * @param autoDestroyOldPane Pasar true para destruir automáticamente
                 * el antiguo control de contenido.
                 */
                setPane:function (canvas, autoDestroyOldPane) {
                    if (this.pane) {
                        this.removeMember(this.pane);
                        if (autoDestroyOldPane) {
                            this.pane.destroy();
                        }
                        this.pane = null;
                    }
                    if (isc.isA.Instance(canvas) && canvas.isA('Canvas')) {
                        this.pane = canvas;
                        //this._addPane();
                        addPaneMember(this);
                    }
                }
            };
        titledPaneClass.addProperties(titledPaneClassDef);
        return titledPaneClass;
    }
    module.TitledPane = defineTitledPane();

    function createLabNavigator(spec) {
        var labNavigatorProps = {
            autoDraw: false,
            width: "20%",
            height: "100%",
            showResizeBar: true,
            title: i18n.labs_nav_title,
            labSelected: spec.labSelected,

            labsListDefaults: {
                _constructor: isc.ListGrid,
                showHeader: false,
                leaveScrollbarGap: false,
                alternateRecordStyles: false,
                selectionType: 'single',
                border: "0px",
                cellHeight: 26,
                defaultFields:[
                    {name:"title"}
//                    ,{name:"cosa"}
                ],

                selectionChanged: function (record, state) {
                    this.navigator.labSelected(record, state);
                },

                formatCellValue: function (value) {
                    return this.imgHTML("control_play.png", 16, 16) + "&nbsp;" + value;
                }
//                ,showRecordComponents: true,
//                showRecordComponentsByCell: true,
//                createRecordComponent: function (record, colNum) {
//                    var that = this;
//                    if (this.getField(colNum).name !== "cosa") return null;
//                    var comp = isc.Label.create({
//                        autoDraw: false,
//                        //backgroundColor: "yellow",
//                        contents: "=> " + record.title,
//                        wrap: false,
//                        //autoFit: true,
//                        height: 20,
//                        click: function () {
//                            that.deselectAllRecords();
//                            that.selectRecord(record);
//                        }
//                    });
//                    return comp;
//                }
            },

            initWidget: function () {
                this.Super("initWidget", arguments);

                this.labSelected = this.labSelected || function () {};

                var pane = this.addAutoChild("labsList", {navigator: this});
                this.setPane(pane);
                this.setLabs(this.labs);
            },

            setLabs: function (labs) {
                if (!labs) return;
                if (this.pane) {
                    this.pane.setData(labs);
                }
            },

            getSelectedLab: function () {
                var selection = null;
                if (this.pane) {
                    selection = this.pane.getSelectedRecord();
                }
                return selection;
            },

            selectLabByIndex: function (ndx) {
                this.pane.selectSingleRecord(this.labs[ndx]);
            }
        };
        return module.TitledPane.create(labNavigatorProps, spec);
    }

    module.buildMainUI = function (spec) {

        var mainHeader = createMainHeader({
            ID:"mainHeader",
            autoDraw:false,
            username:spec.userinfo.userid
        });

        var mainNav = createLabNavigator({
            ID: "mainNav",
            titleStyleName: "sectiontitle",
            labs: spec.labs,
            //presenter: spec.presenter,
            labSelected: spec.labSelected
        });

        var labContainer = isc.Layout.create({
            ID: "labContainer",
            width: "100%",
            height: "100%",
            styleName: "labContainer"
//            layoutLeftMargin: 8,
//            layoutRightMargin: 8,
//            layoutBottomMargin: 8
        });

        var mainContent = module.TitledPane.create({
            ID: "mainContent",
            title: i18n.no_lab_selected,
            titleStyleName: "sectiontitle",
            pane: labContainer,
            setNoLabSelectedTitle: function () {
                this.setTitle(i18n.no_lab_selected);
            }
        });

        var mainBody = isc.HLayout.create({
            ID:"mainBody",
            autoDraw:false,
            styleName: "mainBody",
            mainNav: mainNav,
            mainContent: mainContent,
            members:[
                mainNav,
                mainContent
            ]
        });

        var mainLayout = isc.VLayout.create({
            ID:"mainLayout",
            autoDraw:false,
            width:"100%",
            height:"100%",
            layoutMargin:8,
            membersMargin:8,

            presenter:spec.presenter,
            mainHeader:mainHeader,
            mainBody:mainBody,

            members:[
                mainHeader,
                mainBody
            ]
        });
        return mainLayout;
    };

    return module;
});