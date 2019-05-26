(function (module) {


    module.service("transactionService", transactionService);

    transactionService.$inject = ["$localStorage", "$q", "Alertify", "convertService", "accountService"];


    function transactionService($localStorage, $q, Alertify, convertService, accountService) {
        var database = firebase.database();

        var self = this;
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
                            convertService.convertStringToMoment(transaction);
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
            convertService.convertMomentToString(transaction);
            if (!transaction.key) transaction.key = database.ref().child("transactions").push().key;
            database.ref("transactions/" + transaction.key)
                .set(transaction, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Create/Update Transaction successfully!");
                        defer.resolve(transaction);
                    }
                });
            return defer.promise;
        }

        this.getTransactionById = (id) => {
            var defer = $q.defer();

            var transaction = database.ref("transactions").orderByChild("id").equalTo(id).limitToFirst(1);
            transaction.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        defer.resolve(undefined);
                    }
                    else {
                        //update existed one
                        var tran;
                        snapshot.forEach(function (childSnapshot) {
                            tran = childSnapshot.val();
                        })
                        defer.resolve(tran);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
            return defer.promise;
        }

        this.createOrUpdateTransactionById = (transaction) => {
            var defer = $q.defer();
            var isUpdate = false;
            self.getTransactionById(transaction.id)
                .then((tran) => {
                    isUpdate = !!tran;
                    if (isUpdate) {
                        console.log("update transaction");
                        transaction.key = tran.key;
                        var defer = $q.defer();
                        accountService.deposit(tran.payer.email, tran.amount)
                            .then((account) => {
                                transaction.balance = account.balance;
                                defer.resolve(transaction);
                            }, defer.reject);

                        return defer.promise;
                    }
                    else {
                        console.log("create new transaction");
                        return $q.when(transaction);
                    }
                })
                .then(tran => {
                    var defer = $q.defer();
                    accountService.debit(tran.payer.email, tran.amount)
                        .then((account) => {
                            tran.balance = account.balance;
                            defer.resolve(tran);
                        }, defer.reject);
                    return defer.promise;
                })
                .then(self.createOrUpdateTransaction)
                .then(() => defer.resolve(transaction), (error) => defer.reject(error));

            return defer.promise;
        }

        this.removeTransaction = (transaction) => {
            var defer = $q.defer();
            if (!transaction) defer.resolve()
            else {
                database.ref("transactions/" + transaction.key)
                    .remove(function (error) {
                        if (error) {
                            Alertify.error(error);
                            defer.reject(error);
                        }
                        else {
                            Alertify.success("Transaction removed!");
                            defer.resolve(transaction);
                        }
                    });
            }
            return defer.promise;
        }

        this.removeTransactionById = (tranId) => {
            var defer = $q.defer();

            self.getTransactionById(tranId)
                .then(self.removeTransaction)
                .then((tran) => {
                    return accountService.deposit(tran.payer.email, tran.amount);
                })
                .then(() => defer.resolve(), error => defer.reject(error));

            return defer.promise;
        }

        this.getTransactionByEmail = (email) => {
            var defer = $q.defer();
            var transactions = database.ref("transactions").orderByChild("payer/email").equalTo(email).limitToFirst(10);
            transactions.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        defer.resolve([]);
                    }
                    else {
                        var data = [];
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            var transaction = childSnapshot.val();
                            transaction.key = key;
                            convertService.convertStringToMoment(transaction);
                            data.push(transaction);
                        })
                        defer.resolve(data);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
            return defer.promise;
        }

        this.pushTransaction = (order, orderDetail) => {
            if (!order.withdrawFromAccountBalance) return $q.when();
            var transaction = {
                id: orderDetail.tranId,
                desc: orderDetail.desc,
                amount: orderDetail.finalPrice,
                payer: orderDetail.createdUser,
                createdDate: moment(),
                method: "DEBIT",
                order: {
                    key: order.key,
                    totalFinalPrice: order.totalFinalPrice,
                    name: order.name
                }
            };

            return self.createOrUpdateTransactionById(transaction);
        }
        return this;
    }


})(angular.module("myApp"));
