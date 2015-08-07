(function (module) {
    module.factory('VocabularyModel', function() {
        return function VocabularyModel(parseModel) {
            if (parseModel) {
                this.id = parseModel.id;
                this.word = parseModel.get('Word');
                this.transcribe = parseModel.get('Transcribe');
                this.meaning = parseModel.get('Meaning');
                this.sentences = parseModel.get('Sentences');
                this.createdAt = parseModel.createdAt;
                this.updatedAt = parseModel.updatedAt;
            } else {
                this.word = '';
                this.transcribe = '';
                this.meaning = '';
                this.sentences = [];
            }
        };
    });
})(angular.module('myApp.vocabulary'))