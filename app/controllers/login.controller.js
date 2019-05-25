(function (module) {
    module.controller("LoginController", loginController);
    loginController.$inject = ["$stateParams", "authenService"];
    function loginController($stateParams, authenService) {
        authenService.logIn($stateParams.returnState);
    }
})(angular.module("myApp"));