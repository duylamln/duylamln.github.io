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
                    calculateTotalPrice();
                    calculateDiscount();
                });
            });
        }

        function calculateDiscount() {
            var order = model.selectedOrder;
            if (!order.discount || order.discount == 0) return;

            var discountMax = Number.parseFloat(order.discountMax);
            if (isNaN(discountMax)) {
                order.discountMax = 0;
                discountMax = 0; // no limitation
            }

            var avgShippingFee = RoundNumber(order.shippingFee / order.detail.length);

            var totalDiscountPrice = (order.totalPrice * order.discount) / 100;

            // no limitation or has not reached limitation
            if (discountMax === 0 || totalDiscountPrice < discountMax) {
                order.totalDiscountPrice = totalDiscountPrice;

                // item discounted price
                _.each(order.detail, function (item) {
                    var price = Number.parseFloat(item.price);
                    if (isNaN(price)) {
                        item.price = 0;
                        item.discountPrice = 0;
                        item.discountedPrice = 0;
                        item.finalPrice = 0;
                    }
                    else {
                        item.price = price
                        item.discountPrice = (price * order.discount) / 100;
                        item.discountedPrice = price - item.discountPrice;
                        item.finalPrice = item.discountedPrice + avgShippingFee;
                    }
                });
            }
            else {
                order.totalDiscountPrice = discountMax;


                // item discounted price
                _.each(order.detail, function (item) {
                    var price = Number.parseFloat(item.price);
                    if (isNaN(price)) {
                        item.price = 0;
                        item.discountPrice = 0;
                        item.discountedPrice = 0;
                        item.finalPrice = 0;
                    }
                    else {
                        var rate = RoundNumber(price / order.totalPrice);
                        item.discountPrice = RoundNumber(discountMax * rate);
                        item.discountedPrice = item.price - item.discountPrice;
                        item.finalPrice = item.discountedPrice + avgShippingFee;
                    }
                });
            }

            order.totalDiscountedPrice = order.totalPrice - order.totalDiscountPrice;
            order.totalDiscountedPriceWithShippingFee = order.totalDiscountedPrice + order.shippingFee;

            order.totalFinalPrice = _.reduce(order.detail, function (sum, item) {
                return sum += Number.parseFloat(item.finalPrice);
            }, 0);
        }



        function calculateTotalPrice() {
            var order = model.selectedOrder;

            model.selectedOrder.totalPrice = _.reduce(order.detail, function (sum, item) {
                if (isNaN(Number.parseFloat(item.price))) return sum += 0;
                return sum += Number.parseFloat(item.price);
            }, 0);

            var shippingFee = Number.parseFloat(order.shippingFee);
            if (isNaN(shippingFee)) {
                order.shippingFee = 0;
                order.totalPriceWithShippingFee = order.totalPrice;
            }
            else {
                order.shippingFee = shippingFee;
                order.totalPriceWithShippingFee = order.totalPrice + shippingFee;
            }
        }

        function RoundNumber(number) {
            return Math.round(number * 100) / 100;
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
