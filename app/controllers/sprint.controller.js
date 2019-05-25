(function (module) {

    module.controller("SprintController", myController);
    myController.$inject = ["appValues", "$scope", "$http"];
    function myController(appValues, $scope, $http) {
        var model = this;
        model.goPrevSprint = goPrevSprint;
        model.goNextSprint = goNextSprint;
        var today = moment();
        init(today);

        function init(date) {
            today = date;
            var nextSprintDate = moment(today).add(2, "weeks");
            var lastSprintDate = moment(today).subtract(2, "weeks");

            model.currentSprint = getSprintByDate(today, appValues);
            model.nextSprint = getSprintByDate(nextSprintDate, appValues);
            model.lastSprint = getSprintByDate(lastSprintDate, appValues);

            if (model.currentSprint && model.currentSprint.sprintActivities && model.nextSprint) {
                _.each(model.currentSprint.sprintActivities, function (item) {
                    item.content = item.content.replace("next sprint", model.nextSprint.title);
                });
            }
        }

        function goPrevSprint() {
            var newDate = moment(today).subtract(2, "weeks");
            init(newDate);
        }

        function goNextSprint() {
            var newDate = moment(today).add(2, "weeks");
            init(newDate);
        }
    }

    function getSprintByDate(date, appValues) {
        var sprint = _.find(appValues.sprintDefine, function (item) {
            return item.from <= date && date <= item.to;
        });
        if (sprint) {
            sprint.dayRange = sprint.from.format("DD/MM/YYYY") + " - " + sprint.to.format("DD/MM/YYYY");
            sprint.sprintActivities = buildSprintActivities(sprint, appValues);
            return sprint;
        }
        return undefined;
    }

    function buildSprintActivities(currentSprint, appValues) {
        var activityDefine = appValues.sprintActivityDefine;
        var sprintDays = [];
        var today = moment();
        var start = moment(currentSprint.from);
        while (start <= currentSprint.to) {
            if (moment(start).day() !== 0 && moment(start).day() !== 6) sprintDays.push(start);
            start = moment(start).add(1, "days");
        }
        
        return _.map(sprintDays, function (item) {
            var week = currentSprint.from <= item && item <= currentSprint.endWeek1 ? 1 : 2;
            var weekDay = moment(item).day();
            var content = _.find(activityDefine, function (activity) {
                return activity.week === week && activity.day.indexOf(weekDay) > -1;
            }).content;
            
            return {
                date: item,
                title: item.format("ddd - DD/MM"),
                content: content,
                active: item.format("YYYYMMDD") === today.format("YYYYMMDD")
            }
        });
    }
})(angular.module("myApp"));

