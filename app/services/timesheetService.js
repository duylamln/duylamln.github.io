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
    
    timeSheetService.$inject = ["$localStorage", "Alertify"]; 


    function timeSheetService($localStorage, Alertify) {
        this.getByWeekNumber = getByWeekNumber;
        this.saveTimesheet = saveTimesheet;
        

        function getByWeekNumber(weekNumber) {
            if(!$localStorage.weeks) return null;
            return _.find($localStorage.weeks, {number: weekNumber});
        }

        function saveTimesheet(week){
            if(!$localStorage.weeks) $localStorage.weeks = [];
            if($localStorage.weeks.length == 10) $localStorage.weeks.shift();
            var weekIndex = _.findIndex($localStorage.weeks, {number: week.number});
            if(weekIndex > -1) $localStorage.weeks.splice(weekIndex, 1, week);
            else $localStorage.weeks.push(week);

            Alertify.success("Timesheet saved!");
        }
        return this;
    }


})(angular.module("myApp"));
