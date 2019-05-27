(function (module) {
    "use strict";
    module.directive("orderCreationForm", orderCreationFormDirective);
    orderCreationFormDirective.$inject = ["orderService", "authenService"];
    function orderCreationFormDirective(orderService, authenService) {
        var directive = {
            restrict: "E",
            scope: {
                inputOrder: "="
            },
            link: link,
            templateUrl: "app/directives/order.creation.form.html"
        };

        return directive;

        function link(scope, element, attr) {
            var user = firebase.auth().currentUser;

            scope.order = (scope.inputOrder && angular.copy(scope.inputOrder)) || newOrder();
            scope.saveOrder = saveOrder;
            scope.clearOrder = clearOrder;
            scope.onFileUploadChange = onFileUploadChange;
            scope.user = authenService.getCurrentUser();

            scope.$watch("inputOrder", function (newValue, oldValue) {
                if (newValue == oldValue) return;
                scope.order = angular.copy(newValue);
            });

            function saveOrder() {
                if (!scope.order.menuUrl) return;
                var order = angular.copy(scope.order);
                if (order.key) {
                    return orderService.updateOrder(order).then(function () {
                        //scope.order = newOrder();
                    });
                }
                else {
                    return orderService.createNewOrder(order).then(function () {
                        scope.order = newOrder();
                    });
                }
            }

            function onFileUploadChange(args) {
                var imgSrc = args.imgSrc;
                console.log(imgSrc);
                scope.order.menuUrl = imgSrc;

            }

            function clearOrder() {
                scope.order = newOrder();
            }

            function newOrder() {
                return {
                    date: moment(),
                    status: "active",
                    detail: [],
                    menuUrl: "",
                    user: {
                        key: user.uid,
                        name: user.displayName
                    },
                    name: "",
                    discount: 0,
                    discountMax: 0,
                    shippingFee: 0
                };
            }
        }


    }


}
)(angular.module("myApp"));