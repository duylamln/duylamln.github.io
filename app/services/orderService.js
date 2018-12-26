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
        this.subscribeActiveOrders = subscribeActiveOrders;
        this.subscribeOrderDetail = subscribeOrderDetail;
        this.updateOrder = updateOrder;
        this.removeOrder = removeOrder;

        function createNewOrder() {
            var defer = $q.defer();
            var order = {
                date: moment(),
                status: "active",
                detail: []
            };
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

        function subscribeActiveOrders(callback) {
            var weekFilter = database.ref("orders").orderByChild("status").equalTo("active").limitToFirst(5);
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

        function subscribeOrderDetail(order, callback) {
            var weekFilter = database.ref("orders").orderByChild("key").equalTo(order.key).limitToFirst(1);
            weekFilter.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback([]);
                    }
                    else {
                        var newOrder = [];
                        snapshot.forEach(function (childSnapshot) {
                            newOrder = childSnapshot.val();
                        })
                        callback(newOrder.detail);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });

        }


        // function getByWeekNumber(weekNumber) {
        //     var defer = $q.defer();
        //     var weekFilter = database.ref("weeks").orderByChild("number").equalTo(weekNumber).limitToFirst(1);
        //     weekFilter.once("value",
        //         function (snapshot) {
        //             if (!snapshot.exists()) {
        //                 defer.resolve(null);
        //             }
        //             else {
        //                 snapshot.forEach(function(childSnapshot){                            
        //                     var key= childSnapshot.key;
        //                     var weekData = childSnapshot.val();
        //                     weekData.key = key;
        //                     convertService.convertStringToMoment(weekData);
        //                     defer.resolve(weekData);
        //                 })
        //             }
        //         },
        //         function (error) {
        //             Alertify.error(error);
        //             defer.reject(error);
        //         });

        //     return defer.promise;
        // }

        // function saveTimesheet(week) {
        //     var defer = $q.defer();

        //     var datapost = angular.copy(week);
        //     convertService.convertMomentToString(datapost);

        //     if (!datapost.key) datapost.key = database.ref().child("weeks").push().key;
        //     database.ref("weeks/" + datapost.key)
        //         .set(datapost, function (error) {
        //             if (error) {
        //                 Alertify.error(error);
        //                 defer.reject(error);
        //             }
        //             else {
        //                 Alertify.success("Timesheet saved!");
        //                 defer.resolve();
        //             }
        //         });
        //     return defer.promise;
        // }
        // return this;
    }


})(angular.module("myApp"));
