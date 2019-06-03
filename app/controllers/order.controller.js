(function (module) {
    module.controller("OrderController", orderController);
    orderController.$inject = ["$sce", "$scope", "$timeout", "$state", "orderService", "Alertify"];
    function orderController($sce, $scope, $timeout, $state, orderService, Alertify) {
        var model = this;
        model.selectOrder = selectOrder;
        model.removeOrder = removeOrder;
        model.goToOrderDetail = goToOrderDetail;
        model.lockOrder = lockOrder;
        model.unlockOrder = unlockOrder;
        model.calculateOrderPrice = calculateOrderPrice;
        model.copyOrderDetailLink = copyOrderDetailLink;
        model.addFeaturedOrder = addFeaturedOrder;
        model.getFeaturedOrders = getFeaturedOrders;
        model.onSelectedFeaturedOrderChange = onSelectedFeaturedOrderChange;
        model.onCreateOrderFromFeatured = onCreateOrderFromFeatured;
        model.humanizeOrderTime = humanizeOrderTime;

        var user = firebase.auth().currentUser;

        activate();

        function activate() {
            getOrders();
            getFeaturedOrders();
        }

        function getOrders() {
            orderService.subscribeOrders(function (data) {
                $timeout(function () {
                    model.orders = _.orderBy(data, "date", "desc");

                    if (model.selectedOrder) {
                        model.selectedOrder = _.find(model.orders, { key: model.selectedOrder.key });
                    }
                    //else {
                    //    if (model.orders && model.orders.length > 0) {
                    //        model.selectedOrder = model.orders[0];
                    //    }
                    //}
                })
            });
        }

        function getFeaturedOrders() {
            orderService.getFeaturedOrders(function (featuredOrders) {
                model.featuredOrders = featuredOrders;
            });
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

            orderService.updateOrder(order).then(function () {
                Alertify.success("Order " + order.key + " locked");
            });

            $event.stopPropagation();
            $event.preventDefault();
        }


        function unlockOrder(order, $event) {
            order.status = "active";

            orderService.updateOrder(order).then(function () {
                Alertify.success("Order " + order.key + " activated");
            });

            $event.stopPropagation();
            $event.preventDefault();
        }

        function goToOrderDetail() {
            if (!model.selectedOrder) return;
            $state.go("main.orderDetail", { key: model.selectedOrder.key });
        }

        function calculateOrderPrice() {
            return _.reduce(model.selectedOrder.detail, function (sum, item) {
                if (isNaN(Number.parseFloat(item.price))) return sum += 0;
                return sum += Number.parseFloat(item.price);
            }, 0);
        }

        function copyOrderDetailLink(order, $event) {
            var orderDetailHref = location.href + "/" + order.key;
            copyToClipboard(orderDetailHref);
            Alertify.success("Copied: " + orderDetailHref);

            $event.stopPropagation();
            $event.preventDefault();
        }

        function addFeaturedOrder(order) {
            var { name, menuUrl } = order;
            if (isExistedFeaturedOrder(name, menuUrl)) {
                Alertify.error("This order has been featured already.");
                return;
            }
            var featuredOrder = {
                name: name,
                menuUrl: menuUrl,
                count: 1
            };
            orderService.addFeaturedOrder(featuredOrder);
        }

        function isExistedFeaturedOrder(name, menuUrl) {
            return _.find(model.featuredOrders, { name: name, menuUrl: menuUrl }) != undefined;
        }
        function onSelectedFeaturedOrderChange({ featuredOrder }) {
            var { name, menuUrl } = featuredOrder;
        }

        function onCreateOrderFromFeatured({ featuredOrder }) {
            //var { name, menuUrl } = featuredOrder;

            //createNewOrder().then(function () {
            //    if (featuredOrder.count) featuredOrder.count++;
            //    else { featuredOrder.count = 1; }
            //    orderService.updateFeaturedOrder(featuredOrder);
            //});
        }

        function humanizeOrderTime(order) {
            return moment.humanize(order.data);
        }

    }
})(angular.module("myApp"));