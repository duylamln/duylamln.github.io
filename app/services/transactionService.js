(function (module) {


    module.service("transactionService", transactionService);

    transactionService.$inject = ["$localStorage", "$q", "Alertify"];


    function transactionService($localStorage, $q, Alertify) {
        var database = firebase.database();


        this.subscribeTransactions = (callback) => {
            var transactions = database.ref("transactions").orderByChild("createdDate").limitToLast(1000);
            transactions.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback([]);
                    }
                    else {
                        var data = [];
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            var transaction = childSnapshot.val();
                            transaction.key = key;
                            data.push(transaction);
                        })
                        callback(data);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
        };

        this.createOrUpdateTransaction = (transaction) => {
            var defer = $q.defer();

            if (!transaction.key) transaction.key = database.ref().child("transactions").push().key;
            database.ref("transactions/" + transaction.key)
                .set(transaction, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Create/Update Transaction successfully!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        this.removeTransaction = (transaction) => {
            var defer = $q.defer();
            database.ref("transactions/" + transaction.key)
                .remove(function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Transaction removed!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        return this;
    }


})(angular.module("myApp"));
