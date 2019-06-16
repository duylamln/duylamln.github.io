(function (module) {

    module.controller("AdminController", adminController);
    adminController.$inject = ["authenService", "accountService", "$timeout", "transactionService", "$uibModal"];
    function adminController(authenService, accountService, $timeout, transactionService, $uibModal) {
        var model = this;
       
    }
})(angular.module("myApp"));

