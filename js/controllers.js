/*jslint browser:true this*/
/*global window console angular*/

(function () {
    "use strict";

    var controllers = angular.module("dataviz-controllers", []);

    controllers.controller("HomeCtrl", function () {
        console.log("HomeCtrl");
    });

    controllers.controller("amChartsCtrl", function (DataService) {
        var self = this;
        this.title = "amCharts";

        DataService.getData(function (data) {
            console.log(data);
            // var formatedDatas = self.proceedData(data);
            // self.generateChart(formatedDatas);
        });

        this.proceedData = function (data) {
            var formatedDatas = [];
            data.forEach(function (record) {
                var dep = record.fields.adresse_administrative_code_departement_du_tiers_beneficiaire;
                if (dep === undefined) {
                    return;
                }
                var obj = {};
                var existing = self.isDepInArray(formatedDatas, dep);
                if (!existing) {
                    obj.departement = dep;
                    obj.count = 1;
                    formatedDatas.push(obj);
                } else {
                    existing.count += 1;
                }
            });
            return formatedDatas;
        };
        this.isDepInArray = function (formatedDatas, dep) {
            var arr = formatedDatas.filter(function (data) {
                return data.departement === dep;
            });
            return (arr.length === 0)
                ? false
                : arr[0];
        };
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
