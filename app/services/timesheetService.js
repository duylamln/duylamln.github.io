(function (module) {
    /*
    week: {
        number,
        startDate,
        endDate,
        title,
        timesheets: [
            timesheet: {
                id,
                date,                
                totalHours,
                timeEntries: [
                    timeEntry: {
                        id,
                        startTime,
                        endTime,
                        duration,
                        description
                    }
                ]
            }
        ]
    }
    
    */

    module.service("timesheetService", timeSheetService);

    timeSheetService.$inject = ["$localStorage", "$q", "Alertify", "convertService"];


    function timeSheetService($localStorage, $q, Alertify, convertService) {
        var database = firebase.database();
        this.getByWeekNumber = getByWeekNumber;
        this.saveTimesheet = saveTimesheet;


        function getByWeekNumber(weekNumber) {
            var defer = $q.defer();
            var weekFilter = database.ref("weeks").orderByChild("number").equalTo(weekNumber).limitToFirst(1);
            weekFilter.once("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        defer.resolve(null);
                    }
                    else {
                        snapshot.forEach(function(childSnapshot){                            
                            var key= childSnapshot.key;
                            var weekData = childSnapshot.val();
                            weekData.key = key;
                            convertService.convertStringToMoment(weekData);
                            defer.resolve(weekData);
                        })
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });

            return defer.promise;
        }

        function saveTimesheet(week) {
            var defer = $q.defer();

            var datapost = angular.copy(week);
            convertService.convertMomentToString(datapost);

            if (!datapost.key) datapost.key = database.ref().child("weeks").push().key;
            database.ref("weeks/" + datapost.key)
                .set(datapost, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Timesheet saved!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }
        return this;
    }


})(angular.module("myApp"));
