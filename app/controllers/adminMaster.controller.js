(function (module) {

    module.controller("AdminMasterController", adminMasterController);
    adminMasterController.$inject = ["authenService", "accountService", "$timeout", "transactionService", "$uibModal"];
    function adminMasterController(authenService, accountService, $timeout, transactionService, $uibModal) {
        var model = this;
       
    }
})(angular.module("myApp"));

