/*jslint browser:true this*/
/*global window console angular AmCharts $*/

(function () {
    "use strict";

    var controllers = angular.module("dataviz-controllers", []);

    controllers.controller("HomeCtrl", function () {
        console.log("HomeCtrl");
    });

    controllers.controller("amChartsCtrl", function (DataService) {
        var self = this;
        this.title = "amCharts";
        this.element = document.querySelector("#amcharts");

        DataService.getData(function (data) {
            var formatedDatas = self.proceedData(data);
            self.generateChart(formatedDatas);
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
        this.generateChart = function (formatedDatas) {
            // DAT chart
            var chart = new AmCharts.AmSerialChart();
            chart.dataProvider = formatedDatas;
            chart.categoryField = "departement";
            chart.angle = 30;
            chart.depth3D = 30;

            var categoryAxis = chart.categoryAxis;
            categoryAxis.title = "Départements";

            var valueAxis = new AmCharts.ValueAxis();
            valueAxis.title = "Nombre d'aides";
            chart.addValueAxis(valueAxis);

            var graph = new AmCharts.AmGraph();
            graph.valueField = "count";
            graph.type = "column";
            graph.fillColors = "red";
            graph.fillAlphas = 0.8;
            chart.addGraph(graph);

            // Phoenix Write !
            chart.write(this.element);
        };
    });

    controllers.controller("highChartsCtrl", function (DataService) {
        var self = this;
        this.title = "HighCharts";

        DataService.getData(function (data) {
            var formatedDatas = self.proceedData(data);
            self.generateChart(formatedDatas[0], formatedDatas[1]);
        });

        this.groupByDep = function (data) {
            var formatedDatas = [];
            var minYear = data[0].fields.exercice_de_la_premiere_decision;
            var maxYear = data[0].fields.exercice_de_la_premiere_decision;
            data.forEach(function (record) {
                var dep = record.fields.adresse_administrative_code_departement_du_tiers_beneficiaire;
                var year = record.fields.exercice_de_la_premiere_decision;

                if (year > maxYear) {
                    maxYear = year;
                }
                if (year < minYear) {
                    minYear = year
                }
                if (dep === undefined) {
                    return;
                }

                var obj = {};
                var existing = self.isDepInArray(formatedDatas, dep);
                if (!existing) {
                    obj.departement = dep;
                    obj.aides = [];
                    obj.aides.push(year);
                    formatedDatas.push(obj);
                } else {
                    existing.aides.push(year);
                }
            });
            return [formatedDatas, minYear, maxYear];
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

    controllers.controller("D3JSCtrl", function () {
        this.title = "D3JS";
        console.log("D3JSCtrl");
    });
    controllers.controller("RaphaelJSCtrl", function () {
        this.title = "RaphaelJS";
        console.log("RaphaelJSCtrl");
    });
}());
