/*jslint browser:true this*/
/*global window console angular*/

(function () {
    "use strict";

    var services = angular.module("dataviz-services", []);

    services.service("DataService", function ($http) {
        this.url = "http://data.iledefrance.fr/explore/dataset/aide-aux-festivals-de-musiques-actuelles-et-amplifiees-2011-2013/download?format=json";
        this.getData = function (successCallback) {
            $http.jsonp(this.url + "&callback=JSON_CALLBACK")
                .then(function (resp) {
                    successCallback(resp.data);
                });
        };
    });
}());
