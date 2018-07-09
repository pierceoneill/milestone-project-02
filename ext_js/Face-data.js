queue()
   .defer(d3.csv, "/Data/sixnations.csv")
   .await(makeGraphs);

function makeGraphs(error, DailyShowGuests_data) {

   //Create a Crossfilter instance
   var ndx = crossfilter(DailyShowGuests_data);

    // my color code .................... //
    var namecolor = d3.scale.ordinal()
    .domain(["England","France","Ireland","Italy","Scotland","Wales"])
    .range(["#dc241f","#003e7a","#007750","#005ac0","#004076","#e70024"]);

   //Define Dimensions
   var yearDim = ndx.dimension(function (d) {
       return d["Year"];
   });
   var triesPerTeamGroupDim = ndx.dimension(function (d) {
       return d["Tries"];
   });
   var specificOccupationDim = ndx.dimension(function (d) {
       return d["Team"];
   });
   var guestDim = ndx.dimension(function (d) {
       return d["topScorer"];
   });
   var guestDim2 = ndx.dimension(function (d) {
       return d["Team"];
   });
   var showDim = ndx.dimension(function (d) {
       return d["Team"];
   });
   var showDim2 = ndx.dimension(function (d) {
       return d["Year"];
   });
   var pointsDim = ndx.dimension(function (d) {
       return d["topScorerPoints"];
   });
   var teamDim = ndx.dimension(function (d) {
       return d["Team"];
   });
   var triesDim = ndx.dimension(function (d) {
       return d["Tries"];
   });
   var squadNoDim = ndx.dimension(function (d) {
       return d["squadNo"];
   });
   
  

   //Calculate metrics
   var yearGroup = yearDim.group();
   var triesPerTeamGroup = triesPerTeamGroupDim.group();
   var specificOccupations = specificOccupationDim.group();
   var guestGroup = guestDim.group();
   var teamGroup = teamDim.group();
   var showGroup = showDim.group();
   var pointsGroup = pointsDim.group();
   var squadNoGroup = squadNoDim.group();
   var guests_by_year = yearDim.group().reduceCount(function (d) {
       return d[Year]
   });

   // filter DailyShowGuests_data for topPlayer
	var DailyShowGuests_data_filtered = [];
	var j = 0;
	for (var k in DailyShowGuests_data) {
		if (DailyShowGuests_data[k].Team==="England" || DailyShowGuests_data[k].Team==="France" || DailyShowGuests_data[k].Team==="Ireland"|| DailyShowGuests_data[k].Team==="Italy"|| DailyShowGuests_data[k].Team==="Scotland") 
		{ DailyShowGuests_data_filtered[j] = {topScorer: DailyShowGuests_data[k].topScorer, topScorerPoints: DailyShowGuests_data[k].topScorerPoints };
			j++;
		}
	}
	

	// create a new crossfilter instance for the filtered data
	var cf = crossfilter(DailyShowGuests_data_filtered);
	


	// create dimension, group and values to be used in the series chart for 
	var topOccupationByYearDim = cf.dimension(function(d) {
			return [d.topScorer];
	});
	var topOccupationByYearGroup = topOccupationByYearDim.group();
	var extent = d3.extent(DailyShowGuests_data_filtered, function(d){return d.topScorerPoints;});

	var extent2 = d3.extent(DailyShowGuests_data, function(d){return d.topScorer;});


	// Charts
   triesPerTeamChart = dc.pieChart("#tries-per-team-chart");
   specificOccupationChart = dc.rowChart("#specific-occupation-chart");
   topGuestsChart = dc.rowChart("#top-guests-chart");
   guestsByYearChart = dc.lineChart("#guests-by-year-chart");
   var topOccupationGroupsChart = dc.rowChart("#top-occupation-groups-chart");
   var totalNumberOfGuestsND = dc.numberDisplay("#number-guests-nd");
   var totalNumberOfTeamsND = dc.numberDisplay("#number-teams-nd");
   guest_datatable = dc.dataTable('#guest-datatable');
   show_datatable = dc.dataTable("#show-datatable");
   squadNoChart = dc.lineChart("#squad-no-chart");


   // function to remove data where there were no guests present in the show
    function remove_bins_without_guests(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    return d.key !== "(None)" && d.key !== "(no guest)"
                });
            }
        };
    }

   // function to count bins in a specific group
    function count_bins(group) {
        return {
            value: function () {
                return group.all().filter(function (kv) {
                    return kv.value > 0;
                }).length;
            }
        };
    }


   selectYear = dc.selectMenu('#year-select')
       .dimension(yearDim)
       .group(yearGroup);

   selectTeam = dc.selectMenu('#team-select')
       .dimension(teamDim)
       .group(teamGroup);

   selectShow = dc.selectMenu("#show-select")
       .dimension(showDim)
       .group(showGroup);

   totalNumberOfGuestsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(count_bins(remove_bins_without_guests(guestGroup))); // first remove unnecessary bins, then count the bins

   totalNumberOfTeamsND
        .formatNumber(d3.format("d"))
        .valueAccessor(function (d) {
            return d;
        })
        .group(count_bins(showGroup));


   triesPerTeamChart
       .height(350)
       .radius(130)
       .innerRadius(20)
       .transitionDuration(1500)
       .slicesCap(40)
       .dimension(triesPerTeamGroupDim)
       .group(triesPerTeamGroup)
       .legend(dc.legend().x(280).y(5).itemHeight(13).gap(5))
       .colorAccessor(function(d) {
            return (d.key[0]);
        })

        .colors(function(d) { return namecolor(d); });


   specificOccupationChart
       .width(500)
       .height(350)
       .rowsCap(10)
       .othersGrouper(false)
       .elasticX(true)
       .dimension(specificOccupationDim)
       .group(specificOccupations)
       .colorAccessor(function(d) {
            return (d.key[0]);
        })

        .colors(function(d) { return namecolor(d); })
       .xAxis().ticks(4);


   topGuestsChart
       .width(500)
       .height(350)
      
       .othersGrouper(false)
       .elasticX(true)
       .dimension(guestDim)
       .group(pointsGroup)
       .colorAccessor(function(d) {
            return (d.key[0]);
        })

        .colors(function(d) { return namecolor(d); })
       .xAxis().ticks(10);
       

   guestsByYearChart
       .width(750)
       .height(350)
       .dimension(guestDim)
       .group(guests_by_year)
       .brushOn(true)
       .renderArea(true)
       .colors(["#EB773D"])
       .x(d3.scale.linear().domain(extent))
       .elasticY(true)
       .renderHorizontalGridLines(true)
       .renderVerticalGridLines(true)
       .yAxisLabel("Points Total");

   topOccupationGroupsChart
       .width(800)
       .height(500)
       .rowsCap(20)
       .othersGrouper(false)
       .elasticX(true)
       .dimension(pointsDim)
       .group(topOccupationByYearGroup)
       .colorAccessor(function(d) {
            return (d.key[0]);
        })

        .colors(function(d) { return namecolor(d); })
       .xAxis().ticks(10);
       
    squadNoChart
    
       
       .width(750)
       .height(350)
       .dimension(yearDim)
       .group(squadNoGroup)
       .brushOn(true)
       .renderArea(true)
       .colors(["#EB773D"])
       .x(d3.scale.linear().domain(extent))
       .elasticY(true)
       .renderHorizontalGridLines(true)
       .renderVerticalGridLines(true)
       .yAxisLabel("Points Total");
       
   
  
   guest_datatable
       .dimension(guestDim2)
       .group(function(d) {return d["Year"];})
       .columns([
           {
               label: "Year",
               format: function(d) {return d["Year"]}
           },
           {
               label: "Show featuring the guest",
               format: function(d) {return d["Team"]}
           },
           {
               label: "Occupation of the guest",
               format: function(d) {return d["topPlayer"]}
           }
       ])
       .size(DailyShowGuests_data.length);

   show_datatable
       .dimension(showDim2)
       .group(function(d) {return d["Year"];})
       .columns([
           {
               label: "Year",
               format: function(d) {return d["Year"]}
           },
           {
               label: "Try Scorer",
               format: function(d) {return d["tryScorer"]}
           },
           {
               label: "No. of Tries Scored",
               format: function(d) {return d["topTryScorer"]}
           }
       ])
       .size(DailyShowGuests_data.length);


var name_dim = ndx.dimension(dc.pluck('topScorer'));
    var total_spend_per_person = name_dim.group().reduceSum(dc.pluck('topScorerPoints'));
    dc.barChart("#top-guests-chart")
        .width(1800)
        .height(350)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(name_dim)
        .group(total_spend_per_person)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
       .elasticY(true)
       .renderHorizontalGridLines(true)
       .renderVerticalGridLines(true)
       .yAxisLabel("Points Total")
        
        .xUnits(dc.units.ordinal)
        .xAxisLabel("topScorer")
        .colorAccessor(function(d) {
            return (d.key[0]);
        })

        .colors(function(d) { return namecolor(d); })
        
        .yAxis().ticks(10);




//****************************Stacked Barchart**//
    var name_dim = ndx.dimension(dc.pluck('Team'));
        var teamWins = name_dim.group().reduceSum(function (d) {
                if (d.Team=== 'Ireland','France','England','Italy','Scotland','Wales') {
                    return +d.Won;
                } else {
                    return 0;
                }
            });
        var teamLosses = name_dim.group().reduceSum(function (d) {
                if (d.Team === 'Ireland','France','England','Italy','Scotland','Wales') {
                    return +d.Lost;
                } else {
                    return 0;
                }
            });
        var teamDraw = name_dim.group().reduceSum(function (d) {
                if (d.Team === 'Ireland','France','England','Italy','Scotland','Wales') {
                    return +d.Draw;
                } else {
                    return 0;
                }
            });
            
        var stackedChart = dc.barChart("#guests-by-year-chart");
        stackedChart
            .width(750)
            .height(500)
            .dimension(name_dim)
            .group(teamWins, "Wins")
            .stack(teamLosses, "Losses")
            .stack(teamDraw, "Draw")
            .x(d3.scale.ordinal())
            .y(d3.scale.linear().domain([0,25]))
            .xUnits(dc.units.ordinal)
            .legend(dc.legend().x(700).y(0).itemHeight(15).gap(5));
        stackedChart.margins().right = 100
       ;


    //Composite Chart Table Finish
    var parseDate = d3.time.format("%Y").parse;
        DailyShowGuests_data.forEach(function(d){
            d.Year = parseDate(d.Year);
        });
        var date_dim = ndx.dimension(dc.pluck('Year'));
        var minDate = date_dim.bottom(1)[0].Year;
        var maxDate = date_dim.top(1)[0].Year;
        var englandWins = date_dim.group().reduceSum(function (d) {
                if (d.Team === 'England') {
                    return +d.tableFinish;
                } else {
                    return 0;
                }
            });
        var franceWins = date_dim.group().reduceSum(function (d) {
            if (d.Team === 'France') {
                return +d.tableFinish;
            } else {
                return 0;
            }
        });
        var irelandWins = date_dim.group().reduceSum(function (d) {
            if (d.Team === 'Ireland') {
                return +d.tableFinish;
            } else {
                return 0;
            }
        });
        var italyWins = date_dim.group().reduceSum(function (d) {
                if (d.Team === 'Italy') {
                    return +d.tableFinish;
                } else {
                    return 0;
                }
            });
        var scotlandWins = date_dim.group().reduceSum(function (d) {
            if (d.Team === 'Scotland') {
                return +d.tableFinish;
            } else {
                return 0;
            }
        });
        var walesWins = date_dim.group().reduceSum(function (d) {
            if (d.Team === 'Wales') {
                return +d.tableFinish;
            } else {
                return 0;
            }
        });
        
        var compositeChart = dc.compositeChart('#chart-here');
        compositeChart
            .width(990)
            .height(350)
            .dimension(date_dim)
            .x(d3.time.scale().domain([minDate, maxDate]))
            .yAxisLabel("Finishing Position")
            .xAxisLabel("Season")
            .y(d3.scale.linear().domain([0, 6]))
            
            .legend(dc.legend().x(80).y(5).itemHeight(13).gap(5))
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(compositeChart)
                    .colors("#dc241f")
                    .group(englandWins, 'England'),
                dc.lineChart(compositeChart)
                    .colors("#003e7a")
                    .group(franceWins, 'France'),
                dc.lineChart(compositeChart)
                    .colors("#007750")
                    .group(irelandWins, 'Ireland'),
                dc.lineChart(compositeChart)
                    .colors("#005ac0")
                    .group(italyWins, 'Italy'),
                dc.lineChart(compositeChart)
                    .colors("#004076")
                    .group(scotlandWins, 'Scotland'),
                dc.lineChart(compositeChart)
                    .colors("#e70024")
                    .group(walesWins, 'Wales')
            ])
            .brushOn(false)
            .render();
       dc.renderAll();



}  
            
            
    