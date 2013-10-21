/**
 * Acceso a la aplicación nativa que hace de envoltorio de la aplicación JavaScript
 */
/*global define, isc */
define(['base/config'], function (config) {
    'use strict';

    function apiAvailable() {
        var apiVersion;
        if (window.external) {
            try {
                apiVersion = window.external.ApiVersion;
                return (typeof(apiVersion) === 'string');
            }
            catch (e) {
                return false;
            }
        }
        return false;
    }

    function nop() {}

    function internalShowAlert(msg) {
        var txt = msg.replace(/\n/, "<br\/>");
        isc.say(txt);
    }

    function externalShowAlert(msg) {
        window.external.ShowAlert(msg);
    }

    function externalPlaySound(soundName) {
        var soundFile = config.props.sonidos[soundName];
        if (soundFile) {
            window.external.PlaySound(soundFile);
        }
    }

    function externalShowOnTop(seconds) {
        window.external.ShowOnTop(seconds);
    }

    function externalWebAppReady() {
        window.external.WebAppReady();
    }

    function externalSetTitle(title) {
        window.external.SetTitle(title);
    }

    function internalSetTitle(title) {
        isc.Page.setTitle(title);
    }

    var module = apiAvailable()? {
        showAlert: externalShowAlert,
        playSound: externalPlaySound,
        showOnTop: externalShowOnTop,
        webAppReady: externalWebAppReady,
        setTitle: externalSetTitle
    } : {
        showAlert: internalShowAlert,
        playSound: nop,
        showOnTop: nop,
        webAppReady: nop,
        setTitle: internalSetTitle
    };

    return module;
});