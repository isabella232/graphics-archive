// global vars
var $graphic = null;
var pymChild = null;

var BAR_HEIGHT = 40;
var BAR_GAP = 3;
// var GRAPHIC_DATA; <-- DEFINED IN CHILD_TEMPLATE.HTML
var GRAPHIC_DEFAULT_WIDTH = 600;
var LABEL_MARGIN = 6;
var MOBILE_THRESHOLD = 400;
var VALUE_MIN_WIDTH = 60;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};
var categories = null;
var categories_full = null;
var isMobile = false;

// D3 formatters
var fmtComma = d3.format(',');
var fmtYearAbbrev = d3.time.format('%y');
var fmtYearFull = d3.time.format('%Y');


/*
 * Initialize
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');

        GRAPHIC_DATA.forEach(function(d) {
            d['amt'] = +d['amt'];
        });

        categories = d3.set(GRAPHIC_DATA.map(function(d){ 
                return d['category'];
            })
            .filter(function(d){
                return (typeof d !== "undefined") ? d !== null : false
            })
        ).values();  

        categories_full = d3.set(GRAPHIC_DATA.map(function(d){ 
                return d['category_full'];
            })
            .filter(function(d){
                return (typeof d !== "undefined") ? d !== null : false
            })
        ).values();  

        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({ });
    }
}


/*
 * RENDER THE GRAPHIC
 */
var render = function(containerWidth) {
    // fallback if page is loaded outside of an iframe
    if (!containerWidth) {
        containerWidth = GRAPHIC_DEFAULT_WIDTH;
    }

    // check the container width; set mobile flag if applicable
    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // clear out existing graphics
    $graphic.empty();

    // draw the new graphic
    // (this is a separate function in case I want to be able to draw multiple charts later.)
    drawGraph(containerWidth);

    // update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}


/*
 * DRAW THE GRAPH
 */
var drawGraph = function(graphicWidth) {
    var graph = d3.select('#graphic');

    var labelWidth = 140;

    if (isMobile) {
        labelWidth = 120;
    }

    var margin = {
        top: 0,
        right: 35,
        bottom: 20,
        left: (labelWidth + LABEL_MARGIN)
    };
    var numBars = GRAPHIC_DATA.length;
    var ticksX = 4;
    var colorD3 = d3.scale.ordinal()
        .range([ colors['red1'], colors['red2'], colors['red3'], colors['red4'], colors['red5'] ])
        .domain(categories);
    
    // define chart dimensions
    var width = graphicWidth - margin['left'] - margin['right'];
    var height = ((BAR_HEIGHT + BAR_GAP) * numBars);

    var x = d3.scale.linear()
        .domain([ 0, d3.max(GRAPHIC_DATA, function(d) {
            return Math.ceil(d['amt']/100000000) * 100000000; // round to next 100 million
        }) ])
        .range([0, width]);

    var y = d3.scale.linear()
        .range([ height, 0 ]);

    // define axis and grid
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d, i) {
            if ((isMobile && (i == 0 || i == 3)) || !isMobile) {
                if (d < 999999) {
                    return fmtComma(d);
                } else {
                    var t = Math.ceil(d / 1000000);
                    return '$' + t + ' million';
                }
            }
        });

    var xAxisGrid = function() {
        return xAxis;
    }

    // draw the legend
//     var legend = graph.append('ul')
// 		.attr('class', 'key')
// 		.selectAll('g')
// 			.data(categories)
// 		.enter().append('li')
// 			.attr('class', function(d, i) {
// 				return 'key-item key-' + i + ' ' + classify(d);
// 			});
//     legend.append('b')
//         .style('background-color', function(d,i) {
//             return colorD3(d);
//         });
//     legend.append('label')
//         .text(function(d,i) {
//             return categories_full[i];
//         });

    // draw the chart
    var chart = graph.append('div')
        .attr('class', 'chart');

    var svg = chart.append('svg')
        .attr('width', width + margin['left'] + margin['right'])
        .attr('height', height + margin['top'] + margin['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margin['left'] + ',' + margin['top'] + ')');

    // x-axis (bottom)
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // x-axis gridlines
    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxisGrid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );

    // draw the bars
    svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
            .data(GRAPHIC_DATA)
        .enter().append('rect')
            .attr('y', function(d, i) {
                return i * (BAR_HEIGHT + BAR_GAP);
            })
            .attr('width', function(d){
                return x(d['amt']);
            })
            .attr('height', BAR_HEIGHT)
            .attr('fill', function(d) {
                return colorD3(d['category']);
            })
            .attr('class', function(d, i) {
                return 'bar-' + i + ' ' + classify(d['label']) + ' ' + classify(d['category']);
            });

    // show the values for each bar
    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(GRAPHIC_DATA)
        .enter().append('text')
            .attr('x', function(d) {
                return x(d['amt']);
            })
            .attr('y', function(d, i) {
                return i * (BAR_HEIGHT + BAR_GAP);
            })
            .attr('dx', function(d) {
                if (x(d['amt']) < VALUE_MIN_WIDTH) {
                    return 6;
                } else {
                    return -6;
                }
            })
            .attr('dy', (BAR_HEIGHT / 2) + 3)
            .attr('text-anchor', function(d) {
                if (x(d['amt']) < VALUE_MIN_WIDTH) {
                    return 'begin';
                } else {
                    return 'end';
                }
            })
            .attr('class', function(d) {
                var c = classify(d['label']);
                if (x(d['amt']) < VALUE_MIN_WIDTH) {
                    c += ' outer';
                } else {
                    c += ' inner';
                }
                return c;
            })
            .text(function(d,i) {
                return GRAPHIC_DATA[i]['amt_fmt'];
            });

    // draw labels for each bar
    var labels = chart.append('ul')
        .attr('class', 'labels')
        .attr('style', 'width: ' + labelWidth + 'px; top: 0; left: 0;')
        .selectAll('li')
            .data(GRAPHIC_DATA)
        .enter().append('li')
            .attr('style', function(d,i) {
                var s = '';
                s += 'width: ' + labelWidth + 'px; ';
                s += 'height: ' + BAR_HEIGHT + 'px; ';
                s += 'left: ' + 0 + 'px; ';
                s += 'top: ' + (i * (BAR_HEIGHT + BAR_GAP)) + 'px; ';
                return s;
            })
            .attr('class', function(d, i) {
                var c = classify(d['category']);
                if (i == 0 || i == 3 || i == 6 || i == 11 || i == 16) {
                    c += ' first';
                }
                return c;
            })
            .append('span')
                .html(function(d) {
                    return d['label'];
                });
}


/*
 * HELPER FUNCTIONS
 */
var classify = function(str) { // clean up strings to use as CSS classes
    return str.replace(/\s+/g, '-').toLowerCase();
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
$(window).load(onWindowLoaded);
