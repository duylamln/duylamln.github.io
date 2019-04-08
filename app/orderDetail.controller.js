(function (module) {
    module.controller("OrderDetailController", orderDetailController);
    orderDetailController.$inject = ["$sce", "$scope", "$timeout", "$stateParams", "orderService"];
    function orderDetailController($sce, $scope, $timeout, $stateParams, orderService) {
        var model = this;
        var orderKey = $stateParams.key;

        model.orderDetail = {
            name: user || user.displayName
        }

        model.submitOrderDetail = submitOrderDetail;
        model.removeOrderDetail = removeOrderDetail;
        model.calculateOrderPrice = calculateOrderPrice;
        model.editOrderDetail = editOrderDetail;

        activate();

        function activate() {
            orderService.subscribeOrder(orderKey, function (data) {
                $timeout(function () {
                    model.selectedOrder = data;
                    model.trustedWebsiteUrl = $sce.trustAsResourceUrl(model.selectedOrder.menuUrl);
                });
            });
        }

        function submitOrderDetail() {
            if (!model.orderDetail.name || !model.orderDetail.desc) return;


            var updateOrder = angular.copy(model.selectedOrder);

            if (model.editOrderDetailIndex !== undefined) {
                updateOrder.detail.splice(model.editOrderDetailIndex, 1, model.orderDetail);
            }
            else {
                if (!updateOrder.detail) updateOrder.detail = [];
                updateOrder.detail.push(model.orderDetail);
            }

            orderService.updateOrder(updateOrder).then(function () {
                model.orderDetail = undefined;
                model.editOrderDetailIndex = undefined;
            });
        }

        function removeOrderDetail(index) {
            model.selectedOrder.detail.splice(index, 1);

            var updateOrder = angular.copy(model.selectedOrder);
            orderService.updateOrder(updateOrder);
        }

        function editOrderDetail(index, orderDetail) {
            model.orderDetail = angular.copy(orderDetail);
            model.editOrderDetailIndex = index;
        }

        function calculateOrderPrice() {
            return _.reduce(model.selectedOrder.detail, function (sum, item) {
                if (isNaN(Number.parseFloat(item.price))) return sum += 0;
                return sum += Number.parseFloat(item.price);
            }, 0);
        }

    }
    module.filter('groupBy', function () {
        return _.memoize(function (items, field) {
            return _.groupBy(items, field);
        }
        );
    });
})(angular.module("myApp"));
