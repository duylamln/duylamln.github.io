"use strict";
var myApp = angular.module("myApp", [
    "ui.router",
    "ui.mask",
    "ngStorage",
    "Alertify",
    "ngMaterial",
    "ngMessages",
    "cfp.hotkeys"
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
        requiredAuth: true
    });
    $stateProvider.state({
        name: "main.order",
        url: "/order",
        templateUrl: "app/order.controller.html",
        controller: "OrderController",
        controllerAs: "model",
        requiredAuth: true
    });
    $stateProvider.state({
        name: "main.orderDetail",
        url: "/order/:key",
        templateUrl: "app/orderDetail.controller.html",
        controller: "OrderDetailController",
        controllerAs: "model"
    });
    $stateProvider.state({
        name: "main.login",
        url: "/login?returnState=",
        templateUrl: "app/login.controller.html",
        controller: "LoginController",
        controllerAs: "model"
    });
}]);

myApp.run(["$rootScope", "Alertify", "$state", "$transitions", function ($rootScope, Alertify, $state, $transitions) {
    $rootScope.alertify = Alertify;

    // firebase.auth().onAuthStateChanged(function (user) {
    //     $rootScope.user = user;



    // });

    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                window.user = authResult;
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
            // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        // Privacy policy url.
        privacyPolicyUrl: '<your-privacy-policy-url>'
    };

    $rootScope.showLoginForm = function (returnState) {
        uiConfig.callbacks.signInSuccessWithAuthResult = function (authResult, redirectUrl) {
            window.user = authResult.user;
            $state.go(returnState);
        }

        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
    }


    $transitions.onBefore({ to: "main.*" }, function (trans) {
        var stateService = trans.router.stateService;
        var targetState = trans._targetState;
        var targetStateConfig = stateService.get(targetState.identifier());
        if (!window.user && targetStateConfig.requiredAuth === true) {
            stateService.go("main.login", { returnState: targetState._identifier });
            return false;
        }
        if (targetState._identifier === "main.timesheet" && window.user && window.user.uid !== "RtWOkvlr0VdwqMwWEXOYyuap8FO2") {
            stateService.go("main.login");
            return false;
        }
        return true;
    });

    // $transitions.onError({}, function (trans) {
    //     var stateService = trans.router.stateService;
    //     var targetState = trans._targetState;
    //     stateService.go("main.login", { returnState: targetState._identifier });
    // });
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
