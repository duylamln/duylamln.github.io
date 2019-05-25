(function (module) {
    "use strict";
    module.directive("accountCreation", accountCreation);
    accountCreation.$inject = ["accountService"];
    function accountCreation(accountService) {
        var directive = {
            restrict: "E",
            scope: {
                account: "="
            },
            link: link,
            templateUrl: "app/directives/accountCreation.directive.html"
        };

        return directive;

        function link(scope, element, attr) {

            scope.$watch("account", function (newValue) {
                if (newValue) {
                    scope.creationMode = false;
                    scope.accountCopy = angular.copy(newValue);
                }
                else {
                    scope.creationMode = true;
                    scope.accountCopy = undefined;
                }
            })

            scope.submit = () => {
                var acc = angular.copy(scope.accountCopy);
                accountService.createOrUpdateAccount(acc)
                    .then(() => scope.account = undefined);
            }
        }
    }
}
)(angular.module("myApp"));