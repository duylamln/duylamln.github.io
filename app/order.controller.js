(function (module) {
    module.controller("OrderController", orderController);
    orderController.$inject = ["$sce", "$scope", "$timeout", "$state", "orderService"];
    function orderController($sce, $scope, $timeout, $state, orderService) {
        var model = this;
        model.createNewOrder = createNewOrder;
        model.selectOrder = selectOrder;
        model.removeOrder = removeOrder;
        model.goToOrderDetail = goToOrderDetail;
        model.lockOrder = lockOrder;
        model.unlockOrder = unlockOrder;

        activate();

        function activate() {
            getOrders();

        }

        function getOrders() {
            orderService.subscribeOrders(function (data) {
                $timeout(function () {
                    model.orders = _.orderBy(data, "date", "desc");

                    if (model.selectedOrder) {
                        model.selectedOrder = _.find(model.activeOrders, { key: model.selectedOrder.key });
                    }
                })
            });
        }

        function createNewOrder() {
            if (!model.menuUrl) return;
            var order = {
                date: moment(),
                status: "active",
                detail: [],
                menuUrl: model.menuUrl || ""
            };
            orderService.createNewOrder(order).then(function () { model.menuUrl = ""; });
        }

        function selectOrder(order) {
            model.selectedOrder = order;
        }       

        function removeOrder(order, $event) {
            orderService.removeOrder(order);

            $event.stopPropagation();
            $event.preventDefault();
        }

        function lockOrder(order, $event){
            order.status = "locked";

            orderService.updateOrder(order);

            $event.stopPropagation();
            $event.preventDefault();
        }

        
        function unlockOrder(order, $event){
            order.status = "active";

            orderService.updateOrder(order);

            $event.stopPropagation();
            $event.preventDefault();
        }

        function goToOrderDetail() {
            if (!model.selectedOrder) return;
            return $state.go("main.orderDetail", { key: model.selectedOrder.key });
        }

    }
})(angular.module("myApp"));