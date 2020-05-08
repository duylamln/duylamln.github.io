(function (module) {
    "use strict";
    module.directive("accountList", accountListDirective);
    accountListDirective.$inject = ["accountService", "transactionService", "$timeout"];
    function accountListDirective(accountService, transactionService, $timeout) {
        var directive = {
            restrict: "E",
            scope: {
                accounts: "=",
                onSelectedAccountChanged: "&",
                onViewTransactionList: "&"
            },
            link: link,
            templateUrl: "app/directives/accountList.directive.html"
        };

        return directive;

        function link(scope, element, attr) {
            scope.toggleAccount = (account) => {
                if (!scope.selectedAccount || scope.selectedAccount.key !== account.key) {
                    scope.selectedAccount = account;
                    scope.onSelectedAccountChanged({ account: scope.selectedAccount });
                }
                else {
                    scope.selectedAccount = undefined;
                    scope.onSelectedAccountChanged({ account: scope.selectedAccount });
                }
            };

            scope.SumBalance = (account) =>{
                console.log();
                return _.sumBy(account,'balance');
            }



            scope.removeAccount = (account) => {
                accountService.removeAccount(account).then(() => {
                    if (scope.selectedAccount) {
                        scope.selectedAccount = undefined;
                        scope.onSelectedAccountChanged({ account: scope.selectedAccount });
                    }
                });
            }
            scope.viewTransactions = (account, $event) => {
                scope.onViewTransactionList({ account: account });


                $event.stopPropagation();
                $event.preventDefault();
            }
        }
    }
}
)(angular.module("myApp"));