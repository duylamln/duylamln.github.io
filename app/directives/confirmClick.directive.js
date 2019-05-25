(function (module) {
    "use strict";
    module.directive("confirmClick", confirmClickDirective);
    function confirmClickDirective() {
        return {
            link: function (scope, element, attr) {
                var msg = attr.confirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click', function (event) {
                    if (window.confirm(msg)) {
                        scope.$eval(clickAction);
                    }
                    event.stopPropagation();
                    event.preventDefault();
                });
            }
        };
    }
}
)(angular.module("myApp"))