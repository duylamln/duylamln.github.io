(function (module) {


    module.service("userInfoService", userInfoService);

    userInfoService.$inject = ["$localStorage", "$q", "Alertify", "convertService"];


    function userInfoService($localStorage, $q, Alertify, convertService) {
        var database = firebase.database();
        var childName = "userInfos";

        this.getByUid = getByUid;
        this.createOrUpdate = createOrUpdate;

        function getByUid(uid) {
            var defer = $q.defer();
            var userInfos = database.ref(childName).orderByChild("uid").equalTo(uid).limitToFirst(1);
            userInfos.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        defer.resolve(undefined);
                    }
                    else {
                        snapshot.forEach(childSnapshot => defer.resolve(childSnapshot.val()));
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
            return defer.promise;
        }

        function createOrUpdate(userInfo) {
            var defer = $q.defer();

            if (!userInfo.key) userInfo.key = database.ref().child(childName).push().key;
            database.ref(childName + "/" + userInfo.key)
                .set(userInfo, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Create/Update user info successfully!");
                        defer.resolve(userInfo);
                    }
                });
            return defer.promise;
        }

        return this;
    }


})(angular.module("myApp"));
