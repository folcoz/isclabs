
require(['base/all', 'presenter/presenters', 'labs/widgets'], function (base, presenters, widgets) {

    isc.Page.setEvent('unload', function () {
        base.events.destroy();
    }, "once");

    var runMainPresenter = function (data) {
        var mainPresenter = presenters.Main.create({
            userinfo: data
        });
        mainPresenter.run();

        base.events.labRequested.add(function (n) {
            mainPresenter.selectLabByIndex(n);
        });
    };

    base.config.asyncUserInfo().then(runMainPresenter);

});
