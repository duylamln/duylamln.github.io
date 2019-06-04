(function (module) {

    module.controller("AccountController", accountController);
    accountController.$inject = ["authenService", "accountService", "$q", "transactionService", "$timeout"];
    function accountController(authenService, accountService, $q, transactionService, $timeout) {
        var model = this;
        model.saveUserProfile = saveUserProfile;

        setUser = (user) => {
            var { displayName, email, photoURL, phoneNumber, account } = user;
            model.user = {
                email: email,
                displayName: displayName,
                photoURL: photoURL,
                phoneNumber: phoneNumber,
                account: account
            };
            return $q.when(model.user);
        };

        activate();

        function activate() {
            authenService.getCurrentUserWithAccount()
                .then(setUser)
                .then((currentUser) => {
                    transactionService.getTransactionByEmail(currentUser.email, (trans) => {
                        $timeout(() => {
                            model.transactions = trans;
                        }, 0);
                    });
                });
        }

        function saveUserProfile() {
            authenService.updateUserProfile(angular.copy(model.user))
                .then(setUser)
                .then(updateAccount);
        }

        function updateAccount(user) {
            var { account } = user;
            accountService.createOrUpdateAccount(account);
        }
    }
})(angular.module("myApp"));

