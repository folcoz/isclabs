/*global define, isc */

/**
 * Rutinas de utilidad de la interfaz de usuario.
 */
define(['underscore'], function (_) {
    'use strict';

    var module = {};

    function escapeHTML(htmlString) {
        return _.escape(htmlString);
    }
    module.escapeHTML = escapeHTML;

    function unescapeHTML(escapedHtml) {
        return _.unescape(escapedHtml);
    }
    module.unescapeHTML = unescapeHTML;

    function findAllCanvases() {
        var r = [];
        // walk the globals, testing whether it is a Canvas
        _.forOwn(window, function (pval, pname) {
            if (isc.isA.Canvas(pval)) {
                r.push(pval);
            }
        });
        return r;
    }
    module.findAllCanvases = findAllCanvases;

    function findAllRootCanvases(spec) {
        spec = spec || {
            undrawn: false,
            hidden: false
        };
        return _.filter(findAllCanvases(), function (c) {
            return typeof c.parentElement === "undefined" &&
                (spec.undrawn? true : c.isDrawn()) &&
                (spec.hidden? true : c.isVisible());
        });
    }
    module.findAllRootCanvases = findAllRootCanvases;

    function getPresenter(canvas) {
        var p,
            i,
            parents = canvas.getParentElements();
        for (i = 0; i < parents.length; i++) {
            p = parents[i];
            if (p.presenter) {
                return p.presenter;
            }
        }
        return null;
    }
    module.getPresenter = getPresenter;

    function superInitWidget(that, argmnts) {
        var args = _.isArguments(argmnts)? Array.prototype.slice.call(argmnts, 0) : argmnts;
        that.Super("initWidget", args);
    }
    module.superInitWidget = superInitWidget;

    return module;
});