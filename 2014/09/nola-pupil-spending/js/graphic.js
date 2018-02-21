var $graphic = $('#graphic');

var fmt_year_abbr = d3.time.format('%y');
var fmt_year_full = d3.time.format('%Y');
var fmt_commas = d3.format('0,000');
var graphic_default_width = 600;
var is_mobile;
var mobile_threshold = 480;
var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var graphic_data = [{'date':'2004','New Orleans':7893,'Louisiana':7630,'New Orleans 2':null,'Louisiana 2':null},
{'date':'2006','New Orleans':14122,'Louisiana':8881,'New Orleans 2':14122,'Louisiana 2':8881},
{'date':'2007','New Orleans':null,'Louisiana':null,'New Orleans 2':15557,'Louisiana 2':9966},
{'date':'2008','New Orleans':null,'Louisiana':null,'New Orleans 2':14327,'Louisiana 2':10673},
{'date':'2009','New Orleans':null,'Louisiana':null,'New Orleans 2':13040,'Louisiana 2':10745},
{'date':'2010','New Orleans':null,'Louisiana':null,'New Orleans 2':13203,'Louisiana 2':10825},
{'date':'2011','New Orleans':null,'Louisiana':null,'New Orleans 2':12797,'Louisiana 2':10765}];


/*
 * Render the graphic
 */
function render(container_width) {
    var graphic_width;

    if (!container_width) {
        container_width = graphic_default_width;
    }

    graphic_width = container_width;

    if (container_width <= mobile_threshold) {
        is_mobile = true;
    } else {
        is_mobile = false;
    }

    // clear out existing graphics
    $graphic.empty();

    draw_graph(graphic_width);

    if (pymChild) {
        pymChild.sendHeight();
    }
}

function draw_graph(width) {
    var color = d3.scale.ordinal()
        .range([ colors['blue2'], colors['blue5'], colors['blue2'], colors['blue5'] ]);
    var graphic_aspect_height;
    var graphic_aspect_width;
    var height;
    var last_data_point = graphic_data.length - 1;
    // console.log(last_data_point);
    var margin = { top: 5, right: 50, bottom: 20, left: 60 };
    var num_x_ticks;
    var num_y_ticks = 6;

    if (is_mobile) {
        graphic_aspect_width = 4;
        graphic_aspect_height = 3;
        num_x_ticks = 5;
    } else {
        graphic_aspect_width = 16;
        graphic_aspect_height = 9;
        num_x_ticks = 10;
    }

    width = width - margin['left'] - margin['right'];
    height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin['top'] - margin['bottom'];

    var x = d3.time.scale()
        .range([0, width])

    var y = d3.scale.linear()
        .range([ height, 0 ]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(num_x_ticks)
        .tickFormat(function(d,i) {
            if (width <= mobile_threshold) {
                return '\u2019' + fmt_year_abbr(d);
            } else {
                return fmt_year_full(d);
            }
        });

    var x_axis_grid = function() { return xAxis; };

    var yAxis = d3.svg.axis()
        .orient('left')
        .scale(y)
        .ticks(num_y_ticks)
        .tickFormat(function(d) {
            if (d == 0) {
                return d;
            } else {
                return '$' + fmt_commas(d);
            }
        });

    var y_axis_grid = function() { return yAxis; };

    var line = d3.svg.line()
        .interpolate('monotone')
        .x(function(d) {
            return x(d['date']);
        })
        .y(function(d) {
            return y(d['amt']);
        });

    color.domain(d3.keys(graphic_data[0]).filter(function(key) {
        return key !== 'date';
    }));

    // parse data into columns
    var formatted_data = {};
    for (var column in graphic_data[0]) {
        if (column == 'date') continue;
        formatted_data[column] = graphic_data.map(function(d) {
            return { 'date': d['date'], 'amt': d[column] };
        }).filter(function(d) {
            return d['amt'] != null;
        });
    }


    // set the data domain
    x.domain(d3.extent(graphic_data, function(d) {
        return d['date'];
    }));

    y.domain([ 0, d3.max(d3.entries(formatted_data), function(c) {
            return d3.max(c['value'], function(v) {
                var n = v['amt'];
                return Math.ceil(n/5000) * 5000; // round to next 5K
            });
        })
    ]);


    // draw the legend
    var legend = d3.select('#graphic')
        .append('ul')
            .attr('class', 'key')
            .selectAll('g')
                .data(d3.entries(formatted_data))
            .enter().append('li')
                .attr('class', function(d, i) {
                    return 'key-item key-' + i + ' ' + classify(d['key']);
                });
    legend.append('b')
        .style('background-color', function(d) {
            return color(d['key']);
        });
    legend.append('label')
        .text(function(d) {
            return d['key'];
        });


    // draw the chart
    var svg = d3.select('#graphic')
        .append('svg')
            .attr('width', width + margin['left'] + margin['right'])
            .attr('height', height + margin['top'] + margin['bottom'])
        .append('g')
            .attr('transform', 'translate(' + margin['left'] + ',' + margin['top'] + ')');

    var xBottom = svg.append('g') // Add the X Axis
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    var yTop = svg.append('g') // Add the Y Axis
        .attr('class', 'y axis')
        .call(yAxis);

    var xGrid = svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(x_axis_grid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );

    var yGrid = svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        );

    var lines = svg.append('g')
        .attr('class', 'lines')
        .selectAll('path')
        .data(d3.entries(formatted_data))
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'line line-' + i + ' ' + classify(d['key']);
            })
            .attr('stroke', function(d) {
                return color(d['key']);
            })
            .attr('d', function(d) {
                return line(d['value']);
            });

    var values = svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(d3.entries(formatted_data))
        .enter()
        .append('text')
            .attr('class', function(d, i) {
                return 'value-' + i + ' ' + classify(d['key']);
            })
            .attr('x', function(d) {
                if (d['key'] == 'New Orleans 2' || d['key'] == 'Louisiana 2') {
                    var last_point = d['value'].length - 1;
                    return x(d['value'][last_point]['date']) + 6;
                }
            })
            .attr('y', function(d) {
                if (d['key'] == 'New Orleans 2' || d['key'] == 'Louisiana 2') {
                    var last_point = d['value'].length - 1;
                    var ypos = y(d['value'][last_point]['amt']);
                    return ypos;
                }
            })
            .attr('dy', 4)
            .attr('text-anchor', 'left')
            .text(function(d) {
                if (d['key'] == 'New Orleans 2' || d['key'] == 'Louisiana 2') {
                    var last_point = d['value'].length - 1;
                    var amt = +d['value'][last_point]['amt'];
                    return '$' + fmt_commas(amt);
                }
            });
}


/*
 * Helper functions
 */
function classify(str) { // clean up strings to use as CSS classes
    return str.replace(/\s+/g, '-').toLowerCase();
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
$(window).load(function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');

        graphic_data.forEach(function(d) {
            d['date'] = d3.time.format('%Y').parse(d['date']);
        });

        var pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({ });
    }
})
