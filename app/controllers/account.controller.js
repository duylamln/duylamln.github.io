(function (module) {

    module.controller("AccountController", accountController);
    accountController.$inject = ["authenService", "accountService", "$q", "transactionService", "$timeout", "userInfoService"];
    function accountController(authenService, accountService, $q, transactionService, $timeout, userInfoService) {
        var model = this;
        model.saveUserProfile = saveUserProfile;

        setUser = (user) => {
            var { displayName, email, photoURL, phoneNumber, account, uid, userInfo } = user;
            model.user = {
                email: email,
                displayName: displayName,
                photoURL: photoURL,
                phoneNumber: phoneNumber,
                account: account,
                uid: uid,
                userInfo: userInfo
            };
            return $q.when(model.user);
        };

        activate();

        function activate() {
            authenService.getCurrentUserWithAccount()
                .then(getUserInfo)
                .then(setUser)
                .then((currentUser) => {
                    transactionService.getTransactionByEmail(currentUser.email, (trans) => {
                        $timeout(() => {
                            model.transactions = trans;
                        }, 0);
                    });
                });
        }

        function getUserInfo(user) {
            return userInfoService.getByUid(user.uid)
                .then(userInfo => {
                    user.userInfo = userInfo || createUserInfo(user);
                    return $q.when(user);
                });
        }

        function createUserInfo(user) {
            var { uid, email } = user;
            return {
                uid: uid,
                email: email,
                openProjectAPIKey: ""
            };
        }
        function saveUserProfile() {
            authenService.updateUserProfile(angular.copy(model.user))
                .then(setUser)
                .then(updateUserInfo);
        }

        function updateUserInfo(user) {
            return userInfoService.createOrUpdate(user.userInfo)
                .then((userInfo) => {
                    user.userInfo = userInfo;
                    return $.when(user);
                });
        }
    }
})(angular.module("myApp"));

