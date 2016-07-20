/*jslint browser:true this*/
/*global window console angular*/

(function () {
    "use strict";

    var app = angular.module("dataviz", [
        "ui.router",
        "dataviz-controllers",
        "dataviz-services",
        "ngMaterial"
    ]);

    app.config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state("home", {
                url: "/",
                templateUrl: "partials/home.html"
            });
        $urlRouterProvider.otherwise("/");
    });
}());
