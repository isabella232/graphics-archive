var pym = require('./lib/pym');
var ANALYTICS = require('./lib/analytics');
require('./lib/webfonts');
var { isMobile } = require('./lib/breakpoints');
var $ = require('./lib/qsa');

console.clear();

var {
  getTimeStamp,
  arrayToObject,
  isPlural,
  getData,
  updateTime,
  geoAlbersUsaPr,
} = require('./util');

var disableTooltips = false;
var maxTooltipWidth = 125;
var includeCounties = false;

var pymChild;

var {
  COLORS,
  getAPMonth,
  classify,
  makeTranslate,
  wrapText,
  fmtComma,
} = require('./lib/helpers');

var colorScheme = [
  COLORS.blue1,
  COLORS.blue2,
  COLORS.blue3,
  COLORS.blue4,
  COLORS.blue5,
  COLORS.blue6,
].reverse();

var d3 = {
  ...require('d3-array/dist/d3-array.min'),
  ...require('d3-axis/dist/d3-axis.min'),
  ...require('d3-scale/dist/d3-scale.min'),
  ...require('d3-selection/dist/d3-selection.min'),
  ...require('d3-geo/dist/d3-geo.min'),
};

// combineData
var combineDataMap = function (data, tracts) {
  console.log(tracts)
  console.log(data)
  // join DATA to geo_data
  var count = 0;
  for (var feature of tracts.objects.Houston.geometries) {
    var matchingData = data.find(
      itmInner => itmInner.FIPS == feature.properties.GEOID_2
    );
    if (matchingData) {
      count += 1;
    }
    feature.properties = { ...matchingData, ...feature.properties };
  }
  console.log(count)
  return topojson.feature(tracts, tracts.objects.Houston);
};

//Initialize graphic
var getTracts = async function () {
  var response = await fetch('./assets/houston.json');
  return response.json();
};

var onWindowLoaded = async function () {
  // replace "csv" to load from a different source
  // var geoStates = await Promise.resolve(getGeo());
  var [city] = await Promise.all([getTracts()]);
  var geoData = combineDataMap(TRACTS, city);
  render(geoData);

  window.addEventListener('resize', () => render(geoData));

  pym.then(child => {
    pymChild = child;
    child.sendHeight();
  });
};

var render = function (data) {
  var maps = [
    { var: 'Percent_White', container: '#race-map-container', cssClass: "race", color1: '#f3684b', colorMid: '#f2e3b4', color2: '#c789b9'},
  ];

  for (m of maps) {
    var container = m.container;
    var element = document.querySelector(m.container);
    var width = element.offsetWidth;

    renderMap(
      {
        container,
        width,
        data,
      },
      m.var,
      m.color1,
      m.colorMid,
      m.color2,
      m.cssClass,
    );
  }

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

var renderMap = function (config, mainProperty, color1, colorMid, color2, cssClass) {
  var aspectWidth = isMobile.matches ? 3 : 16;
  var aspectHeight = isMobile.matches ? 2.4 : 12;

  var leftLabelMargin = -5;
  var rightLabelMargin = 5;
  var topLabelMargin = 10;

  var margins = {
    top: 30,
    right: 0,
    bottom: 10,
    left: 0,
  };

  // var nameProperty = includeCounties ? 'NAMELSAD' : 'state_name';

  // Calculate actual chart dimensions
  var chartWidth = config.width - margins.left - margins.right;
  var chartHeight =
    Math.ceil((config.width * aspectHeight) / aspectWidth) -
    margins.top -
    margins.bottom;

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config.container);
  containerElement.html('');

  // Create param functions like projection, scales, etc. TKTK
  var projection = d3
    .geoMercator()
    .center([-95.39, 29.82])
    .translate([chartWidth / 2, chartHeight / 2])
    .scale(config.width * 60); // scale things up to zoom in on city

  var path = d3.geoPath().projection(projection);

  var values = config.data.features.map(d => d.properties[mainProperty]);
  values = values.filter(x => x != 0)

  var max = Math.max(100); // set me manually
  var min = Math.min(...values);

  var factor = mainProperty == "Percent_White" ? 1 : 100;
  min = Math.floor((min) / factor) * factor;

  var median = values.sort( function(a,b) {return a - b;} )[Math.floor(values.length/2)];

  var color_scale = d3.scaleLinear().domain([min, median, max]).range([color1, colorMid, color2]);
  console.log(median, color_scale(max/2))
  median = Math.floor((median) / factor) * factor

  if (mainProperty == "Percent_White") {
    maxDisplay = fmtComma(max) + '%';
    minDisplay = fmtComma(min)+ '%';
    medianDisplay = fmtComma(median)+ '%';
  } else {
    maxDisplay = '$' + fmtComma(max) + '+';
    minDisplay = '$' + fmtComma(min);
    medianDisplay = '$' + fmtComma(median);
  }
  $.one('.right-label.' + cssClass).innerHTML = maxDisplay;
  $.one('.middle-label.' + cssClass).innerHTML = 'Overall: ' + medianDisplay;
  $.one('.middle-label.' + cssClass).style.left = median/max * 100 + '%';
  $.one('.median-line.' + cssClass).style.left = median/max * 100 + '%';
  $.one('.left-label.' + cssClass).innerHTML = minDisplay;
  
  var medianOffset = median/(max-min) * 100;
  var gradient = 'linear-gradient(to right,' + color1 + ',' + colorMid + ' ' +  medianOffset + '%,' + color2 + ')';
  console.log(gradient)
  $.one('.key.' + cssClass).style.background = gradient;

  // Create legend TKTK

  // Create the root SVG element.
  var chartWrapper = containerElement
    .append('div')
    .attr('class', 'graphic-wrapper');

  var chartElement = chartWrapper
    .append('svg')
    .attr('width', chartWidth + margins.left + margins.right)
    .attr('height', chartHeight + margins.top + margins.bottom)
    .append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`);

  // Render Map!
  // states or counties depending on includeCounties bool
  chartElement
    .selectAll('.district')
    .data(config.data.features)
    .enter()
    .append('path')
    .attr('class', 'district')
    .attr('fill', function (d) {
      var percent = d.properties[mainProperty];
      if (!percent) {
        return '#ddd'
      }
      return color_scale(percent)
      // return pickHex(color1, color2, percent / max, median/max);
    })
    .attr('d', path)
    .attr('stroke', 'none');

  // Add in state outlines if include counties is true

  chartElement
    .selectAll('circle')
    .data(SITES.filter(d => d.City == 'Houston, TX'))
    .enter()
    .append('circle')
    .attr('class', 'place-circle')
    .attr('transform', function (d) {
      return `translate(${projection([d['long'], d['lat']])})`;
    })
    .attr('r', '3px')
    .attr('fill', '#333')
    .attr('stroke', '#fff');
};

function pickHex(color1, color2, weight, median) {
    var w2 = weight;
    var w1 = 1 - w2;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return 'rgb('+ rgb[0] + ',' + rgb[1]+ ',' + rgb[2] +')';
}

function getLabelText(data, label, prop, overrideProp) {
  var number =
    data[overrideProp] > data[prop] ? data[overrideProp] : data[prop];

  return `${fmtComma(number)} ${label}${isPlural(number)}`;
}

// Gets the center for an geography.
function getCenter(d, projection) {
  var center = projection(d3.geoCentroid(d));

  // Add necessary special casing here.
  return center;
}

//Initially load the graphic
// (NB: Use window.load to ensure all images have loaded)
window.onload = onWindowLoaded;
