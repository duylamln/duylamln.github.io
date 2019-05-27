(function (module) {

    module.controller("AccountController", accountController);
    accountController.$inject = ["authenService", "accountService", "$q"];
    function accountController(authenService, accountService, $q) {
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

        setUser(authenService.getCurrentUser())
            .then((user) => {
                return accountService.getAccountByEmail(user.email)
            })
            .then(account => model.balance = account.balance);


        function saveUserProfile() {
            authenService.updateUserProfile(angular.copy(model.user))
                .then(setUser);
        }
    }
})(angular.module("myApp"));

