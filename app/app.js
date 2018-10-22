"use strict";
var myApp = angular.module("myApp", [
    "ui.router",
    "ui.mask",
    "ngStorage",
    "Alertify",
    "ngMaterial",
    "ngMessages"
]);

myApp.config(["$stateProvider", "$urlRouterProvider", "$mdAriaProvider", function ($stateProvider, $urlRouterProvider, $mdAriaProvider) {
    $mdAriaProvider.disableWarnings();
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
        controllerAs: "model",
        onEnter: function ($state) {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    console.log(user);
                }
                else {
                    $state.go("main.login", { returnState: "main.timesheet" });
                }
            });
        }
    });
    $stateProvider.state({
        name: "main.login",
        url: "/login?returnState=",
        templateUrl: "app/login.controller.html",
        controller: "LoginController",
        controllerAs: "model"
    });
}]);

myApp.run(["$rootScope", "Alertify", "$state", function ($rootScope, Alertify, $state) {
    $rootScope.alertify = Alertify;

    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
            },
            uiShown: function () {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: "/sprint",
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID,
            firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
    };

    $rootScope.showLoginForm = function (returnState) {
        uiConfig.callbacks.signInSuccessWithAuthResult = function(){
            $state.go(returnState);
        }

        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    }
}]);




