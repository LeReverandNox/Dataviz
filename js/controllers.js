/*jslint browser:true this*/
/*global window console angular*/

(function () {
    "use strict";

    var controllers = angular.module("dataviz-controllers", []);

    controllers.controller("HomeCtrl", function () {
        console.log("HomeCtrl");
    });
    controllers.controller("amChartsCtrl", function () {
        this.title = "amCharts";
        console.log("amChartsCtrl");
    });
    controllers.controller("highChartsCtrl", function () {
        this.title = "HighCharts";
        console.log("highchartsCtrl");
    });
    controllers.controller("D3JSCtrl", function () {
        this.title = "D3JS";
        console.log("D3JSCtrl");
    });
    controllers.controller("RaphaelJSCtrl", function () {
        this.title = "RaphaelJS";
        console.log("RaphaelJSCtrl");
    });
}());
