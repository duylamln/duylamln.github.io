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
            scope.$watch("order", (newValue) => scope.orderSource = angular.copy(newValue));
            function saveOrderInfo() {
                var needUpdateTransaction = determineNeedUpdateTransaction(scope.order, scope.orderSource);
                var needRemoveTransaction = determinNeedRemoveTransaction(scope.order, scope.orderSource);
                orderService.updateOrder(scope.order)
                    .then(order => {
                        if (needRemoveTransaction) return removeTransactions(angular.copy(order));
                        else {
                            if (needUpdateTransaction) return pushTransactions(angular.copy(order));
                        }
                    });
            }

            function pushTransactions(order) {
                if (!order.detail || order.detail.length == 0) return $.when();
                else {
                    var orderDetail = order.detail.shift();
                    return transactionService.pushTransaction(order, orderDetail).then(() => pushTransactions(order));
                }
            }


            function removeTransactions(order) {
                if (!order.detail || order.detail.length == 0) return $.when();
                else {
                    var orderDetail = order.detail.shift();
                    return transactionService.removeTransactionById(orderDetail.tranId).then(() => removeTransactions(order));
                }
            }

            function determineNeedUpdateTransaction(order, orderSource) {
                return (order.discount !== orderSource.discount
                    || order.discountMax !== orderSource.discountMax
                    || order.shippingFee !== orderSource.shippingFee
                    || order.withdrawFromAccountBalance !== orderSource.withdrawFromAccountBalance)
                    && order.withdrawFromAccountBalance === true;
            }

            function determinNeedRemoveTransaction(order, orderSource) {
                return order.withdrawFromAccountBalance === false && orderSource.withdrawFromAccountBalance === true;
            }
        }
    }
}
)(angular.module("myApp"));