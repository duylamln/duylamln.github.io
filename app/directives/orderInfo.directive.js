(function (module) {
    "use strict";
    module.directive("orderInfo", orderInfoDirective);
    orderInfoDirective.$inject = ["orderService", "authenService", "transactionService", "$q", "$uibModal"];
    function orderInfoDirective(orderService, authenService, transactionService, $q, $uibModal) {
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
                if (!order.detail || order.detail.length == 0) return $q.when(order);
                else {
                    var orderDetail = order.detail.shift();
                    if(orderDetail.createdUser){
                        return transactionService.pushTransaction(order, orderDetail)
                        .then(() => pushTransactions(order));
                    }
                    else pushTransactions(order);
                }
            }

            function removeTransactions(order) {
                if (!order.detail || order.detail.length == 0) return $q.when(order);
                else {
                    var orderDetail = order.detail.shift();
                    return transactionService.removeTransactionById(orderDetail.tranId)
                        .then(() => removeTransactions(order));
                }
            }

            scope.finishOrder = () => {
                var order = scope.order;
                order.status = "locked";

                if (order.withdrawFromAccountBalance) {
                    console.log("lock order + create transactions");
                    orderService.updateOrder(order)
                        .then(createOrderTransactions)
                        .then(removeRemovedDetailTransactions);
                }
                else {
                    console.log("lock order + remove transactions");
                    orderService.updateOrder(order)
                        .then(removeOrderTransactions)
                        .then(removeRemovedDetailTransactions);
                }
            }

            function createOrderTransactions(order) {
                var defer = $q.defer();
                var copiedOrder = angular.copy(order);

                pushTransactions(copiedOrder)
                    .then(() => defer.resolve(order), defer.reject);

                return defer.promise;
            }

            function removeOrderTransactions(order) {
                var defer = $q.defer();
                var copiedOrder = angular.copy(order);

                removeTransactions(copiedOrder)
                    .then(() => defer.resolve(order), defer.reject);

                return defer.promise;
            }

            function removeRemovedDetailTransactions(order) {
                if (!order.removedDetail || order.removedDetail.length === 0) return $q.when(order);
                else {
                    var removedDetail = order.removedDetail.shift();
                    return transactionService.removeTransactionById(removedDetail.tranId)
                        .then(() => removeRemovedDetailTransactions(order));
                }
            }

            scope.unlockOrder = () => {
                scope.order.status = "active";
                orderService.updateOrder(scope.order);
            }

            scope.viewOrderTransactions = () => {
                transactionService.getTransactionByOrderKey(scope.order.key)
                    .then(showInModal);
            }

            function showInModal(trans) {
                $uibModal.open({
                    animation: false,
                    ariaLabelledBy: "modal-title",
                    ariaDescribedBy: "modal-body",
                    templateUrl: "app/controllers/orderTransactionModal.controller.html",
                    controller: "OrderTransactionModalController",
                    controllerAs: "model",
                    size: "lg",
                    backdrop: "static",
                    resolve: {
                        transactions: function () {
                            return trans;
                        }
                    }
                });

            }
        }
    }
}
)(angular.module("myApp"));