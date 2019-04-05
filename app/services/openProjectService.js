(function (module) {
  module.service("openProjectService", openProjectService);

  openProjectService.$inject = ["$http", "$q", "Alertify", "appValues"];

  function openProjectService($http, $q, Alertify, appValues) {
    this.getVersions = getVersions;
    this.reloadVersions = reloadVersions;
    this.getTimeEntryActivities = getTimeEntryActivities;
    this.createTimeEntry = createTimeEntry;
    this.updateTimeEntry = updateTimeEntry;

    function getVersions() {
      var defer = $q.defer();
      $http.get(appValues.baseApi + "api/openproject/versions").then(
        function (response) {
          Alertify.success("Retrieved my versions.");
          defer.resolve(response.data);
        },
        function (response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
      return defer.promise;
    }

    function reloadVersions() {
      var defer = $q.defer();
      $http.get(appValues.baseApi + "api/openproject/reloadversions").then(
        function (response) {
          Alertify.success("Retrieved my versions.");
          defer.resolve(response.data);
        },
        function (response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
      return defer.promise;
    }

    function getTimeEntryActivities() {
      var defer = $q.defer();
      $http.get(appValues.baseApi + "api/openproject/timeentryactivities").then(
        function (response) {
          Alertify.success("Retrieved time entry activities.");
          defer.resolve(response.data);
        },
        function (response) {
          Alertify.error(response.error);
          defer.reject(response.error);
        }
      );
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

    return this;
  }
})(angular.module("myApp"));
