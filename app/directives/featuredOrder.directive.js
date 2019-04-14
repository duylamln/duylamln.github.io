(function (module) {
    "use strict";
    module.directive("featuredOrder", orderFeaturedDirective);
    orderFeaturedDirective.$inject = ["orderService"];
    function orderFeaturedDirective(orderService) {
        var directive = {
            restrict: "E",
            scope: {
                items: "=",
                onSelectedFeaturedOrderChange: "&",
                onCreateOrder: "&"
            },
            link: link,
            templateUrl: "app/directives/featuredOrder.directive.html"
        };

        return directive;

        function link(scope, element, attr) {
            scope.featuredOrders = scope.items;
            scope.removeFeaturedOrder = removeFeaturedOrder;
            scope.selectFeaturedOrder = selectFeaturedOrder;
            scope.createOrder = createOrder;
            function removeFeaturedOrder(order, $event) {
                orderService.removeFeaturedOrder(order);

                $event.stopPropagation();
                $event.preventDefault();
            }
            function selectFeaturedOrder(order) {
                scope.selectedFeaturedOrder = order;
                scope.onSelectedFeaturedOrderChange({ featuredOrder: order });
            }

            function createOrder(order, $event) {
                scope.selectedFeaturedOrder = order;
                scope.onCreateOrder({ featuredOrder: order });

                $event.stopPropagation();
                $event.preventDefault();
            };
        }


    }
}
)(angular.module("myApp"));