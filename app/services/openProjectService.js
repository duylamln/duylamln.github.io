(function(module) {
  module.service("openProjectService", openProjectService);

  openProjectService.$inject = ["$http", "$q", "Alertify", "appValues"];

  function openProjectService($http, $q, Alertify, appValues) {
    this.getMyWorkPackages = getMyWorkPackages;
    this.getTimeEntryActivities = getTimeEntryActivities;

    function getMyWorkPackages() {
      var defer = $q.defer();
      $http.get(appValues.baseApi + "api/openproject/myworkpackages").then(
        function(response) {
          Alertify.success("Retrieved my work packages.");
          defer.resolve(response.data);
        },
        function(response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
      return defer.promise;
    }

    function getTimeEntryActivities() {
      var defer = $q.defer();
      $http.get(appValues.baseApi + "api/openproject/timeentryactivities").then(
        function(response) {
          Alertify.success("Retrieved time entry activities");
          defer.resolve(response.data);
        },
        function(response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
      return defer.promise;
    }

    return this;
  }
})(angular.module("myApp"));
