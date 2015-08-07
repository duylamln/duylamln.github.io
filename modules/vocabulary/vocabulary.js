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
        }, function (newValue, oldValue) {
            if (newValue == undefined || newValue == oldValue) return;
            searchVocabularyByName(newValue);
        });
        function loadMoreVocabularies() {
            model.promise = $q.defer();
            getVocabularies();
        }

        function searchVocabularyByName() {
            model.promise = $q.defer();
            pageIndex = 0;
            model.vocabularies.length = 0;
            getVocabularies();
        }

        function getVocabularies() {
            vocabularyService.getVocabularies(model.searchText, pageIndex, pageSize)
                .then(function(response) {
                    if (response.length > 0) {
                        _.each(response, function(item) {
                            model.vocabularies.push(new VocabularyModel(item));
                        });
                        pageIndex += 1;
                        $scope.$apply();
                    }
                    model.promise.resolve();
                });
        }

        function editVocabulary(vocabulary) {
            $scope.$state.go('master.editvocabulary', { id: vocabulary.id });
        }

    }
})(angular.module('myApp.vocabulary'))