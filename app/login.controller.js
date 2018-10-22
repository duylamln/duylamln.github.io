(function (module) {
    module.controller("LoginController", loginController);
    loginController.$inject = ["$stateParams", "$rootScope"];
    function loginController($stateParams, $rootScope) {
        $rootScope.showLoginForm($stateParams.returnState);

        

    }
})(angular.module("myApp"));