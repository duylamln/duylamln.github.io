(function (module) {

    module.controller("AccountActivityController", accountActivityController);
    accountActivityController.$inject = ["$uibModalInstance", "account", "transactionService"];
    function accountActivityController($uibModalInstance, account, transactionService) {
        var model = this;

        model.tran = {
            method: "DEPOSIT",
            amount: 0,
            description: ""
        };

        model.disableTran = () => {
            return !model.tran.method || (!model.tran.amount || model.tran.amount === 0) || !model.tran.description;
        }

        model.ok = () => {
            var { method, amount, description } = model.tran;

            var transaction = {
                id: window.generateId(),
                desc: description,
                amount: amount,
                payer: {
                    email: account.email
                },
                createdDate: moment(),
                method: method
            };

            if (method === "DEPOSIT") {
                transactionService.depositMoney(transaction)
                    .then((tran) => $uibModalInstance.close(tran));
            }
            else if (method === "WITHDRAW") {
                transactionService.debitMoney(transaction)
                    .then((tran) => $uibModalInstance.close(tran));
            }
        }

        model.cancel = () => { $uibModalInstance.dismiss("cancel"); }
    }
})(angular.module("myApp"));

