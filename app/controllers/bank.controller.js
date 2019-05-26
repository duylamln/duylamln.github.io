(function (module) {

    module.controller("BankController", bankController);
    bankController.$inject = ["authenService", "accountService", "$timeout", "transactionService"];
    function bankController(authenService, accountService, $timeout, transactionService) {
        var model = this;
        model.accounts = [];

        accountService.subscribeAccounts((accounts) => {
            $timeout(() => model.accounts = accounts, 0);
        });

        model.onSelectedAccountChanged = (args) => {
            model.selectedAccount = args.account;
        }

        model.onViewTransactionList = (args) => {
            transactionService.getTransactionByEmail(args.account.email)
                .then((trans) => {
                    $timeout(() => {
                        model.transactions = trans;
                    }, 0);
                });
        };
    }
})(angular.module("myApp"));

