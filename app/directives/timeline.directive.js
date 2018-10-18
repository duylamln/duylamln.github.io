(function (module) {
    "use strict";
    module.directive("timeline", timelineDirective);
    function timelineDirective() {
        var directive = {
            restrict: "E",
            scope: {
                activities: "="
            },
            link: link,
            templateUrl: "app/directives/timeline.directive.html"
        };
        return directive;

        function link(scope, element, attr) {
            scope.$watch("activities", function () {
                var events = buildRoadmapEvents(scope.activities);
                $("#time-line").roadmap(events, { eventsPerSlide: 10 });
            });
        }

        function buildRoadmapEvents(activities) {
            return _.map(activities, function (item) {
                return {
                    date: item.title,
                    content: item.content,
                    active: item.active
                }
            });
        }
    }
}
)(angular.module("myApp"));