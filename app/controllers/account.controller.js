(function (module) {

    module.controller("AccountController", accountController);
    accountController.$inject = ["authenService", "accountService", "$q", "transactionService", "$timeout"];
    function accountController(authenService, accountService, $q, transactionService, $timeout) {
        var model = this;
        model.saveUserProfile = saveUserProfile;

        setUser = (user) => {
            var { displayName, email, photoURL, phoneNumber } = user;
            model.user = {
                email: email,
                displayName: displayName,
                photoURL: photoURL,
                phoneNumber: phoneNumber
            };
            return $q.when(model.user);
        };

        activate();

        function activate() {
            var currentUser = authenService.getCurrentUser();
            setUser(currentUser)
                .then((user) => {
                    return accountService.getAccountByEmail(user.email)
                })
                .then(account => model.balance = account.balance);

            transactionService.getTransactionByEmail(currentUser.email, (trans) => {
                $timeout(() => {
                    model.transactions = trans;
                }, 0);
            }); 

        }


        function saveUserProfile() {
            authenService.updateUserProfile(angular.copy(model.user))
                .then(setUser);
        }
    }
})(angular.module("myApp"));

