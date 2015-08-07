(function (module) {
    module.service('vocabularyService', vocabularyService);
    vocabularyService.$inject = [];

    function vocabularyService() {
        this.init = function () {
            Parse.initialize("u4XKvtb4gCU0P7smzWI09ORk2Ytg933Elt4kxa6J", "l0KaCpkeUgCfwudDHaxrqPwem1IVuil0AwoL3Mun");
        };
        this.init();

        this.getVocabularys = function (pageIndex, pageSize) {
            var Tracker = Parse.Object.extend("Vocabulary");
            var query = new Parse.Query(Tracker);
            query.addDescending("createdAt");
            query.skip(pageIndex * pageSize);
            query.limit(pageSize);
            return query.find();

        };

        this.getVocabularyById = function (id) {
            var Tracker = Parse.Object.extend("Vocabulary");
            var query = new Parse.Query(Tracker);
            query.equalTo("objectId", id);
            return query.find();

        };

        this.addVocabulary = function (vocabularyModel) {
            var Vocabulary = Parse.Object.extend('Vocabulary');
            var vocaularyParseModel = new Vocabulary();

            vocaularyParseModel.set('Word', vocabularyModel.word);
            vocaularyParseModel.set('Transcribe', vocabularyModel.transcribe);
            vocaularyParseModel.set('Meaning', vocabularyModel.meaning);
            var sentences = _.map(vocabularyModel.sentences, function (item) {
                return { value: item.value };
            });
            vocaularyParseModel.set('Sentences', sentences);

            return vocaularyParseModel.save();
        };

        this.updateVocabulary = function (vocabularyModel) {
            var Vocabulary = Parse.Object.extend('Vocabulary');
            var vocaularyParseModel = new Vocabulary();

            vocaularyParseModel.set('objectId', vocabularyModel.objectId);
            vocaularyParseModel.set('Word', vocabularyModel.word);
            vocaularyParseModel.set('Transcribe', vocabularyModel.transcribe);
            vocaularyParseModel.set('Meaning', vocabularyModel.meaning);
            vocaularyParseModel.set('Sentences', vocabularyModel.sentences);

            return vocaularyParseModel.save();
        };

        this.removeVocabularyByName = function (name) {

        };

        this.removeVocabularyById = function (id) {
        };

    }
})(angular.module('myApp.vocabulary'))