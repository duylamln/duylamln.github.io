(function (module) {
    module.controller("AppController", appController);
    appController.$inject = ["$state", "$stateParams", "$timeout", "authenService", "accountService"];
    function appController($state, $stateParams, $timeout, authenService, accountService) {

        var model = this;
        model.user = authenService.getCurrentUser();
        model.logOut = logOut;
        setBalance(model.user);
        function setBalance(user) {
            if (!user) return;
            accountService.subscribeAccountByEmail(user.email, (acc) => {
                $timeout(() => model.balance = (acc && acc.balance) || 0, 0);
            });
        }
        authenService.registerUserStateChangeCallback(function (user) {
            $timeout(() => {
                model.user = user;
                setBalance(model.user);
            });
        })

        function logOut() {
            authenService.logOut($state.$current);
        }

    }
})(angular.module("myApp"));