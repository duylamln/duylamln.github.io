(function (module) {

    module.controller("MainController", myController);
    myController.$inject = ["appValues", "$scope"];
    function myController(appValues, $scope) {
        var model = this;
        model.prevSprint = prevSprint;
        model.nextSprint = nextSprint;

        var date = moment();

        model.currentSprint = getCurrentSprint(date, appValues);


        function prevSprint() {
            var newDate = moment(date).subtract(2, "weeks");
            moveSprint(newDate);
        }

        function nextSprint() {
            var newDate = moment(date).add(2, "weeks");
            moveSprint(newDate);
        }

        function moveSprint(newDate) {
            var temp = getCurrentSprint(newDate, appValues);
            if (temp) {
                model.currentSprint = temp;
                date = newDate;
            }
        }
    }

    function getCurrentSprint(date, appValues) {
        var currentSprint = _.find(appValues.sprintDefine, function (item) {
            return item.from <= date && date <= item.to;
        });
        if (currentSprint) {
            currentSprint.dayRange = currentSprint.from.format("DD/MM/YYYY") + " - " + currentSprint.to.format("DD/MM/YYYY");
            currentSprint.sprintActivities = buildSprintActivities(currentSprint, appValues);
            return currentSprint;
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

