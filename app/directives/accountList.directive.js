(function (module) {
    "use strict";
    module.directive("accountList", accountListDirective);
    accountListDirective.$inject = ["accountService"];
    function accountListDirective(accountService) {
        var directive = {
            restrict: "E",
            scope: {
                accounts: "=",
                onSelectedAccountChanged: "&"
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

            scope.removeAccount = (account) => {
                accountService.removeAccount(account).then(() => {
                    if (scope.selectedAccount) {
                        scope.selectedAccount = undefined;
                        scope.onSelectedAccountChanged({ account: scope.selectedAccount });
                    }
                });
            }
            scope.viewTransactions = (acount, $event) => {

                $event.stopProbagation();
                $event.preventDefault();
            }
        }
    }
}
)(angular.module("myApp"));