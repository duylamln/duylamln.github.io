(function (module) {

    module.controller("BankController", bankController);
    bankController.$inject = ["authenService", "accountService", "$timeout"];
    function bankController(authenService, accountService, $timeout) {
        var model = this;
        model.accounts = [];

        accountService.subscribeAccounts((accounts) => {
            $timeout(() => model.accounts = accounts, 0);
        });

        model.onSelectedAccountChanged = (args) => {
            model.selectedAccount = args.account;
        }
    }
})(angular.module("myApp"));

