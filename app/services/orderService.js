(function (module) {
    /*
    order: {
        number,
        date,
        status: active|locked|closed,
        detail:[
            {
                name,
                desc,
                price
            }
        ]
    }    
    */

    module.service("orderService", orderService);

    orderService.$inject = ["$localStorage", "$q", "Alertify", "convertService"];


    function orderService($localStorage, $q, Alertify, convertService) {
        var database = firebase.database();
        this.createNewOrder = createNewOrder;
        this.subscribeOrders = subscribeOrders;
        this.subscribeOrder = subscribeOrder;
        this.updateOrder = updateOrder;
        this.removeOrder = removeOrder;

        this.getFeaturedOrders = getFeaturedOrders;
        this.addFeaturedOrder = addFeaturedOrder;
        this.removeFeaturedOrder = removeFeaturedOrder;
        this.updateFeaturedOrder = updateFeatureOrder;

        function createNewOrder(order) {
            var defer = $q.defer();

            convertService.convertMomentToString(order);

            if (!order.key) order.key = database.ref().child("orders").push().key;
            database.ref("orders/" + order.key)
                .set(order, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Order created!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        function updateOrder(order) {
            var defer = $q.defer();

            var datapost = angular.copy(order);
            convertService.convertMomentToString(datapost);

            if (!datapost.key) datapost.key = database.ref().child("orders").push().key;
            database.ref("orders/" + datapost.key)
                .set(datapost, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Order updated!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        function removeOrder(order) {
            var defer = $q.defer();
            database.ref("orders/" + order.key)
                .remove(function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Order removed!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        function subscribeOrders(callback) {
            var weekFilter = database.ref("orders").orderByChild("date").limitToLast(10);
            weekFilter.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback([]);
                    }
                    else {
                        var data = [];
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            var order = childSnapshot.val();
                            order.key = key;
                            convertService.convertStringToMoment(order);
                            data.push(order);
                        })
                        callback(data);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
        }

        function subscribeOrder(orderKey, callback) {
            var weekFilter = database.ref("orders").orderByChild("key").equalTo(orderKey).limitToFirst(1);
            weekFilter.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback(null);
                    }
                    else {
                        var order;
                        snapshot.forEach(function (childSnapshot) {
                            order = childSnapshot.val();
                        })
                        callback(order);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
        }

        function getFeaturedOrders(callback) {
            var featuredOrder = database.ref("featuredOrders").orderByChild("key");
            featuredOrder.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback([]);
                    }
                    else {
                        var result = [];
                        snapshot.forEach(function (childSnapshot) {
                            result.push(childSnapshot.val());
                        })
                        callback(result);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
        }

        function addFeaturedOrder(order, callback) {
            var defer = $q.defer();
            var featuredOrder = order;

            if (!featuredOrder.key) featuredOrder.key = database.ref().child("featuredOrders").push().key;
            database.ref("featuredOrders/" + featuredOrder.key)
                .set(featuredOrder, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Featured Order created!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        function removeFeaturedOrder(order, callback) {
            var defer = $q.defer();
            database.ref("featuredOrders/" + order.key)
                .remove(function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Featured Order removed!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        function updateFeatureOrder(order, callback) {
            var defer = $q.defer();

            var datapost = angular.copy(order);

            database.ref("featuredOrders/" + datapost.key)
                .set(datapost, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Featured Order updated!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }
    }


})(angular.module("myApp"));
