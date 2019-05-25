(function (module) {

    module.controller("AccountController", accountController);
    accountController.$inject = ["authenService"];
    function accountController(authenService) {
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
        };

        setUser(authenService.getCurrentUser());


        function saveUserProfile() {
            authenService.updateUserProfile(angular.copy(model.user))
                .then(setUser);
        }
    }
})(angular.module("myApp"));

