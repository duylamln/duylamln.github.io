(function (module) {
    module.controller("OrderDetailController", orderDetailController);
    orderDetailController.$inject = ["$sce", "$scope", "$timeout", "$stateParams", "orderService"];
    function orderDetailController($sce, $scope, $timeout, $stateParams, orderService) {
        var model = this;
        var orderKey = $stateParams.key;
        var { displayName } = firebase.auth().currentUser || "";
        model.orderDetail = {
            name: displayName
        }

        model.submitOrderDetail = submitOrderDetail;
        model.removeOrderDetail = removeOrderDetail;
        model.editOrderDetail = editOrderDetail;

        activate();

        function activate() {
            orderService.subscribeOrder(orderKey, function (data) {
                $timeout(function () {
                    model.selectedOrder = data;
                    model.trustedWebsiteUrl = $sce.trustAsResourceUrl(model.selectedOrder.menuUrl);
                    calculateDiscount();
                    calculateTotalPrice();
                });
            });
        }

        function calculateDiscount(order) {
            var order = model.selectedOrder;
            if (!order.discount || order.discount == 0) return;
            _.each(order.detail, function (item) {
                var price = Number.parseFloat(item.price);
                if (isNaN(price)) item.discountedPrice = price;
                else item.discountedPrice = (price * (100 - order.discount)) / 100;
            });
        }

        function calculateTotalPrice() {
            var order = model.selectedOrder;

            model.selectedOrder.totalPrice = _.reduce(order.detail, function (sum, item) {
                if (isNaN(Number.parseFloat(item.price))) return sum += 0;
                return sum += Number.parseFloat(item.price);
            }, 0);

            model.selectedOrder.totalDiscountedPrice = _.reduce(order.detail, function (sum, item) {
                if (isNaN(Number.parseFloat(item.discountedPrice))) return sum += 0;
                return sum += Number.parseFloat(item.discountedPrice);
            }, 0);
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



    }
    module.filter('groupBy', function () {
        return _.memoize(function (items, field) {
            return _.groupBy(items, field);
        }
        );
    });
})(angular.module("myApp"));
