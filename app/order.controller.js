(function (module) {
    module.controller("OrderController", orderController);
    orderController.$inject = ["$sce", "$scope", "$timeout", "orderService"];
    function orderController($sce, $scope, $timeout, orderService) {
        var model = this;
        model.goToWebsite = goToWebsite;
        model.today = moment().format("dddd DD.MM.YYYY");
        model.createNewOrder = createNewOrder;
        model.submitOrder = submitOrder;
        model.selectOrder = selectOrder;
        model.removeOrderDetail = removeOrderDetail;
        model.calculateOrderPrice = calculateOrderPrice;
        model.editOrderDetail = editOrderDetail;
        model.removeOrder = removeOrder;

        activate();

        function activate() {
            getActiveOrders();

        }

        function getActiveOrders() {
            orderService.subscribeActiveOrders(function (data) {
                $timeout(function () {
                    console.log("update list active orders");
                    model.activeOrders = data;
                    if (model.selectedOrder) {
                        model.selectedOrder = _.find(model.activeOrders, { key: model.selectedOrder.key });
                    }
                })
            });
        }


        function goToWebsite() {
            model.trustedWebsiteUrl = $sce.trustAsResourceUrl(model.websiteUrl);
        }

        function createNewOrder() {
            orderService.createNewOrder();


        }
        function submitOrder() {
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

        function selectOrder(order) {
            model.selectedOrder = order;
        }

        function removeOrderDetail(index) {
            model.selectedOrder.detail.splice(index, 1);

            var updateOrder = angular.copy(model.selectedOrder);
            orderService.updateOrder(updateOrder);
        }

        function removeOrder(order, $event){
            console.log("remove order");

            orderService.removeOrder(order);


            $event.stopPropagation();
            $event.preventDefault();
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
})(angular.module("myApp"));