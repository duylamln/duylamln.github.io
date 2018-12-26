(function (module) {   

    module.service("openProjectService", openProjectService);

    openProjectService.$inject = ["$http", "$q", "Alertify"];

    function openProjectService($http, $q, Alertify) {
        
        this.getMyWorkPackages = getMyWorkPackages;
        this.getTimeEntryActivities = getTimeEntryActivities;

        function getMyWorkPackages() {
            var defer = $q.defer();
            $http.get("http://localhost:56984/api/openproject/myworkpackages")
                .then(function(response){
                    Alertify.success("Retrieved my work packages.");
                    defer.resolve(response.data);                    
                }, 
                function(response){
                    Alertify.error(response.error);
                    defer.reject(response.error);
                });
            return defer.promise;
        }

        function getTimeEntryActivities(){
            var defer = $q.defer();
            $http.get("http://localhost:56984/api/openproject/timeentryactivities")
                .then(function(response){
                    Alertify.success("Retrieved time entry activities");
                    defer.resolve(response.data);                    
                }, 
                function(response){
                    Alertify.error(response.error);
                    defer.reject(response.error);
                });
            return defer.promise;
        }

      
        return this;
    }


})(angular.module("myApp"));
