"use strict";
var myApp = angular.module("myApp", [
    "ui.router",
    "ui.mask",
    "ngStorage",
    "Alertify"
]);

myApp.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/sprint");
    $stateProvider.state({
        name: "main",
        url: "",
        templateUrl: "app/app.html",
        abstract: true
    });
    $stateProvider.state({
        name: "main.sprint",
        url: "/sprint",
        templateUrl: "app/sprint.controller.html",
        controller: "SprintController",
        controllerAs: "model"
    });
    $stateProvider.state({
        name: "main.timesheet",
        url: "/timesheet",
        templateUrl: "app/timesheet.controller.html",
        controller: "TimesheetController",
        controllerAs: "model"
    });
}]);

myApp.run(["$rootScope", "Alertify", function($rootScope, Alertify){
    $rootScope.alertify = Alertify;
}]);




