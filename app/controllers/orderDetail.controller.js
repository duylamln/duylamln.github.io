(function (module) {
    module.controller("OrderDetailController", orderDetailController);
    orderDetailController.$inject = ["$sce", "$scope", "$timeout", "$stateParams", "$q", "orderService", "authenService", "transactionService"];
    function orderDetailController($sce, $scope, $timeout, $stateParams, $q, orderService, authenService, transactionService) {
        var model = this;
        var orderKey = $stateParams.key;
        var { displayName } = firebase.auth().currentUser || "";
        model.orderDetail = {
            name: displayName
        }

        model.submitOrderDetail = submitOrderDetail;
        model.removeOrderDetail = removeOrderDetail;
        model.editOrderDetail = editOrderDetail;

        var currentUser = authenService.getCurrentUser();

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
            model.orderDetail.tranId = model.orderDetail.tranId || window.createRandomId();

            var updateOrder = angular.copy(model.selectedOrder);

            if (model.editOrderDetailIndex !== undefined) {
                updateOrder.detail[model.editOrderDetailIndex] = model.orderDetail;
            }
            else {
                if (!updateOrder.detail) updateOrder.detail = [];
                updateOrder.detail.push(model.orderDetail);
            }

            if (currentUser) {
                var { displayName, email, uid } = currentUser;
                model.orderDetail.createdUser = { displayName, email, uid };
            }

            orderService.updateOrder(updateOrder)
                .then((order) => {
                    var orderDetail = !!model.editOrderDetailIndex ? order.detail[model.editOrderDetailIndex] : order.detail[order.detail.length - 1];
                    return transactionService.pushTransaction(order, orderDetail);
                })
                .then(function () {
                    model.orderDetail = undefined;
                    model.editOrderDetailIndex = undefined;
                });
        }

        function removeOrderDetail(index) {
            var orderDetail = model.selectedOrder.detail.splice(index, 1)[0];

            var updateOrder = angular.copy(model.selectedOrder);
            orderService.updateOrder(updateOrder)
                .then((order) => {
                    transactionService.removeTransactionById(orderDetail.tranId);
                });
        }

        function editOrderDetail(index, orderDetail) {
            model.orderDetail = angular.copy(orderDetail);
            model.editOrderDetailIndex = index;
        }
    }

})(angular.module("myApp"));
