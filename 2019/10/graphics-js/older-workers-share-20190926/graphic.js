var pym = require("./lib/pym");
var ANALYTICS = require("./lib/analytics");
require("./lib/webfonts");
var { isMobile } = require("./lib/breakpoints");

console.clear();
var pymChild;

var { COLORS, classify, makeTranslate } = require("./lib/helpers");
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
var formatData = function(data) {
  var output = data.map(function(row) {
    var series = {
      name: row.demographic,
      highlight: !!row.highlight
    };
    // delete row.demographic;
    series.values = Object.keys(row).filter(k => k.match(/\d/)).map(k => ({
      year: k * 1,
      date: new Date(k, 0, 1),
      value: row[k]
    }));
    return series;
  });
  return output;
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
    data: formatData(window.DATA)
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
  var valueColumn = "value";

  var aspectWidth = isMobile.matches ? 4 : 16;
  var aspectHeight = isMobile.matches ? 5 : 9;

  var margins = {
    top: 5,
    right: 135,
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
    .scaleTime()
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
  max = 100;

  var yScale = d3
    .scaleLinear()
    .domain([min, max])
    .range([chartHeight, 0]);

  var colorScale = d3
    .scaleOrdinal()
    .domain(
      config.data.map(d => d.name)
    )
    .range([
      "#888",
      "#777",
      COLORS.red2,
      COLORS.orange2,
      COLORS.orange4
    ]);

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
    .tickValues([1998, 2008, 2018, 2028].map(y => new Date(y, 0, 1)))
    .tickFormat(d => fmtYearFull(d));

  var yAxis = d3
    .axisLeft()
    .scale(yScale)
    .ticks(ticksY)
    .tickFormat(d => d + "%");

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

  // Render lines to chart.
  var line = d3
    .line()
    .x(d => xScale(d[dateColumn]))
    .y(d => yScale(d[valueColumn]));

  var [recorded, projected] = [
    d => d.year <= 2018,
    d => d.year >= 2018
  ].map(function(compare) {
    return config.data.map(demo => ({
      ...demo,
      values: demo.values.filter(compare)
    }));
  });

  [recorded, projected].forEach(function(set, index) {

    chartElement
      .append("g")
      .attr("class", `lines ${index ? "projected" : "recorded"}`)
      .selectAll("path")
      .data(set)
      .enter()
      .append("path")
      .attr("class", d => `line ${d.highlight ? "highlighted" : "standard"}`)
      .attr("stroke", d => colorScale(d.name))
      .attr("d", d => line(d.values));

  });

  config.data.forEach(function(series) {
    chartElement
      .append("g")
      .attr("class", `dots ${classify(series.name)}`)
      .selectAll("circle")
      .data(series.values)
      .enter()
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.value))
        .attr("r", 4)
        .attr("fill", colorScale(series.name))
  });

  var lastItem = d => d.values[d.values.length - 1];
  var penultimate = d => d.values[d.values.length - 2];

  chartElement
    .append("g")
    .attr("class", "value")
    .selectAll("text")
    .data(config.data)
    .enter()
    .append("text")
    .attr("class", d => d.highlight ? "highlight" : "label")
    .attr("transform", d => `translate(${xScale(lastItem(d)[dateColumn]) + 10}, ${yScale(lastItem(d)[valueColumn]) + 3})`)
    .attr("fill", d => colorScale(d.name))
    .html(function(d) {
      var item = lastItem(d);
      var value = item[valueColumn];
      var label = value.toFixed(1) + "%";
      label = d.name + ": " + label;

      return `<tspan>${label}</tspan>`;
    })
    .append("tspan")
    .text(function(d) {
      var projected = lastItem(d);
      var current = penultimate(d);
      var difference = projected.value - current.value;
      return `(${difference >= 0 ? "+" : ""}${difference.toFixed(1)} pts. from 2018)`
    })
    .attr("x", 0)
    .attr("dy", isMobile.matches ? 15 : 20)
};

//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
