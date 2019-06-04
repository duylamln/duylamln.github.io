(function (module) {
    module.service("authenService", authenService);
    authenService.$inject = ["$state", "$q", "Alertify", "accountService"];
    function authenService($state, $q, Alertify, accountService) {
        var self = this;
        self.initialize = initialize;
        self.logIn = logIn;
        self.logOut = logOut;
        self.user = firebase.auth().currentUser;
        self.userStateChangeCallbacks = [];
        self.registerUserStateChangeCallback = registerUserStateChangeCallback;
        self.updateUserProfile = updateUserProfile;
        self.getCurrentUser = () => firebase.auth().currentUser;

        self.getCurrentUserWithAccount = () => {
            var defer = $q.defer();
            var user = firebase.auth().currentUser;
            if (user) {
                accountService.getAccountByEmail(user.email)
                    .then(acc => {
                        user.account = acc;
                        defer.resolve(user);
                    }, defer.reject);
            }
            else {
                defer.resolve(undefined);
            }

            return defer.promise;
        }

        function initialize() {
            self.ui = new firebaseui.auth.AuthUI(firebase.auth());
            self.uiConfig = {
                callbacks: {
                    signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                        // User successfully signed in.
                        // Return type determines whether we continue the redirect automatically
                        // or whether we leave that to developer to handle.
                        self.user = authResult.user;
                        runUserStateChangeCallbacks(self.user);
                        $state.go(self.returnState, self.returnParams);
                    },
                    uiShown: function () {
                        // The widget is rendered.
                        // Hide the loader.
                        document.getElementById('loader').style.display = 'none';
                    }
                },
                // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
                signInFlow: 'popup',
                signInSuccessUrl: "/sprint",
                signInOptions: [
                    // Leave the lines as is for the providers you want to offer your users.
                    // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                    // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
                    // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
                    // firebase.auth.GithubAuthProvider.PROVIDER_ID,
                    firebase.auth.EmailAuthProvider.PROVIDER_ID
                    // firebase.auth.PhoneAuthProvider.PROVIDER_ID
                ],
                // Terms of service url.
                tosUrl: '<your-tos-url>',
                // Privacy policy url.
                privacyPolicyUrl: '<your-privacy-policy-url>'
            };
        }

        function logIn(returnState, params) {
            // The start method will wait until the DOM is loaded.
            self.returnState = returnState;
            if (params) self.returnParams = JSON.parse(params);
            self.ui.start('#firebaseui-auth-container', self.uiConfig);
        }

        function logOut(currentState) {
            return firebase.auth().signOut().then(successCallback, errorCallback);

            function successCallback() {
                Alertify.success("You has been logged out.");
                self.user = null;
                runUserStateChangeCallbacks(self.user);
                var stateService = $state.router.stateService;
                var currentStateConfig = stateService.get(currentState.name);
                if (currentStateConfig.requiredAuth) {
                    $state.go("main.sprint");
                }
            }

            function errorCallback(error) {
                Alertify.error(error);
            }
        }
        function runUserStateChangeCallbacks(user) {
            if (self.userStateChangeCallbacks.length > 0) {
                self.userStateChangeCallbacks.forEach(callback => {
                    callback(user);
                });
            }
        }
        function registerUserStateChangeCallback(func) {
            self.userStateChangeCallbacks.push(func);
        }

        function updateUserProfile(user) {
            var defer = $q.defer();

            var currentUser = firebase.auth().currentUser;
            currentUser.updateProfile({
                displayName: user.displayName,
                photoURL: user.photoURL,
                phoneNumber: user.phoneNumber
            }).then(
                () => {
                    Alertify.success("User profile has been updated successfully.")
                    currentUser.account = user.account;
                    defer.resolve(currentUser);
                    self.user = currentUser;
                },
                (error) => Alertify.error(error)
            );
            return defer.promise;
        }

        return self;
    }

})(angular.module("myApp"));