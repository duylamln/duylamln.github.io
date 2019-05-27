(function (module) {
    "use strict";
    module.directive("orderInfo", orderInfoDirective);
    orderInfoDirective.$inject = ["orderService", "authenService", "transactionService"];
    function orderInfoDirective(orderService, authenService, transactionService) {
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
            scope.user = authenService.getCurrentUser();

            function saveOrderInfo() {
                orderService.updateOrder(scope.order);
            }

            function pushTransactions(order) {
                if (!order.detail || order.detail.length == 0) return $.when();
                else {
                    var orderDetail = order.detail.shift();
                    return transactionService.pushTransaction(order, orderDetail)
                        .then(() => pushTransactions(order));
                }
            }

            function removeTransactions(order) {
                if (!order.detail || order.detail.length == 0) return $.when();
                else {
                    var orderDetail = order.detail.shift();
                    return transactionService.removeTransactionById(orderDetail.tranId).then(() => removeTransactions(order));
                }
            }           

            scope.finishOrder = () => {
                var order = scope.order;
                order.status = "locked";
                if (order.withdrawFromAccountBalance) {
                    console.log("lock order + create transactions");
                    orderService.updateOrder(order)
                        .then((updatedOrder) => pushTransactions(angular.copy(updatedOrder)));
                }
                else {
                    console.log("lock order + remove transactions");
                    orderService.updateOrder(order)
                        .then((updatedOrder) => removeTransactions(angular.copy(updatedOrder)));
                }
            }

            scope.unlockOrder = () => {
                scope.order.status = "active";
                orderService.updateOrder(scope.order);
            }
        }
    }
}
)(angular.module("myApp"));