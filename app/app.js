"use strict";
var myApp = angular.module("myApp", [
    "ui.router"
]);

myApp.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider.state({
        name: "main",
        url: "/",
        templateUrl: "app/main.controller.html",
        controller: "MainController",
        controllerAs: "model"
    });
}]);




