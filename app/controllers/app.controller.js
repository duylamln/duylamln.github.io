(function (module) {
    module.controller("AppController", appController);
    appController.$inject = ["$state", "$stateParams", "$timeout", "authenService"];
    function appController($state, $stateParams, $timeout, authenService) {

        var model = this;
        model.user = authenService.user;
        model.logOut = logOut;

        authenService.registerUserStateChangeCallback(function (user) {
            $timeout(() => model.user = user);
        })

        function logOut() {
            authenService.logOut($state.$current);
        }

    }
})(angular.module("myApp"));