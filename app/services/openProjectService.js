(function (module) {
  module.service("openProjectService", openProjectService);

  openProjectService.$inject = ["$http", "$q", "$localStorage", "Alertify", "appValues"];

  function openProjectService($http, $q, $localStorage, Alertify, appValues) {
    this.getVersions = getVersions;
    this.getTimeEntryActivities = getTimeEntryActivities;
    this.createTimeEntry = createTimeEntry;
    this.updateTimeEntry = updateTimeEntry;
    this.deleteTimeEntry = deleteTimeEntry;

    function getVersions(notReload) {
      var defer = $q.defer();
      if ($localStorage.versions && notReload) defer.resolve($localStorage.versions);
      else {
        $http.get(appValues.baseApi + "api/openproject/versions").then(
          function (response) {
            Alertify.success("Retrieved my versions.");
            $localStorage.versions = response.data;
            defer.resolve(response.data);
          },
          function (response) {
            Alertify.error(response.error);
            defer.reject(response.error);
          }
        );
      }
      return defer.promise;
    }

    function getTimeEntryActivities(notReload) {
      var defer = $q.defer();
      if ($localStorage.timeEntryActivities && notReload) defer.resolve($localStorage.timeEntryActivities);
      else {
        $http.get(appValues.baseApi + "api/openproject/timeentryactivities").then(
          function (response) {
            Alertify.success("Retrieved time entry activities.");
            $localStorage.timeEntryActivities = response.data;
            defer.resolve(response.data);
          },
          function (response) {
            Alertify.error(response.error);
            defer.reject(response.error);
          }
        );
      }
      return defer.promise;
    }

    function createTimeEntry(timeEntry) {
      var defer = $q.defer();
      $http.post(appValues.baseApi + "api/openproject/createtimeentry", timeEntry).then(
        function (response) {
          Alertify.success("Created time entry.");
          defer.resolve(response.data);
        },
        function (response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
      return defer.promise;
    }

    function updateTimeEntry(timeEntry) {
      var defer = $q.defer();
      $http.post(appValues.baseApi + "api/openproject/updatetimeentry", timeEntry).then(
        function (response) {
          Alertify.success("Updated time entry.");
          defer.resolve(response.data);
        },
        function (response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
      return defer.promise;
    }

    function deleteTimeEntry(timeEntryId) {
      var defer = $q.defer();
      $http.delete(appValues.baseApi + "api/openproject/deletetimeentry/" + timeEntryId).then(
        function (response) {
          Alertify.success("Deleted time entry.");
          defer.resolve(response);
        },
        function (response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
      return defer.promise;
    }

    return this;
  }
})(angular.module("myApp"));
