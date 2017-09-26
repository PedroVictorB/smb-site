(function (global) {
    'use strict';

    var CamSDK = global.CamSDK;
    // var camForm = CamSDK.Form;

    var angular = global.angular;

    var $ = angular.element;

    var camClient = new CamSDK.Client({
        mock: false,
        apiUri: '/engine-rest'
    });

    var taskService = new camClient.resource('task');

    var $formContainer = $('#form');

    var app = angular.module('example.app', ['cam.embedded.forms']);


    app.controller('appCtrl', ['$scope', function ($scope) {
        $scope.camForm = null;

        function loadTasks() {
            taskService.list({}, function (err, results) {
                if (err) {
                    throw err;
                }

                $scope.$apply(function () {
                    var tasks = results._embedded.task;
                    $scope.tasks = [];
                    for (var i = 0; i < tasks.length; i++) {
                        if(typeof tasks[i]._embedded.processDefinition != 'undefined'){
                            if (tasks[i]._embedded.processDefinition[0].resource == "smb.bpmn") {
                                $scope.tasks.push(tasks[i]);
                            }
                        }
                    }
                    // $scope.tasks = results._embedded.task;
                });
            });
        }


        function addFormButton(err, camForm) {
            if (err) {
                throw err;
            }

            // create a button element
            var $submitBtn = $('<button class="btn btn-primary" type="submit">Enviar</button>')
            // with a click handler to submit the form
                .click(function () {
                    camForm.submit(function (err) {
                        if (err) {
                            throw err;
                        }

                        // clear the form
                        $formContainer.html('');

                        loadTasks();
                    });
                });

            // and append it to the form
            camForm.formElement.append($submitBtn);
        }


        $scope.loadTaskForm = function ($event) {
            var taskId = $($event.currentTarget).attr('data-task-id');

            // clear the form container content
            $formContainer.html('');
            //Display it
            $formContainer.show();

            // loads the task form using the task ID provided
            taskService.form(taskId, function (err, taskFormInfo) {
                var url = taskFormInfo.key.replace('embedded:app:', taskFormInfo.contextPath + '/');

                new CamSDK.Form({
                    client: camClient,
                    formUrl: url,
                    taskId: taskId,
                    containerElement: $formContainer,

                    // continue the logic with the callback
                    done: addFormButton
                });
            });
        };

        // load the tasks at start
        loadTasks();
    }]);


    angular.bootstrap(document, ['example.app']);

})(this);
