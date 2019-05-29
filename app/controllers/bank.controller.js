(function (module) {

    module.controller("BankController", bankController);
    bankController.$inject = ["authenService", "accountService", "$timeout", "transactionService", "$uibModal"];
    function bankController(authenService, accountService, $timeout, transactionService, $uibModal) {
        var model = this;
        model.accounts = [];
        model.onViewTransactionList = onViewTransactionList;
        accountService.subscribeAccounts((accounts) => {
            $timeout(() => model.accounts = accounts, 0);
        });

        model.onSelectedAccountChanged = (args) => {
            model.selectedAccount = args.account;
            if(args.account) viewTransactionByEmail(args.account.email);
        }

        function viewTransactionByEmail(email) {
            transactionService.getTransactionByEmail(email, (trans) => {
                $timeout(() => model.transactions = trans, 0);
            });
        }

        function onViewTransactionList(args) {
            var modalInstance = $uibModal.open({
                animation: false,
                ariaLabelledBy: "modal-title",
                ariaDescribedBy: "modal-body",
                templateUrl: "app/controllers/accountActivity.controller.html",
                controller: "AccountActivityController",
                controllerAs: "model",
                size: "md",
                backdrop: "static",
                resolve: {
                    account: function () {
                        return args.account;
                    }
                }
            });

            modalInstance.result.then(() => { });
        }
    }
})(angular.module("myApp"));

