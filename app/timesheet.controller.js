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


        activate();

        function activate() {
            getWeeklyTimesheet(moment());
        }

        function getWeeklyTimesheet(date) {
            var startWeek = date.startOf("week").add(1, "days"); //Monday
            var endWeek = date.endOf("week").subtract(1, "days"); //Friday

            model.timesheets = timesheetService.getByDateRange(startWeek, endWeek);

            _.each(model.timesheets, function (timesheet) {
                _.each(timesheet.timeEntries, function (timeEntry) {
                    timeEntry.startTimeDisplay = timeEntry.startTime.format("HHmm");
                    timeEntry.endTimeDisplay = timeEntry.endTime.format("HHmm");
                });
            });
        }


        function onTimesheetClick(timesheet) {
            model.selectedTimesheet = timesheet;

        }

        function setStartTime(timeEntry) {
            timeEntry.startTime = moment();
            timeEntry.startTimeDisplay = timeEntry.startTime.format("HHmm");
            timeEntry.duration = calculateDuration(timeEntry);
        }

        function setEndTime(timeEntry) {
            timeEntry.endTime = moment();
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

        function onStartTimeChange(timeEntry){
            if(!timeEntry.startTimeDisplay) return;
            var hour = timeEntry.startTimeDisplay.substring(0, 2);
            var minute = timeEntry.startTimeDisplay.substring(2, 4);
            timeEntry.startTime.hour(hour);
            timeEntry.startTime.minute(minute);
            timeEntry.duration = calculateDuration(timeEntry);
        }

        function onEndTimeChange(timeEntry){
            if(!timeEntry.endTimeDisplay) return;
            var hour = timeEntry.endTimeDisplay.substring(0, 2);
            var minute = timeEntry.endTimeDisplay.substring(2, 4);
            timeEntry.endTime.hour(hour);
            timeEntry.endTime.minute(minute);
            timeEntry.duration = calculateDuration(timeEntry);
        }

    }
})(angular.module("myApp"));


(function (module) {
    module.service("timesheetService", timeSheetService);

    timeSheetService.$inject = [];

    function timeSheetService() {
        this.getByDateRange = getByDateRange;
        function getByDateRange(startDate, endDate) {
            return [
                {
                    date: moment(),
                    timeEntries: [
                        {
                            startTime: moment(),
                            endTime: moment().add(1, "hours"),
                            description: "description",
                            duration: 1
                        },
                        {
                            startTime: moment(),
                            endTime: moment().add(30, "minutes"),
                            description: "description",
                            duration: 0.5
                        },
                        {
                            startTime: startDate,
                            endTime: startDate,
                            description: "description",
                            hours: 1.2
                        },
                        {
                            startTime: startDate,
                            endTime: startDate,
                            description: "description",
                            hours: 1.2
                        },
                        {
                            startTime: startDate,
                            endTime: startDate,
                            description: "description",
                            hours: 1.2
                        }

                    ],
                    title: startDate.format("ddd - DD/MM"),
                    totalHours: 8.9
                },
                {
                    date: startDate,
                    timeEntries: [
                        {
                            startTime: startDate,
                            endTime: startDate,
                            description: "description",
                            hours: 1.2
                        }
                    ],
                    title: startDate.format("ddd - DD/MM"),
                    totalHours: 8.9
                }, {
                    date: startDate,
                    timeEntries: [
                        {
                            startTime: startDate,
                            endTime: startDate,
                            description: "description",
                            hours: 1.2
                        }
                    ],
                    title: startDate.format("ddd - DD/MM"),
                    totalHours: 8.9
                }
                , {
                    date: startDate,
                    timeEntries: [
                        {
                            startTime: startDate,
                            endTime: startDate,
                            description: "description",
                            hours: 1.2
                        }
                    ],
                    title: startDate.format("ddd - DD/MM"),
                    totalHours: 8.9
                },
                {
                    date: startDate,
                    timeEntries: [
                        {
                            startTime: startDate,
                            endTime: startDate,
                            description: "description",
                            hours: 1.2
                        }
                    ],
                    title: startDate.format("ddd - DD/MM"),
                    totalHours: 8.9
                }

            ];

        }

        return this;
    }


})(angular.module("myApp"));
