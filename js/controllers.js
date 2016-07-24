/*jslint browser:true this for*/
/*global window console angular AmCharts d3 $ Raphael google MarkerClusterer */

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
            $("#highcharts").highcharts({
                chart: {
                    type: "area"
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
                    pointFormat: "{series.name} got <b>{point.y:,.0f}</b><br/>aides in {point.x}"
                },
                plotOptions: {
                    area: {
                        pointStart: parseInt(minYear),
                        marker: {
                            enabled: false,
                            symbol: "circle",
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
        this.currYear = 0;
        this.data = [];

        DataService.getData(function (data) {
            var formatedDatas = self.proceedData(data);
            self.data = formatedDatas;
            formatedDatas = self.getDatasetByYear(formatedDatas, self.currYear);
            self.generateChart(formatedDatas);
        });

        this.deleteOldGraph = function () {
            var chart = document.querySelector(".chart");
            if (chart !== null) {
                chart.remove();
            }
        };

        this.changeYear = function (year) {
            var data = self.getDatasetByYear(self.data, year);
            self.generateChart(data);
        };

        this.getDatasetByYear = function (data, year) {
            var arr = data.filter(function (set) {
                return set.year === year;
            });

            return arr[0].aides;
        };

        this.proceedData = function (datas) {
            var formatedDatas = this.groupByYear(datas);
            formatedDatas = this.groupAidesByDep(formatedDatas);
            return formatedDatas;
        };

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

        this.groupAidesByDep = function (datas) {
            var aides;
            datas.forEach(function (year) {
                aides = [];
                year.aides.forEach(function (aide) {
                    var dep = aide.fields.adresse_administrative_code_departement_du_tiers_beneficiaire;

                    var existing = self.isDepInArray(aides, dep);
                    if (!existing) {
                        aides.push({
                            dep: dep,
                            count: 1
                        });
                    } else {
                        existing.count += 1;
                    }
                });
                year.aides = aides;
            });
            return datas;
        };

        this.isDepInArray = function (aides, dep) {
            var arr = aides.filter(function (aide) {
                return aide.dep === dep;
            });

            if (arr.length > 0) {
                return arr[0];
            } else {
                return false;
            }
        };

        this.generateChart = function (data) {
            this.deleteOldGraph();

            var max = d3.max(data, function (d) {
                return d.count;
            });
            var margin = {
                top: 20,
                right: 20,
                bottom: 50,
                left: 40
            };
            var width = 960 - margin.left - margin.right;
            var height = 500 - margin.top - margin.bottom;

            var x = d3.scale.ordinal()
                .rangeRoundBands([0, width], 0.1);

            var y = d3.scale.linear()
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(max);

            var svg = d3.select("#d3js").append("svg")
                .attr("class", "chart")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            x.domain(data.map(function (d) {
                return d.dep;
            }));
            y.domain([0, max]);

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("y", 35)
                .attr("x", width / 2)
                .attr("font-size", "1.5em")
                .style("text-anchor", "middle")
                .text("Départements");

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -25)
                .attr("x", -(height / 2))
                .attr("font-size", "1.5em")
                .style("text-anchor", "middle")
                .text("Nombre");

            svg.selectAll(".bar")
                .data(data)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    return x(d.dep);
                })
                .attr("width", x.rangeBand())
                .attr("y", function (d) {
                    return y(d.count);
                })
                .attr("height", function (d) {
                    return height - y(d.count);
                });
        };
    });

    controllers.controller("RaphaelJSCtrl", function (DataService) {
        var self = this;
        this.title = "RaphaelJS";

        DataService.getData(function (data) {
            data = self.proceedData(data);
            var labels = [
                "Moins de 10K€",
                "Entre 10K€ et 50K€",
                "Plus de 50K €"
            ];
            self.generateChart(data, labels);
        });

        this.proceedData = function (data) {
            data = this.groupByAmount(data);
            return data;
        };

        this.groupByAmount = function (data) {
            var formatedDatas = [0, 0, 0];
            var amount;
            data.forEach(function (record) {
                amount = record.fields.montant_vote;
                if (amount === undefined) {
                    return;
                }

                if (amount >= 0 && amount < 10000) {
                    formatedDatas[0] += 1;
                } else if (amount >= 10000 && amount <= 50000) {
                    formatedDatas[1] += 1;
                } else {
                    formatedDatas[2] += 1;
                }
            });
            return formatedDatas;
        };

        this.generateChart = function (data, labels) {
            Raphael("raphaeljs", 800, 800).fromage(400, 400, 200, data, labels, "#000");
        };

        Raphael.fn.fromage = function (cx, cy, r, values, labels, stroke) {
            var paper = this;
            var rad = Math.PI / 180;
            var chart = this.set();
            var angle = 0;
            var total = 0;
            var start = 0;

            function createSector(cx, cy, r, startAngle, endAngle, params) {
                var x1 = cx + r * Math.cos(-startAngle * rad);
                var x2 = cx + r * Math.cos(-endAngle * rad);
                var y1 = cy + r * Math.sin(-startAngle * rad);
                var y2 = cy + r * Math.sin(-endAngle * rad);
                return paper.path(["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(endAngle - startAngle > 180), 0, x2, y2, "z"]).attr(params);
            }
            function process(j) {
                var value = values[j];
                var angleplus = 360 * value / total;
                var popangle = angle + (angleplus / 2);
                var color = "hsb(" + start + ", 1, .5)";
                var ms = 500;
                var delta = 30;
                var bcolor = "hsb(" + start + ", 1, 1)";
                var p = createSector(cx, cy, r, angle, angle + angleplus, {gradient: "90-" + bcolor + "-" + color, stroke: stroke, "stroke-width": 3});
                var txt = paper.text(cx + (r + delta + 55) * Math.cos(-popangle * rad), cy + (r + delta + 25) * Math.sin(-popangle * rad), labels[j]).attr({fill: bcolor, stroke: "none", opacity: 0, "font-family": 'Fontin-Sans, Arial', "font-size": "20px"});
                var txt2 = paper.text(cx + (r + delta + 55) * Math.cos(-popangle * rad), cy + (r + delta + 100) * Math.sin(-popangle * rad), Math.floor((values[j] * 100) / total) + "%").attr({fill: bcolor, stroke: "none", opacity: 0, "font-family": 'Fontin-Sans, Arial', "font-size": "20px"});

                p.mouseover(function () {
                    p.animate({scale: [1.1, 1.1, cx, cy]}, ms, "elastic");
                    txt.animate({opacity: 1}, ms, "elastic");
                    txt2.animate({opacity: 1}, ms, "elastic");
                });
                p.mouseout(function () {
                    p.animate({scale: [1, 1, cx, cy]}, ms, "elastic");
                    txt.animate({opacity: 0}, ms);
                    txt2.animate({opacity: 0}, ms);
                });

                angle += angleplus;
                chart.push(p);
                chart.push(txt);
                chart.push(txt2);
                start += 0.1;
            }

            var i;
            var ii = values.length;
            for (i = 0; i < ii; i += 1) {
                total += values[i];
            }
            for (i = 0; i < ii; i += 1) {
                process(i);
            }
            return chart;
        };
    });

    controllers.controller("GoogleMapCtrl", function (DataService) {
        var self = this;
        this.title = "Google Map";

        DataService.getData(function (data) {
            var formatedDatas = self.proceedData(data);
            // self.generateChart(formatedDatas);
        });

        this.proceedData = function (data) {
            var formatedDatas = this.extractCities(data);
            this.generateMap(formatedDatas);
        };

        this.extractCities = function (data) {
            var formatedDatas = [];
            data.forEach(function (record) {
                var coord = record.fields.wgs84;
                var amount = record.fields.montant_vote;
                var city = record.fields.adresse_administrative_ville_du_tiers_beneficiaire;

                if (coord === undefined) {
                    return;
                }
                var existing = self.isCoordInArray(formatedDatas, coord);
                if (!existing) {
                    formatedDatas.push({
                        lat: coord[0],
                        long: coord[1],
                        count: 1,
                        amount : amount,
                        name: city
                    });
                } else {
                    existing.count += 1;
                    existing.amount += amount;
                }
            });
            return formatedDatas;
        };

        this.isCoordInArray = function (array, coord) {
            var arr = array.filter(function (coords) {
                return ((coords.lat === coord[0]) && (coords.long === coord[1]));

            });

            if (arr.length > 0) {
                return arr[0];
            } else {
                return false;
            }
        };

        this.generateMap = function (data) {
            var startPoint = {lat: data[0].lat, lng: data[0].long};
            var markers = [];
            var map = new google.maps.Map(document.getElementById('googlemap'), {
                zoom: 4,
                center: startPoint
            });

            data.forEach(function (coords) {
                var marker = new google.maps.Marker({
                    position: {
                        lat: coords.lat,
                        lng: coords.long
                    },
                    map: map,
                    title: coords.name,
                    label: coords.count.toString()
                });
                markers.push(marker);
            });

            var options = {
                imagePath: 'bower_components/js-marker-clusterer/images/m'
            };

            var markerCluster = new MarkerClusterer(map, markers, options);
        };
    });

    controllers.controller("HeatMapCtrl", function (DataService) {
        var self = this;
        this.title = "Heat Map";

        DataService.getData(function (data) {
            var formatedDatas = self.proceedData(data);
            self.generateMap(formatedDatas);
        });

        this.proceedData = function (data) {
            data = this.extractCoords(data);
            return data;
        };

        this.extractCoords = function (data) {
            var formatedDatas = [];

            data.forEach(function (record) {
                var coords = record.fields.wgs84;
                if (coords === undefined) {
                    return;
                }
                formatedDatas.push(new google.maps.LatLng(coords[0], coords[1]));
            });

            return formatedDatas;
        };

        this.generateMap = function (data) {
            var startPoint = data[0];

            var map = new google.maps.Map(document.getElementById('heatmap'), {
                zoom: 4,
                center: startPoint
            });

            var heatmap = new google.maps.visualization.HeatmapLayer({
                data: data,
                map: map
            });
        };
    });
}());
