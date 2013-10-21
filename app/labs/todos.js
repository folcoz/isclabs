/*global define, isc */

/**
 * Module to support a to-dos list
 */
define(['underscore', 'signals'], function (_, Signal) {
    'use strict';

    var counter = 0;

    function fireSignal(signal, target, todos, numCompleted) {
        signal.dispatch({
            target: target,
            todos: todos,
            numCompleted: numCompleted
        });
    }

    function createTodo(spec) {
        return {
            id: spec.id || counter++,
            done: spec.done || false,
            text: spec.text || "Some unspecified task"
        };
    }

    function updateFunctionWrapper (updateFunctionName) {
        return function () {
            var args = _.toArray(arguments),
                callback = args[1],
                that = this;

            //console.log(this.ID + "." + updateFunctionName + "()");
            args[1] = function (dsResp, data, dsReq) {
                // invoke original callback
                if (callback) {
                    //console.log("Firing " + updateFunctionName + "() callback");
                    isc.Class.fireCallback(callback, "dsResponse, data, dsRequest", [dsResp, data, dsReq], that);
                }
                // then invoke signal
                //console.log(this.ID + ".todosUpdated.dispatch() [" + updateFunctionName + "]");
                fireSignal(that.todosUpdated, that, that.data.getAllRows(), that.numCompleted());
            };

            this.Super(updateFunctionName, args);
        };
    }

    function createTodoList(data) {

        var ds = isc.DataSource.create({
            clientOnly: true,
            fields: [
                {name: "id", type: "integer", primaryKey: true, hidden: true},
                {name: "done", type: "boolean", title: "Done"},
                {name: "text", required: true, title: "Todo"}
            ],
            cacheData: data || [],

            markAll: function (flag) {
                var that = this;
                _.each(this.cacheData, function (item) {
                    item.done = flag;
                    that.updateData(item);
                });
            },

            removeCompleted: function () {
                var that = this;
                _.each(this.cacheData, function (item) {
                    if (item.done) {
                        that.removeData(item);
                    }
                });
            },

            numCompleted: function () {
                return _.filter(this.cacheData, {done: true}).length;
            }

        });
        return ds;
    }

    function createTodoView(todoListDS, spec) {
        var defSpec = {
            dataSource: todoListDS,
            autoDraw: false,
            autoFetchData: true,
            width: 600,
            height: 400,
            showHeader: false,
            cellHeight: 40,
            canEdit: true,
            canRemoveRecords: true,
            border: "0px",
            alternateRecordStyles: false,
            leaveScrollbarGap: false,
            fields: [
                {name: "done"},
                {
                    name: "text",
                    formatCellValue: function (value, record, rowNum, colNum, grid) {
                        if (record.done) {
                            return "<span class='tachado'>" + value + "</span>";
                        }
                        else {
                            return value;
                        }
                    },
                    editorProperties: {
                        height: 36
                    }
                }
            ],
            todosUpdated: new Signal(),

            updateData: updateFunctionWrapper("updateData"),
            addData: updateFunctionWrapper("addData"),
            removeData: updateFunctionWrapper("removeData"),

            saveEdits: function (editCompletionEvent, callback, rowNum) {
                var that = this;
                //console.log(this.ID + ".saveEdits(" + editCompletionEvent + ", " + (callback? "callback" : null) + ", " + rowNum + ")");
                this.Super("saveEdits", [
                    editCompletionEvent,
                    function (rowNum, colNum, editCompletionEvent, success) {
                        //console.log("saveEdits called back! numCompleted = " + that.numCompleted());
                        if (success) {
                            fireSignal(that.todosUpdated, that, that.data.getAllRows(), that.numCompleted());
                        }
                    },
                    rowNum
                ]);
            },

            markAll: function (flag) {
                var that = this;
                _.each(this.data.getAllRows(), function (item) {
                    item.done = flag;
                    that.updateData(item);
                });
            },

            removeCompleted: function () {
                var that = this;
                _.each(this.data.getAllRows(), function (item) {
                    if (item.done) {
                        that.removeData(item);
                    }
                });
            },

            numCompleted: function () {
                return this.dataSource.numCompleted();
            }

        };
        return isc.ListGrid.create(isc.addProperties(defSpec, spec));
    }

    return {
        createTodo: createTodo,
        createTodoList: createTodoList,
        createTodoView: createTodoView
    };
});