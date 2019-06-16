(function (module) {

    module.service("fbRtService", fbRtService);

    fbRtService.$inject = ["$localStorage", "$q", "Alertify", "convertService"];

    function fbRtService($localStorage, $q, Alertify, convertService) {
        var database = firebase.database();

        this.subsribeCollection = subscribeCollection;
        this.subsribeFilterCollection = subscribeFilterCollection;
        this.createOrUpdate = createOrUpdate;
        this.remove = remove;
        this.getByKey = getByKey;
        this.find = find;
        this.filter = filter;

        function subscribeCollection(name, callback) {
            var collection = database.ref(name).limitToLast(1000);
            collection.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback([]);
                    }
                    else {
                        var result = [];
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            var item = childSnapshot.val();
                            item.key = key;
                            data.push(item);
                        })
                        callback(result);
                    }
                },
                function (error) {
                    Alertify.error(error);
                });
        }

        function subscribeFilterCollection(name, predicate, orderBy, callback) {
            var collection = database.ref(name).orderByChild(predicate.path).equalTo(predicate.value).limitToFirst(predicate.take || 1000);
            collection.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback([]);
                    }
                    else {
                        var data = [];
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            var item = childSnapshot.val();
                            item.key = key;
                            convertService.convertStringToMoment(item);
                            data.push(item);
                        })
                        if (orderBy) {
                            data = _.orderBy(data, ordebyBy.key, orderBy.orientation || "asc");
                        }
                        callback(data);
                    }
                },
                function (error) {
                    Alertify.error(error);
                });
        }

        function createOrUpdate(name, item) {
            var defer = $q.defer();
            convertService.convertMomentToString(item);
            if (!item.key) item.key = database.ref().child(name).push().key;
            database.ref(name + "/" + item.key)
                .set(item, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success(`Create/Update ${name} successfully!`);
                        defer.resolve(item);
                    }
                });
            return defer.promise;
        }

        function remove(name, item) {
            var defer = $q.defer();
            database.ref(name + "/" + item.key)
                .remove(function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success(`${name} removed!`);
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        function getByKey(name, key) {
            var defer = $q.defer();
            var collection = database.ref(name).orderByChild("key").equalTo(key).limitToFirst(1);
            collection.on("value",
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

        function find(name, predicate) {
            var defer = $q.defer();
            var collection = database.ref(name).orderByChild(predicate.path).equalTo(predicate.value).limitToFirst(1);
            collection.on("value",
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

        function filter(name, predicate, orderBy) {
            var defer = $q.defer();
            var collection = database.ref(name).orderByChild(predicate.path).equalTo(predicate.value).limitToFirst(predicate.take || 1000);
            collection.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        defer.resolve(undefined);
                    }
                    else {
                        var data = [];
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            var item = childSnapshot.val();
                            item.key = key;
                            convertService.convertStringToMoment(item);
                            data.push(item);
                        })
                        if (orderBy) {
                            data = _.orderBy(data, ordebyBy.key, orderBy.orientation || "asc");
                        }
                        defer.resolve(data);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
            return defer.promise;
        }

        return this;
    }

})(angular.module("myApp"));
