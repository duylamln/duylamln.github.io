(function (module) {

    module.controller("OrderTransactionModalController", orderTransactionModalController);
    orderTransactionModalController.$inject = ["$uibModalInstance", "transactions"];
    function orderTransactionModalController($uibModalInstance, transactions) {
        var model = this;
        model.transactions = transactions;
        model.ok = () => {
            $uibModalInstance.close(transactions);
        }
    }
})(angular.module("myApp"));

