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
                abstract: true,
                url: "/home",
                templateUrl: "partials/home.html",
                controller: "HomeCtrl",
                controllerAs: "HCtrl"
            })
            .state("home.amcharts", {
                url: "/amcharts",
                views: {
                    amcharts: {
                        templateUrl: "partials/amcharts.html",
                        controller: "amChartsCtrl",
                        controllerAs: "aCCtrl"
                    }
                }
            })
            .state("home.highcharts", {
                url: "/highcharts",
                views: {
                    highcharts: {
                        templateUrl: "partials/highcharts.html",
                        controller: "highChartsCtrl",
                        controllerAs: "hCCtrl"
                    }
                }
            })
            .state("home.d3js", {
                url: "/d3js",
                views: {
                    d3js: {
                        templateUrl: "partials/d3js.html",
                        controller: "D3JSCtrl",
                        controllerAs: "DCtrl"
                    }
                }
            })
            .state("home.raphaeljs", {
                url: "/raphaeljs",
                views: {
                    raphaeljs: {
                        templateUrl: "partials/raphaeljs.html",
                        controller: "RaphaelJSCtrl",
                        controllerAs: "RCtrl"
                    }
                }
            })
            .state("home.googlemap", {
                url: "/googlemap",
                views: {
                    googlemap: {
                        templateUrl: "partials/googlemap.html",
                        controller: "GoogleMapCtrl",
                        controllerAs: "GMCtrl"
                    }
                }
            })
            .state("home.heatmap", {
                url: "/heatmap",
                views: {
                    heatmap: {
                        templateUrl: "partials/heatmap.html",
                        controller: "HeatMapCtrl",
                        controllerAs: "HMCtrl"
                    }
                }
            });
        $urlRouterProvider.otherwise("/home/amcharts");
    });
}());
