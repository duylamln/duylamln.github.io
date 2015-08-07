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
        //function
        model.loadMoreVocabularies = loadMoreVocabularies;
        model.editVocabulary = editVocabulary;

        activate();
        
        function activate() {
            
        }

        function loadMoreVocabularies() {
            model.promise = $q.defer();
            vocabularyService.getVocabularys(pageIndex, pageSize)
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