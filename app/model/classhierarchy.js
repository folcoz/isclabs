/*global isc */
/**
 * Obtiene la jerarquía de clases ISC definidas.
 */
define(function () {

    function classNameInfo(classObject) {
        return {
            className: classObject.getClassName(),
            superClassName: classObject.getSuperClass() ? classObject.getSuperClass().getClassName() : ""
        };
    }

    function classNameInfosArray() {
        var pname,
            pvalue,
            result = [];
        for (pname in isc) {
            pvalue = isc[pname];
            if (isc.isA.ClassObject(pvalue)) {
                result.push( classNameInfo(pvalue) );
            }
        }
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