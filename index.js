//# dc.js Getting Started and How-To Guide
'use strict';

//charts - divs

//var gainOrLossChart = dc.pieChart("#gain-loss-chart");
//var fluctuationChart = dc.barChart("#fluctuation-chart");
// var complaintChart = dc.rowChart("#complaint-chart");

//var hourChart = dc.rowChart("#chart1");
//var zipcodeChart = dc.rowChart("#chart2");
//var durationChart = dc.barChart("#duration-chart");
//var moveChart = dc.lineChart("#monthly-move-chart");
//var volumeChart = dc.barChart("#monthly-volume-chart");
//var yearlyBubbleChart = dc.bubbleChart("#yearly-bubble-chart");
//var rwChart = dc.geoChoroplethChart("#choropleth-map-chart");

var charts = {}
var dimensions = {}
var texts = {}
var filters = {}

function checkAllFilters(){
	var filters = []
	for(var i in charts){
		if (charts[i].hasFilter()==true){
			//console.log(i)
			filters.push({chart:i,filter:charts[i].filters()})
		}
	}
	return filters
}
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function drawSvg(){
	//https://stackoverflow.com/questions/22392134/is-there-a-way-to-attach-callback-what-fires-whenever-a-crossfilter-dimension-fi
//console.log(count)
	//d3.selectAll("#box svg").remove()
	//var allDeaths = dimensions["Cause"].top(Infinity).length
	//var boxSide = Math.sqrt(allDeaths)
	//console.log(boxSide)
	var w = 1200
	var h =  Math.floor(736952/w)
	
	var xScale = d3.scale.linear().domain([0,boxSide]).range([0,w])
	 var svg = d3.select("#box").append("svg")
	 .attr("width",w)
	.attr("height",h)
	.attr("fill","none")
	.attr("stroke","black")
	.attr("stroke-width",2)
	svg.append("rect").attr("x",0).attr("y",0).attr("height",h).attr("width",w)
	
	svg.append("rect")
	.attr("id","boxRect")
	.attr("x",0).attr("y",h).attr("height",0).attr("width",w)
	.attr("fill","magenta").attr("opacity",.5)
	.attr("stroke","none")
	
}

function drawBox(count){
	var w = 1200
	var h =  Math.floor(736952/w)
	
	//console.log(count)
	if(count==0){
		return
	}
	//console.log(count)
	var bw= w//Math.floor(count/h)
	var bh = Math.floor(count/w)
	var bwRemainder = count%h
	var svg = d3.select("#box svg")
	//console.log(bw, bh, bwRemainder)
	d3.select("#boxRect").transition()
	.duration(1000)
	.attr("x",0).attr("y",h-bh).attr("height",bh).attr("width",bw)
	.attr("fill","magenta").attr("opacity",.5)
	.attr("stroke","none")
}

var promptText = d3.select("#buttons").append("div").attr("id","promptText")
var moreText = d3.select("#buttons").append("div").attr("id","moreText")




d3.selectAll(".prompt")
.on("mouseover",function(){d3.select(this).style("text-decoration","underline")})
.on("mouseout",function(){d3.select(this).style("text-decoration","none")})


function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}
var dimension
var color = "#000"

var highlightColor = "magenta"

queue()
.defer(d3.csv, "unemployed_1994_s.csv")
//.defer(d3.csv, "joined_years_legal_expanded.csv")
.await(ready);
function ready(error, data){
	console.log(data)

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

//console.log(ndx)
//Year,Single-Year Ages,Place of Death,Race,Cause of death,Deaths,Gender
	
	var keysInUse = [
	"date",
	"absrsn94",
	"age76",
	"mlr76",
	"educ92",
	"female76",
	"numkidsundersix82",
	"occupation76",
	"raceeth76",
	"industry76",
	"lfdetail94"]
	
		for(var k in keysInUse){
			var key = keysInUse[k]
			console.log(key)
   		 	d3.select("#charts").append("div").attr("id",key)	
			dimensions[key] = ndx.dimension(function(d){return d[key]})
		rowChart(800, 500, 10,key,ndx,"red")
			
		}
	
		//dimensions["lfdetail94"] = ndx.dimension(function(d){return d["lfdetail94"]})
		rowChart(800, 500, 10,"lfdetail94",ndx,"red")
		console.log(dimensions["lfdetail94"].top(Infinity).length)
		
	      dc.dataCount(".dc-data-count")
	          .dimension(ndx)
	          .group(all)
	          .html({
	              some:"%filter-count selected out of <strong>%total-count</strong> gun deaths | <a href='javascript:dc.filterAll(); dc.renderAll();''>Reset All</a>",
	              all:"All %total-count gun deaths 1999 - 2020"
	          })

	// drawSvg()
	//drawBox(0)
			  
    dc.renderAll();
};

function barChart(h, w, m, divName, ndx,domain){
	var dimension = dimensions[divName]
	var group = dimension.group()
  var div= d3.select("#"+divName)
	var filtersDiv = div.append("div").style("height","40px")
	filtersDiv.append("div").html(divName)
	filtersDiv.append("span").attr("class","filter").style("display","none")

	filtersDiv.append("a").attr("class","reset").html(" | reset ").style("display","none")
	.on("click",function(){
		chart.filterAll()
		dc.redrawAll()
	})
	
	var chart = dc.barChart("#"+divName)
	var bw = 8
	var w = bw*(domain[1]-domain[0])+bw*6
	
	chart.width(w)
	        .height(h)
	        .margins({top: 0, right: bw*2, bottom: 60, left: bw*4})
	        .ordinalColors([color])
	        .dimension(dimension)
	        .group(group)
	        //.centerBar(true)			
	        .gap(1)
	    	.elasticY(true)
	        .x(d3.scale.linear().domain(domain))
	        .yAxis().ticks(4);
			
		    chart.on('filtered', function() {
				filters[divName]={filter:charts[divName].filters(), len:dimensions[divName].top(Infinity).length}
			});
			
	charts[divName]=chart
			
}


function rowChart(h, w, m,divName,ndx,fillColor){
	var dimension = dimensions[divName]
   
   var div = d3.select("#"+divName)//.append("div").attr("id",divName)


	var filtersDiv = div.append("div").style("height","40px")
	filtersDiv.append("div").html(divName)
	filtersDiv.append("span").attr("class","filter").style("display","none")

	filtersDiv.append("a").attr("class","reset").html(" | reset ").style("display","none")
	.on("click",function(){
		chart.filterAll()
		dc.redrawAll()
	})
	var chart = dc.rowChart("#"+divName);
	

	var p = 10
	
	var group = dimension.group();
	var groupLength =10
	console.log(group)
		
	chart.width(w)
	    .height(groupLength*p+p*3)
	    .margins({top: p, left: m, right: p, bottom: p*2})
	    .group(group)
	    .dimension(dimension)
		.gap(1)
		.data(function(zipcodeGroup){return group.top(Infinity)})
		.ordering(function(d){
	 			//console.log(d)
	 		if(divName=="Year"){
	 			return d.key
	 		}
	 	//	console.log(d)
	 		return d.value
	 	})
	    .ordinalColors([fillColor])
	    .label(function (d) {
	        return d.key;
	    })
		.labelOffsetX(-m+2)
		//.labelOffsetY(12)
	    .title(function (d) {
	        return d.value;
	    })
	    .elasticX(true)
	    .xAxis().ticks(4);
	
		    chart.on('filtered', function() {
				filters[divName]=charts[divName].filters()
			});
		
	charts[divName]=chart
}



d3.selectAll("#version").text(dc.version);
