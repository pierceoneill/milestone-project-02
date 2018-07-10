queue()
   .defer(d3.csv, "/Data/sixnations.csv")
   .await(makeGraphs);

function makeGraphs(error, rugby_data){

   //Create a Crossfilter instance
   var ndx = crossfilter(rugby_data);

    // my color code .................... //
    var namecolor = d3.scale.ordinal()
    .domain(["England","France","Ireland","Italy","Scotland","Wales"])
    .range(["#dc241f","#003e7a","#007750","#005ac0","#004076","#e70024"]);
    
     var playercolor =d3.scale.ordinal()
     .domain(["Camille Lopez","Carlo Canno","Dan Biggar","George Ford","Greig Laidlaw","Jean-Marc Doussain","Jonathan Sexton","Kelly Haimona","Leigh Halfpenny","Maxime Machenaud","Owen Farrell","Paddy Jackson","Stuart Hogg","Tommaso Allen"])
     .range(["#005ac0","#005ac0","#e70024","#dc241f","#007750","#005ac0","#004076","#e70024","#dc241f","#003e7a","#007750","#005ac0","#004076","#e70024"]);

   //Define Dimensions
   var yearDim = ndx.dimension(function (d) {
       return d["Year"];
   });
   var triesPerTeamGroupDim = ndx.dimension(function (d) {
       return d["Tries","Team"];
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
   var grandSlamDim = ndx.dimension(function (d) {
       return d["grandSlam"];
   });
   var squadDim = ndx.dimension(function (d) {
       return d["squad"];
   });
   var tripleCrownDim = ndx.dimension(function (d) {
       return d["tripleCrown"];
   });
   var captainDim = ndx.dimension(function (d) {
       return d["captain"];
   });
   var topPlayerDim = ndx.dimension(function (d) {
       return d["topPlayer"];
   });
   
  

   //Calculate metrics
   var yearGroup = yearDim.group();
   var triesGroup = triesDim.group();
   var captainGroup = captainDim.group();
   var triesPerTeamGroup = triesPerTeamGroupDim.group();
   var specificOccupations = specificOccupationDim.group();
   var guestGroup = guestDim.group();
   var teamGroup = teamDim.group();
   var showGroup = showDim.group();
   var pointsGroup = pointsDim.group();
   var grandSlamGroup = grandSlamDim.group();
   var squadGroup = squadDim.group();
   var tripleCrownGroup = tripleCrownDim.group();
   var topPlayerGroup = topPlayerDim.group();
   var guests_by_year = yearDim.group().reduceCount(function (d) {
       return d[Year]
   });

   // filter rugby_data for topPlayer
	var rugby_data_filtered = [];
	var j = 0;
	for (var k in rugby_data) {
		if (rugby_data[k].Team==="England" || rugby_data[k].Team==="France" || rugby_data[k].Team==="Ireland"|| rugby_data[k].Team==="Italy"|| rugby_data[k].Team==="Scotland") 
		{ rugby_data_filtered[j] = {topScorer: rugby_data[k].topScorer, topScorerPoints: rugby_data[k].topScorerPoints };
			j++;
		}
	}
	

	// create a new crossfilter instance for the filtered data
	var cf = crossfilter(rugby_data_filtered);
	


	// create dimension, group and values to be used in the series chart for 
	var topOccupationByYearDim = cf.dimension(function(d) {
			return [d.topScorer];
	});
	var topOccupationByYearGroup = topOccupationByYearDim.group();
	var extent = d3.extent(rugby_data_filtered, function(d){return d.topScorerPoints;});

	var extent2 = d3.extent(rugby_data, function(d){return d.topScorer;});


	// Charts
   triesPerTeamChart = dc.pieChart("#tries-per-team-chart");
   specificOccupationChart = dc.rowChart("#specific-occupation-chart");
   topScorerChart = dc.rowChart("#top-scorer-chart");
   guestsByYearChart = dc.lineChart("#guests-by-year-chart");
   var topOccupationGroupsChart = dc.rowChart("#top-occupation-groups-chart");
   var totalNumberOfGuestsND = dc.numberDisplay("#number-guests-nd");
   var totalNumberOfTeamsND = dc.numberDisplay("#number-teams-nd");
   topplayer_datatable = dc.dataTable("#topplayer-datatable");
   tryscorer_datatable = dc.dataTable("#tryscorer-datatable");
   captainChart = dc.rowChart("#captain-chart");
   squadChart = dc.pieChart("#squad-chart");
   grandSlamChart = dc.pieChart("#grand-slam-chart");
   tripleCrownChart = dc.pieChart("#triple-crown-chart");
   topPlayerChart = dc.pieChart("#topplayer-chart");


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

    // year select
   selectYear = dc.selectMenu('#year-select')
       .dimension(yearDim)
       .group(yearGroup);

    // team select
   selectTeam = dc.selectMenu('#team-select')
       .dimension(teamDim)
       .group(teamGroup);


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

    // tries per team pie chart
   triesPerTeamChart
       .height(350)
       .width(500)
       .radius(130)
       .innerRadius(20)
       .transitionDuration(1500)
       .slicesCap(6)
       .dimension(triesDim)
       .group(triesGroup)
       .legend(dc.legend().x(380).y(5).itemHeight(13).gap(5));


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


   topScorerChart
       .width(500)
       .height(350)
       .othersGrouper(false)
       .elasticX(true)
       .dimension(guestDim)
       .group(pointsGroup)
       .colorAccessor(function(d) {
            return (d.key[0]);
        })

        .colors(function(d) { return playercolor(d); })
       
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
       
    captainChart
       .width(750)
       .height(350)
       .othersGrouper(false)
       .elasticX(true)
       .dimension(captainDim)
       .group(captainGroup)
       .xAxis().ticks(5);
       
    squadChart
        .height(220)
        .width(350)
       .radius(90)
       .innerRadius(40)
       .transitionDuration(1500)
       .dimension(squadDim)
       .group(squadGroup);
       
    grandSlamChart
       .height(220)
       .radius(90)
       .innerRadius(40)
       .transitionDuration(1500)
       .dimension(grandSlamDim)
       .group(grandSlamGroup);
       
    tripleCrownChart
       .width(350)
       .height(220)
       .radius(90)
       .innerRadius(40)
       .transitionDuration(1500)
       .dimension(tripleCrownDim)
       .group(tripleCrownGroup);
       
    topPlayerChart
       .width(750)
       .height(350)
       .radius(150)
       .innerRadius(40)
       .transitionDuration(1500)
       .dimension(topPlayerDim)
       .group(topPlayerGroup);
  
   topplayer_datatable
      
       .dimension(guestDim2)
       .group(function(d) {return d["Year"];})
       .columns([
           {
               label: "Year",
               format: function(d) {return d["Year"]}
               
           },
           {
               label: "Team",
               format: function(d) {return d["Team"]}
           },
           {
               label: "Player of the Tournament",
               format: function(d) {return d["topPlayer"]}
           }
       ])
       .size(rugby_data.length);

   tryscorer_datatable
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
       .size(rugby_data.length);

    // top scorer
    var topScorer = ndx.dimension(dc.pluck('topScorer'));
    var topScorerPoints = topScorer.group().reduceSum(dc.pluck('topScorerPoints'));
    dc.barChart("#top-scorer-chart")
        .width(1800)
        .height(350)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(topScorer)
        .group(topScorerPoints)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .elasticY(true)
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .yAxisLabel("Points Total")
        .colorAccessor(function(d) {
            return (d.key[0]);
        })

        .colors(function(d) { return playercolor(d); })
        .xUnits(dc.units.ordinal)
        .xAxisLabel("Player");



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
            .height(350)
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
        rugby_data.forEach(function(d){
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
            
            
    