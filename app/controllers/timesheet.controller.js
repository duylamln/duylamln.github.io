(function (module) {
    module.controller("TimesheetController", timesheetController);
    timesheetController.$inject = [
        "timesheetService",
        "hotkeys",
        "openProjectService",
        "Alertify"
    ];
    function timesheetController(timesheetService, hotkeys, openProjectService, Alertify) {
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
        model.showAllWeekTimeEntries = showAllWeekTimeEntries;
        model.myWorkPackages;
        model.timeEntryActivities = [];
        model.onVersionChanged = onVersionChanged;
        model.saveOPTimeEntry = saveOPTimeEntry;
        model.getVersions = getVersions;
        model.getParentWorkPackages = getParentWorkPackages;

        activate();

        function activate() {
            model.currentWeek = moment().week();
            model.weekNumber = moment().week();
            getWeeklyTimesheet(model.weekNumber);
            getVersions(true);
            getTimeEntryActivities(true);
            registerHotkeys();
        }

        function getVersions(notReload) {
            openProjectService
                .getVersions(notReload)
                .then(function (versionsCollection) {
                    model.versions = versionsCollection.elements;
                    model.parentWorkPackages = _.reduce(
                        versionsCollection.elements,
                        function (arr, item) {
                            return arr.concat(item.workPackages);
                        },
                        []
                    );
                });
        }

        function getTimeEntryActivities(notReload) {
            openProjectService
                .getTimeEntryActivities(notReload)
                .then(function (timeEntryActivities) {
                    model.timeEntryActivities = timeEntryActivities;
                });
        }

        function registerHotkeys() {
            hotkeys.add({
                combo: "ctrl+s",
                description: "Save timesheet",
                callback: function (e) {
                    saveTimesheet();
                    e.preventDefault();
                },
                allowIn: ["INPUT", "SELECT"]
            });
            hotkeys.add({
                combo: "ctrl+a",
                description: "Add new time entry",
                callback: function (e) {
                    addNewTimeEntry();
                    e.preventDefault();
                },
                allowIn: ["INPUT", "SELECT"]
            });
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
            var startWeek = moment(date)
                .startOf("week")
                .add(1, "days"); //Monday
            var endWeek = moment(date)
                .endOf("week")
                .add(1, "days"); //Sunday

            timesheetService.getByWeekNumber(weekNumber).then(function (data) {
                model.week = data;
                if (!model.week) model.week = emptyWeek(startWeek, endWeek, weekNumber);

                model.totalHours = calculateWeekTotalHours(model.week);
                model.selectedTimesheet = _.find(model.week.timesheets, function (
                    timesheet
                ) {
                    return equalDate(moment(), timesheet.date);
                });

                if (model.showWeekTimesheet || !model.selectedTimesheet)
                    showAllWeekTimeEntries();
            });
        }

        function calculateWeekTotalHours(week) {
            return round(
                _.sumBy(week.timesheets, function (item) {
                    return item.totalHours;
                }),
                1
            );
        }

        function dateFromWeek(weekNumber) {
            return moment()
                .month(0)
                .date(0)
                .add(weekNumber - 1, "w");
        }

        function equalDate(date1, date2) {
            return date1.format("yyyyMMdd") == date2.format("yyyyMMdd");
        }

        function onTimesheetClick(timesheet) {
            model.showWeekTimesheet = false;
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
            return round(
                timeEntry.endTime.diff(timeEntry.startTime) / (60 * 60 * 1000),
                1
            );
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
            timesheetService.saveTimesheet(model.week).then(function (week) {
                model.week.key = week.key;
                model.totalHours = calculateWeekTotalHours(model.week);
            });
        }

        function calculateTimesheet() {
            _.each(model.week.timesheets, function (timesheet) {
                timesheet.totalHours = round(
                    _.sumBy(timesheet.timeEntries, "duration"),
                    1
                );
            });
        }

        var emotionSrcs = [
            "././contents/images/sad.png",
            "././contents/images/meh.png",
            "././contents/images/smile.png",
            "././contents/images/laugh.png",
            "././contents/images/amazing.png"
        ]

        function emptyWeek(startWeek, endWeek, weekNumber) {
            var week = {
                number: weekNumber,
                startDate: startWeek,
                endDate: endWeek,
                title:
                    "Week " +
                    weekNumber +
                    ": " +
                    startWeek.format("DD.MM") +
                    " - " +
                    endWeek.format("DD.MM"),
                timesheets: []
            };

            for (var i = 0; i < 5; i++) {
                var date = moment(startWeek).add(i, "d");
                week.timesheets.push({
                    id: generateId(),
                    date: date,
                    totalHours: 0,
                    timeEntries: [],
                    emotionSrc: emotionSrcs[i]
                });
            }
            return week;
        }

        function addNewTimeEntry() {
            var date = moment(model.selectedTimesheet.date)
                .hour(moment().hour())
                .minute(moment().minute());
            if (!model.selectedTimesheet.timeEntries)
                model.selectedTimesheet.timeEntries = [];
            model.selectedTimesheet.timeEntries.push({
                id: generateId(),
                startTime: date,
                startTimeDisplay: date.format("HHmm"),
                duration: 0,
                description: ""
            });
        }

        function deleteTimeEntry(index, timeEntry) {
            if (timeEntry.opTimeEntryId) {
                openProjectService.deleteTimeEntry(timeEntry.opTimeEntryId)
                    .then(function () {
                        model.selectedTimesheet.timeEntries.splice(index, 1);
                        saveTimesheet();
                    });
            }
            else {
                model.selectedTimesheet.timeEntries.splice(index, 1);
            }
        }

        function showAllWeekTimeEntries() {
            model.selectedTimesheet = null;
            model.showWeekTimesheet = true;
            model.weekTimeEntries = _.reduce(
                model.week.timesheets,
                function (all, timesheet) {
                    return all.concat(timesheet.timeEntries || []);
                },
                []
            );
        }

        function onVersionChanged() {
            if (!model.selectedVersion) return;
            model.parentWorkPackages = model.selectedVersion.workPackages;
        }

        function getParentWorkPackages(versionId) {
            if (!versionId) return [];
            return _.find(model.versions, { id: versionId }).workPackages;
        }

        function saveOPTimeEntry(index, timeEntry) {
            if (!timeEntry.activityId) {
                Alertify.error("Activity is required!");
                return;
            }
            if (!timeEntry.workPackageId) {
                Alertify.error("Work package is required!");
                return;
            }
            if (!timeEntry.description) {
                Alertify.error("Description is required!");
                return;
            }
            if (!timeEntry.duration || timeEntry.duration === 0) {
                Alertify.error("Duration is required!");
                return;
            }

            var opTimeEntry = {
                projectId: 2,
                activityId: timeEntry.activityId,
                workPackageId: timeEntry.workPackageId,
                hours: timeEntry.duration,
                comment: timeEntry.description,
                spentOn: moment(timeEntry.startTime).format("YYYY-MM-DD")
            };
            if (timeEntry.opTimeEntryId && timeEntry.opTimeEntryId !== 0) {
                opTimeEntry.id = timeEntry.opTimeEntryId;
                openProjectService.updateTimeEntry(opTimeEntry)
                    .then(saveTimesheet);
            }
            else {
                openProjectService.createTimeEntry(opTimeEntry)
                    .then(function (returnTimeEntry) {
                        timeEntry.opTimeEntryId = returnTimeEntry.id;
                        saveTimesheet();
                    });
            }
        }
    }
})(angular.module("myApp"));
