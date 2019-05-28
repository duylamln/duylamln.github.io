(function (module) {

    module.controller("AccountActivityController", accountActivityController);
    accountActivityController.$inject = ["$uibModalInstance", "account"];
    function accountActivityController($uibModalInstance, account) {
        var model = this;
        model.ok = () => { $uibModalInstance.close($ctrl.selected.item); }

        model.cancel = () => { $uibModalInstance.dismiss("cancel");}
    }
})(angular.module("myApp"));

