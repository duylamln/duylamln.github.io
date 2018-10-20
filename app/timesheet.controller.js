(function (module) {
    module.controller("TimesheetController", timesheetController);
    timesheetController.$inject = ["appValues", "$scope", "timesheetService"];
    function timesheetController(appValues, $scope, timesheetService) {
        var model = this;
        model.selectedTimesheet;
        model.onTimesheetClick = onTimesheetClick;
        model.setStartTime = setStartTime;
        model.setEndTime = setEndTime;
        model.onStartTimeChange = onStartTimeChange;
        model.onEndTimeChange = onEndTimeChange;
        model.addNewTimeEntry = addNewTimeEntry;
        model.deleteTimeEntry = deleteTimeEntry;
        model.saveTimesheet = saveTimesheet;
        model.prevWeek = prevWeek;
        model.nextWeek = nextWeek;

        activate();

        function activate() {
            model.currentWeek = moment().week();
            model.weekNumber = moment().week();
            getWeeklyTimesheet(model.weekNumber);
        }
        function prevWeek() {
            model.weekNumber--;
            getWeeklyTimesheet(model.weekNumber);
        }

        function nextWeek() {
            model.weekNumber++;
            getWeeklyTimesheet(model.weekNumber);
        }

        function getWeeklyTimesheet(weekNumber) {
            var date = dateFromWeek(weekNumber);
            var startWeek = moment(date).startOf("week").add(1, "days"); //Monday
            var endWeek = moment(date).endOf("week").subtract(1, "days"); //Friday

            model.week = timesheetService.getByWeekNumber(weekNumber);
            if (!model.week) model.week = emptyWeek(startWeek, endWeek, weekNumber);
            _.each(model.week.timesheets, function (timesheet) {
                timesheet.date = moment(timesheet.date);

                if (equalDate(date, timesheet.date)) {
                    model.selectedTimesheet = timesheet;
                }

                _.each(timesheet.timeEntries, function (timeEntry) {
                    timeEntry.startTime = moment(timeEntry.startTime);
                    timeEntry.endTime = moment(timeEntry.endTime);
                    timeEntry.startTimeDisplay = timeEntry.startTime.format("HHmm");
                    timeEntry.endTimeDisplay = timeEntry.endTime.format("HHmm");
                });
            });
        }

        function dateFromWeek(weekNumber) {
            return moment().month(0).date(0).add(weekNumber - 1, "w");
        }

        function equalDate(date1, date2) {
            return date1.format("yyyyMMdd") == date2.format("yyyyMMdd");

        }

        function onTimesheetClick(timesheet) {
            model.selectedTimesheet = timesheet;

        }

        function setStartTime(timeEntry) {
            timeEntry.startTime = moment(model.selectedTimesheet.date);
            timeEntry.startTime.hour(moment().hour()).minute(moment().minute());
            timeEntry.startTimeDisplay = timeEntry.startTime.format("HHmm");
            timeEntry.duration = calculateDuration(timeEntry);
        }

        function setEndTime(timeEntry) {
            timeEntry.endTime = moment(model.selectedTimesheet.date);
            timeEntry.endTime.hour(moment().hour()).minute(moment().minute());
            timeEntry.endTimeDisplay = timeEntry.endTime.format("HHmm");
            timeEntry.duration = calculateDuration(timeEntry);
        }

        function calculateDuration(timeEntry) {
            if (!timeEntry.startTime || !timeEntry.endTime) return 0;
            return round((timeEntry.endTime.diff(timeEntry.startTime)) / (60 * 60 * 1000), 1);
        }

        function round(value, precision) {
            var multiplier = Math.pow(10, precision || 0);
            return Math.round(value * multiplier) / multiplier;
        }

        function onStartTimeChange(timeEntry) {
            if (!timeEntry.startTimeDisplay) return;
            var hour = timeEntry.startTimeDisplay.substring(0, 2);
            var minute = timeEntry.startTimeDisplay.substring(2, 4);
            timeEntry.startTime.hour(hour);
            timeEntry.startTime.minute(minute);
            timeEntry.duration = calculateDuration(timeEntry);
        }

        function onEndTimeChange(timeEntry) {
            if (!timeEntry.endTimeDisplay) return;
            if (!timeEntry.endTime) timeEntry.endTime = moment(timeEntry.startTime);
            var hour = timeEntry.endTimeDisplay.substring(0, 2);
            var minute = timeEntry.endTimeDisplay.substring(2, 4);
            timeEntry.endTime.hour(hour);
            timeEntry.endTime.minute(minute);
            timeEntry.duration = calculateDuration(timeEntry);
        }

        function generateId() {
            return Math.round(Math.random() * 1000000);
        }

        function saveTimesheet() {
            calculateTimesheet();
            timesheetService.saveTimesheet(model.week);
        }

        function calculateTimesheet() {
            _.each(model.week.timesheets, function (timesheet) {
                timesheet.totalHours = _.sumBy(timesheet.timeEntries, "duration");
            });

        }
        function emptyWeek(startWeek, endWeek, weekNumber) {
            var week = {
                number: weekNumber,
                startDate: startWeek,
                endDate: endWeek,
                title: "Week " + weekNumber + ": " + startWeek.format("DD.MM") + " - " + endWeek.format("DD.MM"),
                timesheets: []
            };

            for (var i = 0; i < 5; i++) {
                var date = moment(startWeek).add(i, "d");
                week.timesheets.push({
                    id: generateId(),
                    date: date,
                    totalHours: 0,
                    timeEntries: []
                })
            }
            return week;
        }

        function addNewTimeEntry() {
            var date = moment(model.selectedTimesheet.date).hour(moment().hour()).minute(moment().minute());
            model.selectedTimesheet.timeEntries.push({
                id: generateId(),
                startTime: date,
                startTimeDisplay: date.format("HHmm"),
                duration: 0,
                description: ""
            })

        }

        function deleteTimeEntry(index) {
            model.selectedTimesheet.timeEntries.splice(index, 1);
        }
    }
})(angular.module("myApp"));