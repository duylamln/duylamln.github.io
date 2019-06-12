"use strict";
var myApp = angular.module("myApp", [
    "ui.router",
    "ui.mask",
    "ngStorage",
    "Alertify",
    "ngMaterial",
    "ngMessages",
    "cfp.hotkeys",
    "angular-loading-bar",
    "ngAnimate", 
    "ui.bootstrap"
]);

angular.element(function () {
    firebase.auth().onAuthStateChanged(function (user) {
        window.user = user;
        if (!window.bootstrapped) {
            angular.bootstrap(document, ["myApp"]);
            window.bootstrapped = true;
        }
    });
});



myApp.config(["$stateProvider", "$urlRouterProvider", "$mdAriaProvider", function ($stateProvider, $urlRouterProvider, $mdAriaProvider) {
    $mdAriaProvider.disableWarnings();
    $urlRouterProvider.otherwise("/sprint");
    $stateProvider.state({
        name: "main",
        url: "",
        templateUrl: "app/app.html",
        controller: "AppController",
        controllerAs: "model",
        abstract: true
    });
    $stateProvider.state({
        name: "main.sprint",
        url: "/sprint",
        templateUrl: "app/controllers/sprint.controller.html",
        controller: "SprintController",
        controllerAs: "model",
        title: "Sprint"
    });
    $stateProvider.state({
        name: "main.timesheet",
        url: "/timesheet",
        templateUrl: "app/controllers/timesheet.controller.html",
        controller: "TimesheetController",
        controllerAs: "model",
        requiredAuth: true
    });
    $stateProvider.state({
        name: "main.order",
        url: "/order",
        templateUrl: "app/controllers/order.controller.html",
        controller: "OrderController",
        controllerAs: "model",
        requiredAuth: true
    });
    $stateProvider.state({
        name: "main.orderDetail",
        url: "/order/:key",
        templateUrl: "app/controllers/orderDetail.controller.html",
        controller: "OrderDetailController",
        controllerAs: "model"
    });
    $stateProvider.state({
        name: "main.account",
        url: "/account",
        templateUrl: "app/controllers/account.controller.html",
        controller: "AccountController",
        controllerAs: "model",
        requiredAuth: true
    });
    $stateProvider.state({
        name: "main.login",
        url: "/login?returnState=&returnParams=",
        templateUrl: "app/controllers/login.controller.html",
        controller: "LoginController",
        controllerAs: "model"
    });
    $stateProvider.state({
        name: "main.bank",
        url: "/bank",
        templateUrl: "app/controllers/bank.controller.html",
        controller: "BankController",
        controllerAs: "model",
        requiredAuth: true
    });   
}]);

myApp.config(['$httpProvider', '$provide', function ($httpProvider, $provide) {
    $provide.factory('commonInterceptor', ["$q", "$timeout", "authenService", function ($q, $timeout, authenService) {
        var user = authenService.getCurrentUser();

        return {
            // On request success
            request: function (config) {
                if (user) {
                    config.headers.email = user.email;
                    config.headers.uid = user.uid;
                }
                return config || $q.when(config);
            },
            // On request failure
            requestError: function (rejection) {
                return $q.reject(rejection);
            },
            // On response success
            response: function (response) {
                return response || $q.when(response);
            },
            // On response failture
            responseError: function (rejection) {
                return $q.reject(rejection);
            }
        };
    }]);

    $httpProvider.interceptors.push('commonInterceptor');
}]);

myApp.run(["$rootScope", "Alertify", "$state", "$transitions", "authenService", function ($rootScope, Alertify, $state, $transitions, authenService) {
    $rootScope.alertify = Alertify;
    $rootScope.$state = $state;
    authenService.initialize();


    $transitions.onBefore({ to: "main.*" }, function (trans) {
        var stateService = trans.router.stateService;
        var targetState = trans._targetState;
        var targetStateConfig = stateService.get(targetState.identifier());
        if (!authenService.user && targetStateConfig.requiredAuth === true) {
            stateService.go("main.login", { returnState: targetState._identifier });
            return false;
        }
        return true;
    });
}]);

myApp.filter("momentDate", function () {
    return function (input, format) {
        return input.format(format);
    }
});

myApp.filter("maxLength", function () {
    return function (input, length) {
        if (!input) return input;
        var result = input.substring(0, length);
        if (input.length > length) return result += "...";
        return result;
    }
});

myApp.filter("humanize", function () {
    return function (input) {
        if (!input) return input;

        return moment.duration(input.diff(moment())).humanize() + " ago";
    }
});

myApp.filter('groupBy', function () {
    return _.memoize(function (items, field) {
        return _.groupBy(items, field);
    }
    );
});

window.copyToClipboard = function (str) {
    const el = document.createElement('textarea');  // Create a <textarea> element
    el.value = str;                                 // Set its value to the string that you want copied
    el.setAttribute('readonly', '');                // Make it readonly to be tamper-proof
    el.style.position = 'absolute';
    el.style.left = '-9999px';                      // Move outside the screen to make it invisible
    document.body.appendChild(el);                  // Append the <textarea> element to the HTML document
    const selected =
        document.getSelection().rangeCount > 0        // Check if there is any content selected previously
            ? document.getSelection().getRangeAt(0)     // Store selection if found
            : false;                                    // Mark as false to know no selection existed before
    el.select();                                    // Select the <textarea> content
    document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    document.body.removeChild(el);                  // Remove the <textarea> element
    if (selected) {                                 // If a selection existed before copying
        document.getSelection().removeAllRanges();    // Unselect everything on the HTML document
        document.getSelection().addRange(selected);   // Restore the original selection
    }
};

window.generateId = function () {
    var base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var result = "";
    var random = Math.random() * 1073741824; //5 symbols in base64, almost maxint
    while (random > 0) {
        var char1 = base64chars[Math.round((Math.random() * 1073741824) % 64)];
        result += char1;
        random = Math.floor(random / 64);
    }
    return result;
}