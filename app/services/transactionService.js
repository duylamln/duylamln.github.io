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
                .then(tran => depositAccountBalance(tran, transaction))
                .then(debitAccountBalance)
                .then(self.createOrUpdateTransaction)
                .then(() => defer.resolve(transaction), (error) => defer.reject(error));

            return defer.promise;
        }

        function depositAccountBalance(tran, transaction) {
            var isUpdate = !!tran;
            if (isUpdate) {
                console.log("update transaction");
                transaction.key = tran.key;
                var defer = $q.defer();

                if (tran.payer) {
                    accountService.deposit(tran.payer.email, tran.amount)
                        .then((account) => {
                            transaction.balance = account.balance;
                            defer.resolve(transaction);
                        }, defer.reject);
                }
                else {
                    defer.resolve(transaction);
                }

                return defer.promise;
            }
            else {
                console.log("create new transaction");
                return $q.when(transaction);
            }
        }

        function debitAccountBalance(tran) {
            var defer = $q.defer();
            if (tran && tran.payer) {
                accountService.debit(tran.payer.email, tran.amount)
                    .then((account) => {
                        tran.balance = account.balance;
                        defer.resolve(tran);
                    }, defer.reject);
            }
            else {
                defer.resolve();
            }
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
                    if (tran && tran.payer) {
                        return accountService.deposit(tran.payer.email, tran.amount);
                    }
                    else {
                        return $q.when(undefined);
                    }
                })
                .then(() => defer.resolve(), error => defer.reject(error));

            return defer.promise;
        }

        this.getTransactionByEmail = (email, callback) => {
            var transactions = database.ref("transactions").orderByChild("payer/email").equalTo(email).limitToLast(100);
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
                        data = _.orderBy(data, "createdDate", "desc");
                        callback(data);
                    }
                },
                function (error) {
                    Alertify.error(error);
                });
        }

        this.pushTransaction = (order, orderDetail) => {
            var transaction = {
                id: orderDetail.tranId,
                desc: orderDetail.name + " - " + orderDetail.desc,
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
