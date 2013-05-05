/**
 * Contiene los presenters de la aplicación
 */
define(['view/mainui', 'labs/labs', 'base/events', 'underscore'], function (mainUI, labsmodule, events, _) {

    //events.createEvent("labSelected");

    var module = {};

    function defineMainPresenter() {
        var mainPresenterClass = isc.defineClass("MainPresenter", isc.Class);
        var mainPresenterClassProperties = {

            init: function () {
                this.Super("init", arguments);

                events.labSelected.add(this.labSelected, this);
                events.labRequested.add(this.selectLabByIndex, this);
            },

            destroy: function () {
                events.labRequested.remove(this.selectLabByIndex, this);
                events.labSelected.remove(this.labSelected, this);
            },

            run: function () {
                var that = this;
                this.view = mainUI.buildMainUI({
                    presenter: this,
                    userinfo: this.userinfo,
                    labs: labsmodule.labs,
                    labSelected: function (lab, state) {
                        events.labSelected.dispatch(lab, state);
                    }
                });
                this.view.show();

//                this.view.someLabRequested = function (e, eventInfo) {
//                    that.selectLabByIndex(eventInfo.index);
//                };

            },

            createNewLab: function (lab, labContainer) {
                try {
                    labsmodule.createCanvas(lab, labContainer);
                    labContainer.addMember(lab.canvas);
                    labContainer.setVisibleMember(lab.canvas);
                    if (lab.canvas.presenter) {
                        lab.canvas.presenter.run();
                    }
                    labContainer.show();
                }
                catch (problema) {
                    labContainer.hide();
                    isc.warn("Se ha producido un error:<br/>" + problema);
                }
            },

            labSelected: function (lab, state) {
                var content = this.view.mainBody.mainContent,
                    nav = this.view.mainBody.mainNav,
                    labContainer = content.pane;

                if (state) {
                    content.setTitle(lab.title);
                    if (lab.canvas) {
                        labContainer.setVisibleMember(lab.canvas);
                        labContainer.show();
                    }
                    else {
                        this.createNewLab(lab, labContainer);
                    }
                    isc.History.addHistoryEntry(lab.id, lab.title);
                }
                else {
                    content.setNoLabSelectedTitle();
                    labContainer.hide();
                }

            },

            selectLabByIndex: function (ndx) {
                var nav = this.view.mainBody.mainNav;
                nav.selectLabByIndex(ndx);
            }

        };
        mainPresenterClass.addProperties(mainPresenterClassProperties);

        return mainPresenterClass;
    }
    module.Main = defineMainPresenter();

    return module;
});