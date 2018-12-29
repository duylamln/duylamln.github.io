(function (module) {
    module.controller("OrderController", orderController);
    orderController.$inject = ["$sce", "$scope", "$timeout", "$state", "orderService","Alertify"];
    function orderController($sce, $scope, $timeout, $state, orderService, Alertify) {
        var model = this;
        model.createNewOrder = createNewOrder;
        model.selectOrder = selectOrder;
        model.removeOrder = removeOrder;
        model.goToOrderDetail = goToOrderDetail;
        model.lockOrder = lockOrder;
        model.unlockOrder = unlockOrder;
        model.calculateOrderPrice = calculateOrderPrice;
        model.copyOrderDetailLink = copyOrderDetailLink;

        activate();

        function activate() {
            getOrders();

        }

        function getOrders() {
            orderService.subscribeOrders(function (data) {
                $timeout(function () {
                    model.orders = _.orderBy(data, "date", "desc");

                    if (model.selectedOrder) {
                        model.selectedOrder = _.find(model.orders, { key: model.selectedOrder.key });
                    }
                    else {
                        if (model.orders && model.orders.length > 0) {
                            model.selectedOrder = model.orders[0];
                        }
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

        function lockOrder(order, $event) {
            order.status = "locked";

            orderService.updateOrder(order).then(function(){
                Alertify.success("Order " + order.key + " locked");
            });

            $event.stopPropagation();
            $event.preventDefault();
        }


        function unlockOrder(order, $event) {
            order.status = "active";

            orderService.updateOrder(order).then(function(){
                Alertify.success("Order " + order.key + " activated");
            });

            $event.stopPropagation();
            $event.preventDefault();
        }

        function goToOrderDetail() {
            if (!model.selectedOrder) return;
            return $state.go("main.orderDetail", { key: model.selectedOrder.key });
        }

        function calculateOrderPrice() {
            return _.reduce(model.selectedOrder.detail, function (sum, item) {
                if (isNaN(Number.parseFloat(item.price))) return sum += 0;
                return sum += Number.parseFloat(item.price);
            }, 0);
        }

        function copyOrderDetailLink(order, $event){
            var orderDetailHref = location.href + "/" + order.key;
            copyToClipboard(orderDetailHref);
            Alertify.success("Copied: "+ orderDetailHref);

            $event.stopPropagation();
            $event.preventDefault();
        }

    }
})(angular.module("myApp"));