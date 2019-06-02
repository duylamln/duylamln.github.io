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
            var { uid } = firebase.auth().currentUser;
            var weekFilter = database.ref("weeks").orderByChild("user/uid").equalTo(uid).limitToFirst(100);
            weekFilter.once("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        defer.resolve(null);
                    }
                    else {
                        snapshot.forEach(function (childSnapshot) {
                            var weekData = childSnapshot.val();
                            if (weekData.number === weekNumber) {
                                var key = childSnapshot.key;
                                weekData.key = key;
                                convertService.convertStringToMoment(weekData);
                                defer.resolve(weekData);
                            }
                        })
                        defer.resolve(null);
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

            var { uid, email, displayName } = firebase.auth().currentUser;
            week.user = {
                uid: uid,
                email: email,
                displayName: displayName
            };
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
                        defer.resolve(datapost);
                    }
                });
            return defer.promise;
        }
        return this;
    }


})(angular.module("myApp"));
