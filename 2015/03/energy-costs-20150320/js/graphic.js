// global vars
var $graphic = null;
var pymChild = null;

var BAR_HEIGHT = 35;
var BAR_GAP = 5;
// var GRAPHIC_DATA = null; <! -- DEFINED IN CHILD_TEMPLATE.HTML -->
var GRAPHIC_DEFAULT_WIDTH = 600;
var LABEL_MARGIN = 6;
var LABEL_WIDTH = 70;
var MOBILE_THRESHOLD = 500;

var colorD3;
var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};
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

        // load the data
        colorD3 = d3.scale.ordinal()
            .range([ colors['teal3'], colors['teal5'] ])
            .domain(d3.keys(GRAPHIC_DATA[0]).filter(function(d) {
                return d != 'label' && d != 'value';
            }));
        
        GRAPHIC_DATA.forEach(function(d) {
            var x0 = 0;
            d['values'] = colorD3.domain().map(function(name) { 
                return { 
                    name: name, 
                    x0: x0, 
                    x1: x0 += +d[name], 
                    val: d['value']
                };
            });
        });
        
        // setup pym
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
    var margin = { 
        top: 0, 
        right: 15, 
        bottom: 30, 
        left: (LABEL_WIDTH + LABEL_MARGIN)
    };
    var numBars = GRAPHIC_DATA.length;
    var ticksX;
    
    if (isMobile) {
        ticksX = 2;
    } else {
        ticksX = 4;
    }

    // define chart dimensions
    var width = graphicWidth - margin['left'] - margin['right'];
    var height = ((BAR_HEIGHT + BAR_GAP) * numBars);
    
    var x = d3.scale.linear()
        .domain([ 0, 40 ])
        .rangeRound([0, width]);
        
    var y = d3.scale.ordinal()
        .domain(GRAPHIC_DATA.map(function(d) { 
            return d['values'];
        }))
        .rangeRoundBands([0, height], .1);
        
    // define axis and grid
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d) {
            return d + '\u00A2';
        });
        
    var x_axis_grid = function() { return xAxis; }
    
    // draw the chart
    var chart = d3.select('#graphic').append('div')
        .attr('class', 'chart');
    
    var svg = chart.append('svg')
        .attr('width', width + margin['left'] + margin['right'])
        .attr('height', height + margin['top'] + margin['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margin['left'] + ',' + margin['top'] + ')');
    
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(x_axis_grid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );
        
    var group = svg.selectAll('.group')
        .data(GRAPHIC_DATA)
        .enter().append('g')
            .attr('class', function(d) {
                return 'group ' + classify(d['label']);
            })
            .attr('transform', function(d,i) { 
                return 'translate(0,' + (i * (BAR_HEIGHT + BAR_GAP)) + ')';
            });
            
    group.selectAll('rect')
        .data(function(d) { 
            return d['values'];
        })
        .enter().append('rect')
            .attr('height', BAR_HEIGHT)
            .attr('x', function(d) { 
                return x(d['x0']); 
            })
            .attr('width', function(d) { 
                return x(d['x1']) - x(d['x0']);
            })
            .style('fill', function(d) { 
                return colorD3(d['name']);
            })
            .attr('class', function(d) { 
                return classify(d['name']);
            });

    var lastItems = [];
    GRAPHIC_DATA.forEach(function(d) {
        lastItems.push(d['values'][1]);
    });
    
    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(lastItems)
        .enter().append('text')
            .attr('x', function(d, i) { 
				return x(d['x1']);
            })
            .attr('dx', 6)
            .attr('dy', function(d,i) {
                return ((i * (BAR_HEIGHT + BAR_GAP))) + (BAR_HEIGHT / 2) + 4;
            })
            .attr('text-anchor', 'begin')
            .text(function(d) { 
                return d['val'] + '\u00A2';
            });

    
    // draw labels for each bar
    var labels = chart.append('ul')
        .attr('class', 'labels')
        .attr('style', 'width: ' + LABEL_WIDTH + 'px; top: ' + margin['top'] + 'px; left: 0;')
        .selectAll('li')
            .data(GRAPHIC_DATA)
        .enter().append('li')
            .attr('style', function(d,i) {
                var s = '';
                s += 'width: ' + LABEL_WIDTH + 'px; ';
                s += 'height: ' + BAR_HEIGHT + 'px; ';
                s += 'left: ' + 0 + 'px; ';
                s += 'top: ' + (i * (BAR_HEIGHT + BAR_GAP)) + 'px; ';
                return s;
            })
            .attr('class', function(d) {
                return classify(d['label']);
            })
            .append('span')
                .html(function(d) { return d['label'] });

    if (pymChild) {
        pymChild.sendHeight();
    }
}

function classify(str) {
    return str.replace(/\s+/g, '-').toLowerCase();
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
$(window).load(onWindowLoaded);
