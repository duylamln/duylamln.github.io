(function (module) {
    "use strict";
    module.directive("orderInfo", orderInfoDirective);
    orderInfoDirective.$inject = ["orderService"];
    function orderInfoDirective(orderService) {
        var directive = {
            restrict: "E",
            scope: {
                order: "="
            },
            link: link,
            templateUrl: "app/directives/orderInfo.directive.html"
        };

        return directive;

        function link(scope, element, attr) {
            scope.saveOrderInfo = saveOrderInfo;

            function saveOrderInfo() {
                orderService.updateOrder(scope.order);
            }
        }
    }
}
)(angular.module("myApp"));