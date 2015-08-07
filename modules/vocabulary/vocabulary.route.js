(function (module) {
    module.config(['$stateProvider', function ($stateProvider) {
        $stateProvider
            .state('master.vocabulary',
                {
                    url: '/vocabulary',
                    templateUrl: 'modules/vocabulary/vocabulary.html',
                    controller: 'VocabularyController',
                    controllerAs: 'model'
                })
            .state('master.addvocabulary',
                {
                    url: '/vocabulary/add',
                    templateUrl: 'modules/vocabulary/vocabulary.creation.html',
                    controller: 'VocabularyCreationController',
                    controllerAs: 'model'
                })
            .state('master.editvocabulary',
                {
                    url: '/vocabulary/:id',
                    templateUrl: 'modules/vocabulary/vocabulary.creation.html',
                    controller: 'VocabularyCreationController',
                    controllerAs: 'model'
                });
    }]);
})(angular.module("myApp.vocabulary"))