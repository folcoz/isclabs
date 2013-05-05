
require(['i18n', 'base/all', 'presenter/presenters', 'labs/labs', 'labs/widgets'], function (i18n, base, presenters, labs, widgets) {

    isc.Page.setTitle(i18n.appname);

    isc.Page.setEvent('unload', function () {
        base.events.destroy();
    }, "once");

    var historyPlayback = {
        fn: function (id, data) {
            //console.log(id);
            //console.log(data);
            if (id) {
                var index = base._.findIndex(labs.labs, {id: id});
                base.events.labRequested.dispatch(index);
            }
        }
    };

    isc.History.registerCallback({target: historyPlayback, method: historyPlayback.fn});

    var runMainPresenter = function (data) {
        var mainPresenter = presenters.Main.create({
            userinfo: data
        });
        mainPresenter.run();
    };

    base.config.asyncUserInfo().then(runMainPresenter);

});
