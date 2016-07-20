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

        this.proceedData = function (datas) {
            var arrDatas = this.groupByDep(datas);
            var formatedDatas = arrDatas[0];
            var minYear = arrDatas[1];
            var maxYear = arrDatas[2];
            formatedDatas = this.groupAideByYear(formatedDatas);
            formatedDatas = this.sortAideByYear(formatedDatas, minYear, maxYear);
            formatedDatas = this.formatNames(formatedDatas);

            return [formatedDatas, minYear];
        };

        this.formatNames = function (datas) {
            datas.forEach(function (data) {
                data.name = "" + data.departement;
                delete data.departement;
                data.data = data.aides;
                delete data.aides;
            });
            return datas;
        };

        this.sortAideByYear = function (datas, minYear, maxYear) {
            datas.forEach(function (data) {
                var aides = [];
                var i;
                var block;
                for (i = parseInt(minYear); i <= parseInt(maxYear); i += 1) {
                    block = data.aides.filter(function (aide) {
                        return parseInt(aide.year) === i;
                    });
                    if (block.length > 0) {
                        aides.push(block[0].count);
                    } else {
                        aides.push(0);
                    }
                }
                data.aides = aides;
            });
            return datas;
        };

        this.groupAideByYear = function (datas) {
            datas.forEach(function (record) {
                var aides = [];
                record.aides.forEach(function (year) {
                    var existing = self.isYearInArray(aides, year);
                    if (!existing) {
                        aides.push({
                            year: year,
                            count: 1
                        });
                    } else {
                        existing.count += 1;
                    }
                });
                record.aides = aides;
            });
            return datas;
        };

        this.isYearInArray = function (aides, year) {
            var arr = aides.filter(function (aide) {
                return aide.year === year;
            });
            return (arr.length === 0)
                ? false
                : arr[0];
        };

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
                    minYear = year;
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

        this.generateChart = function (proceededDatas, minYear) {
            $('#highcharts').highcharts({
                chart: {
                    type: 'area'
                },
                title: {
                    text: "Nombre d'aides par année par département"
                },
                xAxis: {
                    allowDecimals: false,
                    title: {
                        text: "Années"
                    },
                    labels: {
                        formatter: function () {
                            return this.value; // clean, unformatted number for year
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: "Nombre d'aides"
                    },
                    labels: {
                        formatter: function () {
                            return this.value;
                        }
                    }
                },
                tooltip: {
                    pointFormat: '{series.name} got <b>{point.y:,.0f}</b><br/>aides in {point.x}'
                },
                plotOptions: {
                    area: {
                        pointStart: parseInt(minYear),
                        marker: {
                            enabled: false,
                            symbol: 'circle',
                            radius: 2,
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        }
                    }
                },
                series: proceededDatas
            });
        };
    });

    controllers.controller("D3JSCtrl", function (DataService) {
        var self = this;
        this.title = "D3JS";
        this.deleteOldGraph = function () {
            var chart = document.querySelector(".chart")
            if (chart !== null) {
                chart.remove();
            }
        }

        this.groupByYear = function (datas) {
            var formatedDatas = [];

            this.currYear = datas[0].fields.exercice_de_la_premiere_decision;
            datas.forEach(function (record) {
                var year = record.fields.exercice_de_la_premiere_decision;
                if (year === undefined) {
                    return;
                }

                if (year < self.currYear) {
                    self.currYear = year;
                }

                var existing = self.isYearInArray(formatedDatas, year);
                if (!existing) {
                    formatedDatas.push({
                        year: year,
                        aides: [record]
                    });
                } else {
                    existing.aides.push(record);
                }
            });
            return formatedDatas;
        };

        this.isYearInArray = function (datas, year) {
            var arr = datas.filter(function (data) {
                return data.year === year;
            });

            if (arr.length > 0) {
                return arr[0];
            } else {
                return false;
            }
        };

    });

    controllers.controller("RaphaelJSCtrl", function () {
        this.title = "RaphaelJS";
        console.log("RaphaelJSCtrl");
    });
}());
