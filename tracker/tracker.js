'use strict';

angular.module('myApp.tracker', ['ui.router', 'ui.bootstrap']).config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('master.tracker',
        {
            url: '/tracker',
            templateUrl: 'tracker/tracker.html',
            controller: 'TrackerController',
            controllerAs: 'trackerCtrl'
        })
        .state('master.tracker.detail', {
            url: '/:date',
            templateUrl: 'tracker/tracker-detail.html',
            controller: 'TrackerDetailController',
            controllerAs: 'trackerDetailCtrl'
        });
}]);

/*Tracker Controller*/

angular.module('myApp.tracker').controller('TrackerController', TrackerController);

TrackerController.$inject = ['$scope', '$timeout', 'TrackerService', 'appSettings'];
function TrackerController($scope, $timeout, TrackerService, appSettings) {
    var self = this;
    self.toDay = new Date();

    var trackingServiceStartStr = "Tracking Service start !";
    var sessionLogOffStr = "Session Log off";
    var lunchTimeHour = appSettings.lunchHour;
    self.appSettings = appSettings;
    self.gotoDetail = gotoDetail;
    self.trackers = [];

    $scope.$watch(function () {
        return self.toDay;
    }, function () {
        self.monday = getMonday(self.toDay);
        self.friday = new Date(self.monday.getFullYear(), self.monday.getMonth(), self.monday.getDate() + 4, 23, 59, 59);
        if (self.monday === undefined || self.friday === undefined) {
            return;
        }
        self.promise = TrackerService.getTrackerByDate(self.monday, self.friday).then(function (response) {
            var trackersUnderlaying = [];
            var allShortDate = [];

            response = convertToJson(response);
            trackersUnderlaying = getTimeByDate(response)
            calculateHoursPerDay(trackersUnderlaying);

            $timeout(function () {
                self.trackers = angular.copy(trackersUnderlaying);
                /*sum working hours of week*/
                self.weekHours = sumWeekHours();
                self.weekHoursInPercent = Math.round(self.weekHours / appSettings.workingHourPerWeek * 100);
                self.weekHoursInFormat = formatHour(self.weekHours);
                /*lack of working hours of week*/
                self.lackOfHours = appSettings.workingHourPerWeek - self.weekHours;
                self.lackOfHoursInFormat = formatHour(self.lackOfHours);
                self.lackOfHoursInPercent = 100 - self.weekHoursInPercent;
            });
        });
    }, true);

    self.prevWeek = prevWeek;
    self.nextWeek = nextWeek;

    function getMonday(toDay) {
        var toDayCopy = new Date(toDay);
        var day = toDayCopy.getDay(),
            diff = toDayCopy.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        var monday = new Date(toDayCopy.setDate(diff));
        return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate(), 0, 0, 0);
    }

    function convertToJson(response) {
        var results = [];
        angular.forEach(response, function (item) {
            results.push({
                Action: item.get('Action'),
                Date: item.get('Date'),
                Description: item.get('Description'),
                Name: item.get('Name')
            })
        });
        return results;
    }
    function getTimeByDate(response) {
        var trackersUnderlaying = [];
        angular.forEach(response, function (tracker) {
            //var date = new Date(tracker.Date.iso);
            var date = new Date(tracker.Date);
            var shortDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 7, 0, 0, 0);
            var updatedItem = _.find(trackersUnderlaying, function (item) {
                return item.shortDate.toString() === shortDate.toString();
            });
            if (updatedItem) {
                if (tracker.Action === trackingServiceStartStr) {
                    updatedItem.checkin = updatedItem.checkin === undefined ? date : updatedItem.checkin;
                }
                if (tracker.Action === sessionLogOffStr) {
                    updatedItem.checkout = date;
                }
            }
            else {
                updatedItem = {};
                updatedItem.shortDate = shortDate;
                if (tracker.Action === trackingServiceStartStr) {
                    updatedItem.checkin = updatedItem.checkin === undefined ? date : updatedItem.checkin;
                }
                if (tracker.Action === sessionLogOffStr) {
                    updatedItem.checkout = date;
                }
                trackersUnderlaying.push(updatedItem);
            }
        });
        return trackersUnderlaying;
    }

    function calculateHoursPerDay(trackersUnderlaying) {
        angular.forEach(trackersUnderlaying, function (tracker) {
            if (!tracker.checkin || !tracker.checkout) {
                return;
            }
            var timeDiff = Math.abs(tracker.checkout.getTime() - tracker.checkin.getTime());
            tracker.duration = (timeDiff / (1000 * 3600)) - lunchTimeHour;
            tracker.durationInFormat = formatHour(tracker.duration);
        });

    }

    function formatHour(floatHour) {
        var hours = Math.floor(floatHour);
        var minutes = Math.round((floatHour - hours) * 60);
        return ("00" + (hours)).slice(-2) + ":" + ("00" + minutes).slice(-2);
    }

    function sumWeekHours() {
        return _.reduce(self.trackers, function (sum, item) {
            var duration = item.duration ? item.duration : 0;
            return sum + duration;
        }, 0);
    }

    function prevWeek() {
        self.toDay.addDates(-7);
    }

    function nextWeek() {
        self.toDay.addDates(7);
    }

    function gotoDetail(tracker) {

        var selectedDate = tracker.shortDate.format("yyyymmdd");
        $scope.$state.go('master.tracker.detail', { date: selectedDate });

    }
}

/*Tracker Detail Controller*/

angular.module('myApp.tracker').controller('TrackerDetailController', TrackerDetailController);
TrackerDetailController.$inject = ['$scope', '$q', '$timeout', 'TrackerService', 'appSettings', 'TrackerModel'];
function TrackerDetailController($scope, $q, $timeout, TrackerService, appSettings, TrackerModel) {
    var self = this;
    self.selectedDate = moment.utc($scope.$stateParams.date, "YYYYMMDD");
    self.trackers = [];

    self.removeTracker = removeTracker;
    self.appSettings = appSettings;
    self.today = new Date();
    self.activeTracker = activeTracker;
    self.selectedTracker = null;
    self.clearSelection = clearSelection;
    self.addOrUpdateTracker = addOrUpdateTracker;
    self.actionChanged = actionChanged;

    self.editMode = false;

    initPage();
    function initPage() {
        self.promise = $q.defer();
        getTrackerDetail();
    }

    function getTrackerDetail() {        
        TrackerService.getTrackerDetailByDate(self.selectedDate).then(function (response) {
            $timeout(function () {
                self.trackers.length = 0;
                angular.forEach(response, function (tracker) {
                    self.trackers.push(new TrackerModel(tracker));
                });
                self.promise.resolve();
            });
        });
    }

    function removeTracker(tracker) {
        TrackerService.removeTracker(tracker).then(function (response) {
            toastr.warning('Delete tracker successfully!');
            getTrackerDetail();
        });
    }

    function activeTracker(tracker) {
        angular.forEach(self.trackers, function (item) {
            delete item.active;
        });
        tracker.active = true;
        self.editMode = true;
        self.selectedTracker = angular.copy(tracker);
    }
    function clearSelection() {
        angular.forEach(self.trackers, function (item) {
            delete item.active;
        });
        self.selectedTracker = null;
        self.editMode = false;
    }
    function addOrUpdateTracker() {
        //add new 
        self.promise = $q.defer();
        if (self.editMode === false) {
            if (self.selectedTracker === null) {
                self.promise.resolve();
                return;
            }
            TrackerService.saveTracker(self.selectedTracker).then(function (response) {
                toastr.success("Add new tracker successfully!")
                getTrackerDetail();
            });
        }
            //update tracker
        else {
            delete self.selectedTracker.active;
            TrackerService.saveTracker(self.selectedTracker).then(function (response) {
                toastr.success("Update tracker successfully!")
                getTrackerDetail();
            });
        }
    }

    function actionChanged() {
        if (!self.selectedTracker.date) {
            self.selectedTracker.date = new Date();
        }
    }
}


/*Tracker Service*/
angular.module('myApp.tracker').service('TrackerService', TrackerService);
TrackerService.$inject = ["$q", "$timeout"]
function TrackerService($q, $timeout) {
    this.init = function () {
        Parse.initialize("u4XKvtb4gCU0P7smzWI09ORk2Ytg933Elt4kxa6J", "l0KaCpkeUgCfwudDHaxrqPwem1IVuil0AwoL3Mun");
    }
    this.init();

    this.getTrackerByDate = function (dateFrom, dateTo) {
        var Tracker = Parse.Object.extend("Tracker");
        var query = new Parse.Query(Tracker);
        query.containedIn("Action", ["Tracking Service start !", "Session Log off"]);
        var dateFromCopy = new Date(dateFrom);
        var dateToCopy = new Date(dateTo);
        dateFromCopy.addHours(7);
        dateToCopy.addHours(7);
        query.greaterThan("Date", dateFromCopy);
        query.lessThan("Date", dateToCopy);
        query.ascending("Date");
        return query.find();
    }

    this.getTrackerDetailByDate = function (date) {
        var copyDateFrom = moment(date);
        var copyDateTo = moment(date).hours(23).minutes(59).seconds(59);

        var Tracker = Parse.Object.extend("Tracker");
        var query = new Parse.Query(Tracker);
        query.greaterThan("Date", new Date(copyDateFrom));
        query.lessThan("Date", new Date(copyDateTo));
        query.ascending("Date");
        return query.find();
    }

    this.saveTracker = function (tracker) {
        var Tracker = Parse.Object.extend('Tracker');
        var trackerModel = new Tracker();
        trackerModel.set('objectId', tracker.id);
        trackerModel.set('Action', tracker.action);
        trackerModel.set('Date', tracker.date.addHours(7));
        trackerModel.set('Description', tracker.action);
        return trackerModel.save();
    }

    this.removeTracker = function (tracker) {
        var Tracker = Parse.Object.extend('Tracker');
        var trackerModel = new Tracker();
        trackerModel.set('objectId', tracker.id);
        return trackerModel.destroy();
    }
}

/*Tracker Model*/
angular.module('myApp.tracker').factory('TrackerModel', TrackerModel);
function TrackerModel() {
    return function Tracker(tracker) {
        if (tracker) {
            this.action = tracker.get('Action');
            this.date = new Date(tracker.get('Date')).addHours(-7);
            this.description = tracker.get('Description');
            this.name = tracker.get('Name');
            this.id = tracker.id;
            this.createdAt = tracker.createdAt;
            this.updatedAt = tracker.updatedAt;
        } else {
            this.action = '';
            this.date = '';
            this.description = '';
            this.name = '';
        }
    }
}