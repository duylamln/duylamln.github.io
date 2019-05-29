(function (module) {


    module.service("accountService", accountService);

    accountService.$inject = ["$localStorage", "$q", "Alertify", "convertService"];


    function accountService($localStorage, $q, Alertify, convertService) {
        var database = firebase.database();


        subscribeAccounts = (callback) => {
            var accounts = database.ref("accounts").orderByChild("displayName").limitToLast(1000);
            accounts.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback([]);
                    }
                    else {
                        var data = [];
                        snapshot.forEach(function (childSnapshot) {
                            var key = childSnapshot.key;
                            var account = childSnapshot.val();
                            account.key = key;
                            data.push(account);
                        })
                        callback(data);
                    }
                },
                function (error) {
                    Alertify.error(error);
                    defer.reject(error);
                });
        };

        createOrUpdateAccount = (account) => {
            var defer = $q.defer();

            if (!account.key) account.key = database.ref().child("accounts").push().key;
            database.ref("accounts/" + account.key)
                .set(account, function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Create/Update account successfully!");
                        defer.resolve(account);
                    }
                });
            return defer.promise;
        }

        function removeAccount(account) {
            var defer = $q.defer();
            database.ref("accounts/" + account.key)
                .remove(function (error) {
                    if (error) {
                        Alertify.error(error);
                        defer.reject(error);
                    }
                    else {
                        Alertify.success("Account removed!");
                        defer.resolve();
                    }
                });
            return defer.promise;
        }

        function subscribeAccountByEmail(email, callback) {
            var emails = database.ref("accounts").orderByChild("email").equalTo(email).limitToFirst(1);
            emails.on("value",
                function (snapshot) {
                    if (!snapshot.exists()) {
                        callback(undefined);
                    }
                    else {
                        snapshot.forEach(childSnapshot => callback(childSnapshot.val()));
                    }
                },
                function (error) {
                    Alertify.error(error);                    
                });
        }

        function getAccountByEmail(email) {
            var defer = $q.defer();
            var emails = database.ref("accounts").orderByChild("email").equalTo(email).limitToFirst(1);
            emails.on("value",
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

        function debit(email, amount) {
            var defer = $q.defer();

            getAccountByEmail(email)
                .then(account => {
                    account.balance = parseFloat(account.balance || 0) - parseFloat(amount || 0);
                    return $q.when(account);
                })
                .then(createOrUpdateAccount)
                .then(defer.resolve, defer.reject);

            return defer.promise;
        }

        function deposit(email, amount) {
            var defer = $q.defer();

            getAccountByEmail(email)
                .then(account => {
                    account.balance = parseFloat(account.balance || 0) + parseFloat(amount || 0);
                    return $q.when(account);
                })
                .then(createOrUpdateAccount)
                .then(defer.resolve, defer.reject);

            return defer.promise;
        }

        this.subscribeAccounts = subscribeAccounts;
        this.createOrUpdateAccount = createOrUpdateAccount;
        this.removeAccount = removeAccount;
        this.getAccountByEmail = getAccountByEmail;
        this.debit = debit;
        this.deposit = deposit;
        this.subscribeAccountByEmail = subscribeAccountByEmail;

        return this;
    }


})(angular.module("myApp"));
