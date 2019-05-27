(function (module) {
    module.controller("LoginController", loginController);
    loginController.$inject = ["$stateParams", "authenService"];
    function loginController($stateParams, authenService) {
        if ($stateParams.returnParams) 
            authenService.logIn($stateParams.returnState, $stateParams.returnParams);
        else 
            authenService.logIn($stateParams.returnState);
    }
})(angular.module("myApp"));