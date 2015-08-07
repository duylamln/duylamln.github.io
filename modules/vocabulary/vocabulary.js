(function (module) {
    module.controller('VocabularyController', VocabularyController);
    VocabularyController.$inject = ['$scope', '$q', 'vocabularyService', 'VocabularyModel'];

    function VocabularyController($scope, $q, vocabularyService, VocabularyModel) {
        var model = this;
        var pageIndex = 0;
        var pageSize = 5;
        //properties
        model.vocabularies = [];
        model.promise = null;
        model.searchText = '';
        //function
        model.loadMoreVocabularies = loadMoreVocabularies;
        model.editVocabulary = editVocabulary;

        $scope.$watch(function() {
            return model.searchText;
        }, function (newValue) {
            if (!newValue || newValue == '') return;
            searchVocabularyByName(newValue);
        });
        function loadMoreVocabularies() {
            model.promise = $q.defer();
            vocabularyService.getVocabularys(model.searchText, pageIndex, pageSize)
                .then(function (response) {
                    _.each(response, function (item) {
                        model.vocabularies.push(new VocabularyModel(item));
                    });
                    pageIndex += 1;
                    model.promise.resolve();
                    $scope.$apply();
                });
        }

        function searchVocabularyByName(newValue) {
            model.promise = $q.defer();
            pageIndex = 0;
            model.vocabularies.length = 0;
            vocabularyService.getVocabularys(model.searchText, pageIndex, pageSize)
                .then(function (response) {
                    _.each(response, function (item) {
                        model.vocabularies.push(new VocabularyModel(item));
                    });
                    pageIndex += 1;
                    model.promise.resolve();
                    $scope.$apply();
                });
        }

        function editVocabulary(vocabulary) {
            $scope.$state.go('master.editvocabulary', { id: vocabulary.id });
        }

    }
})(angular.module('myApp.vocabulary'))