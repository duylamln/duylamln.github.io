(function (module) {
    "use strict";
    module.directive("transactionList", transactionListDirective);
    transactionListDirective.$inject = ["accountService", "transactionService", "$timeout"];
    function transactionListDirective(accountService, transactionService, $timeout) {
        var directive = {
            restrict: "E",
            scope: {
                transactions: "="
            },
            link: link,
            templateUrl: "app/directives/transactionList.directive.html"
        };

        return directive;

        function link(scope, element, attr) {

        }
    }
}
)(angular.module("myApp"));