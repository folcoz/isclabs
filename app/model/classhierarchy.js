/*global define, isc */

/**
 * Obtiene la jerarquía de clases ISC definidas.
 */
define(['underscore'], function (_) {
    'use strict';

    function classNameInfo(classObject) {
        return {
            className: classObject.getClassName(),
            superClassName: classObject.getSuperClass() ? classObject.getSuperClass().getClassName() : ""
        };
    }

    function classNameInfosArray() {
        var result = [];
        _.forOwn(isc, function (pvalue) {
            if (isc.isA.ClassObject(pvalue)) {
                result.push( classNameInfo(pvalue) );
            }
        });
        return result;
    }

    function createTree() {
        var data = classNameInfosArray();

        return isc.Tree.create({
            modelType: 'parent',
            idField: 'className',
            parentIdField: 'superClassName',
            rootValue: '',
            data: data
        });
    }

    return {
        classNames: classNameInfosArray,
        createTree: createTree
    };
});