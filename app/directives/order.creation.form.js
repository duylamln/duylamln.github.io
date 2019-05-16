(function (module) {
    "use strict";
    module.directive("orderCreationForm", orderCreationFormDirective);
    orderCreationFormDirective.$inject = ["orderService"];
    function orderCreationFormDirective(orderService) {
        var directive = {
            restrict: "E",
            scope: {
                order: "="
            },
            link: link,
            templateUrl: "app/directives/order.creation.form.html"
        };

        return directive;

        function link(scope, element, attr) {
            scope.createNewOrder = createNewOrder;
            scope.onFileUploadChange = onFileUploadChange;
            var user = firebase.auth().currentUser;


            function createNewOrder() {
                if (!scope.menuUrl) return;
                var order = {
                    date: moment(),
                    status: "active",
                    detail: [],
                    menuUrl: scope.menuUrl || "",
                    user: {
                        key: user.uid,
                        name: user.displayName
                    },
                    name: scope.orderName,
                    discount: scope.discount | 0
                };

                return orderService.createNewOrder(order).then(function () {
                    scope.menuUrl = "";
                    scope.orderName = "";
                });
            }

            function onFileUploadChange(args) {
                var imgSrc = args.imgSrc;
                console.log(imgSrc);
                scope.menuUrl = imgSrc;
                
            }
        }


    }


}
)(angular.module("myApp"));