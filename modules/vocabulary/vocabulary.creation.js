(function (module) {
    module.controller('VocabularyCreationController', VocabularyCreationController);
    VocabularyCreationController.$inject = ['$scope', 'vocabularyService', 'VocabularyModel'];

    function VocabularyCreationController($scope, vocabularyService, VocabularyModel) {
        var model = this;
        //properties
        model.isOpendAddVocabularyRegion = false;
        model.newVocabularyModel = null;
        //function
        model.toogleAddVocabularyRegion = toogleAddVocabularyRegion;
        model.addMoreSentences = addMoreSentences;
        model.removeSentence = removeSentence;
        model.saveVocabulary = saveVocabulary;

        activate();
        
        function activate() {
            if ($scope.$stateParams.id) {
                vocabularyService.getVocabularyById($scope.$stateParams.id)
                    .then(function (response) {
                        if (response && response.length > 0) {
                            model.newVocabularyModel = new VocabularyModel(response[0]);
                            $scope.$apply();
                        }
                    });
            } else {
                model.newVocabularyModel = new VocabularyModel();
                model.newVocabularyModel.sentences.push({ value: '' });
            }
            
        }


        function toogleAddVocabularyRegion() {
            model.isOpendAddVocabularyRegion = !model.isOpendAddVocabularyRegion;
            if (model.isOpendAddVocabularyRegion) {
                model.newVocabularyModel = new VocabularyModel();
                model.newVocabularyModel.sentences.push({ value: '' });
            } 
        }
        function addMoreSentences() {
            model.newVocabularyModel.sentences.push({ value: '' });
        }

        function removeSentence(index) {
            model.newVocabularyModel.sentences.splice(index, 1);
        }

        function saveVocabulary() {
            if (!model.newVocabularyModel) return;
            vocabularyService.addVocabulary(model.newVocabularyModel)
                .then(function (response) {
                    
                    toastr.success("Add new vocabulary successfully!");
                    model.newVocabularyModel = new VocabularyModel();
                    model.newVocabularyModel.sentences.push({ value: '' });
                    $scope.$apply();
                });
        }
    }
})(angular.module('myApp.vocabulary'))