// TODO 
// add pcts
// double check all numbers, especially raw numbers by age group
// make clear that gray != red


console.clear();

var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

var dataSeries = [];
var pymChild;
var skipLabels = ["under5Upper", "under5Lower", 'allAgesUpper', "allAgesLower", "date"]

var { COLORS, classify, makeTranslate, wrapText } = require("./lib/helpers");
var d3 = {
  ...require("d3-axis/dist/d3-axis.min"),
  ...require("d3-scale/dist/d3-scale.min"),
  ...require("d3-selection/dist/d3-selection.min"),
  ...require("d3-shape/dist/d3-shape.min"),
  ...require("d3-interpolate/dist/d3-interpolate.min")
};

var fmtYearAbbrev = d => (d.getFullYear() + "").slice(-2);
var fmtYearFull = d => d.getFullYear();

//Initialize graphic
var onWindowLoaded = function() {
  formatData();
  render();

  window.addEventListener("resize", render);

  pym.then(child => {
    pymChild = child;
    child.sendHeight();

    pymChild.onMessage("on-screen", function(bucket) {
      ANALYTICS.trackEvent("on-screen", bucket);
    });
    pymChild.onMessage("scroll-depth", function(data) {
      data = JSON.parse(data);
      ANALYTICS.trackEvent("scroll-depth", data.percent, data.seconds);
    });
  });
};

//Format graphic data for processing by D3.
var formatData = function() {
  DATA.forEach(function(d) {
    // var [m, day, y] = d.date.split("/").map(Number);
    // y = y > 50 ? 1900 + y : 2000 + y;
    // d.date = new Date(y, m - 1, day);
  });

  // Restructure tabular data for easier charting.
  for (var column in DATA[0]) {
    if (skipLabels.indexOf(column) > -1) {
      continue;
    }

    dataSeries.push({
      name: column,
      values: DATA.map(d => ({
        date: d.date,
        amt: d[column]
      }))
    });
  }
};

// Render the graphic(s). Called by pym with the container width.

var render = function() {
  // Render the chart!
  var container = "#line-chart";
  var element = document.querySelector(container);
  var width = element.offsetWidth;
  renderLineChart({
    container,
    width,
    data: dataSeries
  });

  // render the bar below

  container = "#stacked-bar-chart";
  element = document.querySelector(container);
  renderBarChart({
    container,
    width,
    data: DATArawNumbers
  });


  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

// Render a line chart.
var renderLineChart = function(config) {
  // Setup

  var dateColumn = "date";
  var valueColumn = "amt";

  var aspectWidth = isMobile.matches ? 4 : 16;
  var aspectHeight = isMobile.matches ? 2 : 7;

  var margins = {
    top: 5,
    right: 95,
    bottom: 20,
    left: 35
  };

  var ticksX = 10;
  var ticksY = 10;
  var roundTicksFactor = 5;

  // Mobile
  if (isMobile.matches) {
    ticksX = 5;
    ticksY = 5;
    margins.right = 35;
    margins.left = 38;
  }

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight =
    Math.ceil((config.width * aspectHeight) / aspectWidth) -
    margins.top -
    margins.bottom;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html("");

  var dates = config.data[0].values.map(d => d.date);
  var extent = [dates[0], dates[dates.length - 1]];

  var xScale = d3
    .scaleLinear()
    .domain(extent)
    .range([0, chartWidth]);

  var values = config.data.reduce(
    (acc, d) => acc.concat(d.values.map(v => v[valueColumn])),
    []
  );

  var floors = values.map(
    v => Math.floor(v / roundTicksFactor) * roundTicksFactor
  );
  var min = Math.min.apply(null, floors);

  if (min > 0) {
    min = 0;
  }

  var ceilings = values.map(
    v => Math.ceil(v / roundTicksFactor) * roundTicksFactor
  );
  var max = Math.max.apply(null, ceilings);
  max = 150;

  var yScale = d3
    .scaleLinear()
    .domain([min, max])
    .range([chartHeight, 0]);

  var colorScale = d3
    .scaleOrdinal()
    .domain(
      config.data.map(function(d) {
        return d.name;
      })
    )
    .range([
      COLORS.red3,
      COLORS.yellow3,
      COLORS.blue3,
      COLORS.orange3,
      COLORS.teal3
    ]);

  // Render the HTML legend.

  var legend = containerElement
    .append("ul")
    .attr("class", "key")
    .selectAll("g")
    .data(config.data)
    .enter()
    .append("li")
    .attr("class", d => "key-item " + classify(d.name));

  legend.append("b").style("background-color", d => colorScale(d.name));
  legend.append("label").text(d => d.name);

  // put in MOE keys

  // containerElement.append("ul")
  //   .attr("class", "key moe-key")

  // var extraKeys = ["Under 5 uncertainty interval", "All ages uncertainty interval"]

  // extraKeys.forEach(function(el, ind) {

  //   console.log(el);

  //   d3.select(".moe-key")
  //     .append("li")
  //     .attr('class', 'key-item ' + classify(el))


  //   var keyItem = d3.select("." + classify(el))

  //   keyItem.append('b')
  //   keyItem.append('label').text(el)

    
  // })



  // Create the root SVG element.

  var chartWrapper = containerElement
    .append("div")
    .attr("class", "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins.left + margins.right)
    .attr("height", chartHeight + margins.top + margins.bottom)
    .append("g")
    .attr("transform", `translate(${margins.left},${margins.top})`);

  // Create D3 axes.

  var xAxis = d3
    .axisBottom()
    .scale(xScale)
    .ticks(ticksX)
    .tickFormat(function(d, i) {
      return d;
    });

  var yAxis = d3
    .axisLeft()
    .scale(yScale)
    .ticks(ticksY)
    .tickFormat(d => d);

  // Render axes to chart.

  chartElement
    .append("g")
    .attr("class", "x axis")
    .attr("transform", makeTranslate(0, chartHeight))
    .call(xAxis);

  chartElement
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // Render grid to chart.

  var xAxisGrid = function() {
    return xAxis;
  };

  var yAxisGrid = function() {
    return yAxis;
  };

  chartElement
    .append("g")
    .attr("class", "x grid")
    .attr("transform", makeTranslate(0, chartHeight))
    .call(
      xAxisGrid()
      .tickSize(-chartHeight, 0, 0)
      .tickFormat("")
    );

  chartElement
    .append("g")
    .attr("class", "y grid")
    .call(
      yAxisGrid()
      .tickSize(-chartWidth, 0, 0)
      .tickFormat("")
    );

  // Render 0 value line.

  if (min < 0) {
    chartElement
      .append("line")
      .attr("class", "zero-line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0));
  }

  // render areas

  var under5Area = d3.area()
              .x(function(d) {
                return xScale(d.date)
              })
              .y1(d => yScale(d["under5Upper"]))
              .y0(d => yScale(d["under5Lower"]))
              .curve(d3.curveCatmullRom.alpha(0.5))

  var allAgesArea = d3.area()
              .x(function(d) {
                return xScale(d.date)
              })
              .y1(d => yScale(d["allAgesUpper"]))
              .y0(d => yScale(d["allAgesLower"]))
              .curve(d3.curveCatmullRom.alpha(1))



  chartElement.append("path")
    .datum(DATA)
    .attr('d', allAgesArea)
    .attr('class', "moe-path moe-allages");

  chartElement.append("path")
    .datum(DATA)
    .attr('d', under5Area)
    .attr('class', "moe-path moe-under5");

  // Render lines to chart.
  var line = d3
    .line()
    .x(function(d) {
      return xScale(d[dateColumn]);
    })
    .y(function(d) {
      return yScale(d[valueColumn]);
    });

  chartElement
    .append("g")
    .attr("class", "lines")
    .selectAll("path")
    .data(config.data)
    .enter()
    .append("path")
    .attr("class", d => "line " + classify(d.name))
    .attr("stroke", d => colorScale(d.name))
    .attr("d", d => line(d.values));

  chartElement
    .append("g")
    .attr("class", "value")
    .selectAll("text")
    .data(config.data)
    .enter()
    .append("text")
    .attr("x", function(d, i) {
      var last = d.values[d.values.length - 1];

      return xScale(last[dateColumn]) + 5;
    })
    .attr("y", function(d) {
      var last = d.values[d.values.length - 1];

      return yScale(last[valueColumn]) + 3;
    })
    .html(function(d) {
      var last = d.values[d.values.length - 1];
      var value = last[valueColumn];

      var label = last[valueColumn].toFixed(1);

      if (!isMobile.matches) {
        label = d.name + " — <strong>" + label + "</strong>";
      }

      return label;
    })
    .call(wrapText, margins.right, 13);


};


var renderBarChart = function(config) {


  var max = 0

  config.data.forEach(function(el, ind) {
    max = max + el.count
  })


  var xScale = d3.scaleLinear()
                  .domain([0, max])
                  .range([0, config.width])


  var chartWrapper = d3.select(config.container)

  chartWrapper.html("")


  var barHeight = 25;

  chartWrapper.selectAll('div')
    .data(config.data)
    .enter()
    .append('div')
    .style("width", function(d){
      return xScale(d.count) + "px";
    })
    .style("height", barHeight + "px")
    .attr('class', d => classify(d.age) + " stacked-bar")
    .html(d => d.age + ": " + (d.count/max*100).toFixed(0) + "%");








}

//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;


