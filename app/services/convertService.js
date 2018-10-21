(function (module) {
    module.service("convertService", convertService);

    function convertService() {
        this.convertMomentToString = convertMomentToString;
        this.convertStringToMoment = convertStringToMoment;
        function convertMomentToString(sourceObject) {
            if (!sourceObject) return;
            if(!_.isObject(sourceObject)) return;
            var keys = _.keys(sourceObject);
            if (keys.length == 0) return;
            _.each(keys, function (key) {
                if (moment.isMoment(sourceObject[key])) {
                    sourceObject[key] = sourceObject[key].toISOString();
                }
                else {
                    convertMomentToString(sourceObject[key]);
                }
            });
        }

        function convertStringToMoment(sourceObject){
            if (!sourceObject) return;
            if(!_.isObject(sourceObject)) return;
            var keys = _.keys(sourceObject);
            if (keys.length == 0) return;
            _.each(keys, function (key) {
                if (moment(sourceObject[key], moment.ISO_8601, true).isValid()) {
                    sourceObject[key] = moment(sourceObject[key]);
                }
                else {
                    convertStringToMoment(sourceObject[key]);
                }
            });
        }


        return this;
    }


})(angular.module("myApp"));