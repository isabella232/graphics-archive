var $graphic = $('#graphic');

var fmt_year_abbr = d3.time.format('%y');
var fmt_year_full = d3.time.format('%Y');
var graphic_aspect_width;
var graphic_aspect_height;
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

var graphic_data = [
{'year':'3/2006','amt':4.9},
{'year':'6/2006','amt':1.2},
{'year':'9/2006','amt':0.4},
{'year':'12/2006','amt':3.2},
{'year':'3/2007','amt':0.2},
{'year':'6/2007','amt':3.1},
{'year':'9/2007','amt':2.7},
{'year':'12/2007','amt':1.4},
{'year':'3/2008','amt':-2.7},
{'year':'6/2008','amt':2},
{'year':'9/2008','amt':-1.9},
{'year':'12/2008','amt':-8.2},
{'year':'3/2009','amt':-5.4},
{'year':'6/2009','amt':-0.5},
{'year':'9/2009','amt':1.3},
{'year':'12/2009','amt':3.9},
{'year':'3/2010','amt':1.7},
{'year':'6/2010','amt':3.9},
{'year':'9/2010','amt':2.7},
{'year':'12/2010','amt':2.5},
{'year':'3/2011','amt':-1.5},
{'year':'6/2011','amt':2.9},
{'year':'9/2011','amt':0.8},
{'year':'12/2011','amt':4.6},
{'year':'3/2012','amt':2.3},
{'year':'6/2012','amt':1.6},
{'year':'9/2012','amt':2.5},
{'year':'12/2012','amt':0.1},
{'year':'3/2013','amt':2.7},
{'year':'6/2013','amt':1.8},
{'year':'9/2013','amt':4.5},
{'year':'12/2013','amt':3.5},
{'year':'3/2014','amt':-2.1},
{'year':'6/2014','amt':4.2}
];

var election_years = [
    '2006-03', '2006-06', '2006-09', '2006-12',
    '2010-03', '2010-06', '2010-09', '2010-12',
    '2014-03', '2014-06'
];


/*
 * Render the graphic
 */
function render(width_container) {
    if (!width_container) {
        width_container = graphic_default_width;
    }
    
    var width_graphic = width_container;
    
    if (width_container <= mobile_threshold) {
        is_mobile = true;
        graphic_aspect_width = 4;
        graphic_aspect_height = 3;
    } else {
        is_mobile = false;
        graphic_aspect_width = 16;
        graphic_aspect_height = 9;
    }
    
    // clear out existing graphics
    $graphic.empty();

    render_bar_chart(width_graphic);

    if (pymChild) {
        pymChild.sendHeight();
    }
}

function render_bar_chart(width_graphic) {
    var data = graphic_data;
    var margin = { top: 5, right: 5, bottom: 20, left: 37 };
    var num_y_ticks = 6;
    var width = width_graphic - margin['left'] - margin['right'];
    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin['top'] - margin['bottom'];
    
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(data.map(function(d) { 
            return d['year']; 
        }));
    
    var y = d3.scale.linear()
        .range([height, 0])
        .domain([-10, 10]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(function(d,i) {
            if ((i % 4) == 0) {
                if (is_mobile) {
                    return '\u2019' + fmt_year_abbr(d);
                } else {
                    return fmt_year_full(d);
                }
            }
        });
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_y_ticks)
        .tickFormat(function(d) {
            return d + '%';
        });

    var y_axis_grid = function() { return yAxis; }
    
    // draw the legend
    var legend = d3.select('#graphic').append('ul')
            .attr('class', 'key');
        
    var midterm_key = d3.select('#graphic ul.key')
        .append('li')
            .attr('class', 'key-item midterm');
    midterm_key.append('b')
        .attr('style', 'background-color: #f1f1f1');
    midterm_key.append('label')
        .text('Midterm election years');

    // draw the chart itself
    var svg = d3.select('#graphic').append('svg')
        .attr('width', width + margin['left'] + margin['right'])
        .attr('height', height + margin['top'] + margin['bottom'])
        .append('g')
            .attr('transform', 'translate(' + margin['left'] + ',' + margin['top'] + ')');

    var midterms = svg.append('g')
        .attr('class', 'midterm')
        .selectAll('rect')
            .data(election_years)
        .enter().append('rect')
            .attr('x', function(d) {
                return x(d);
            })
            .attr('y', 0)
            .attr('width', x.rangeBand())
            .attr('height', height)
                .attr('fill', '#f1f1f1');

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0)
            .tickFormat('')
        );

    svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
            .data(data)
        .enter().append('rect')
            .attr('x', function(d) {
                return x(d['year']);
            })
            .attr('y', function(d) {
                if (d['amt'] < 0) { 
                    return y(0);
                } else {
                    return y(d['amt']);
                }
            })
            .attr('width', x.rangeBand())
            .attr('height', function(d){ 
                if (d['amt'] < 0) { 
                    return y(d['amt']) - y(0);
                } else {
                    return y(0) - y(d['amt']);
                }
            })
            .attr('class', function(d) {
                return 'bar bar-' + d['year'];
            })
            .attr('fill', function(d) {
                var yr = fmt_year_full(d['year']);
                if (d['amt'] < 0) {
                    return colors['red3'];
                } else {
                    return '#666';
                }
            });
    
    svg.append('line')
        .attr('class', 'y grid grid-0')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', y(0))
        .attr('y2', y(0));
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
            d['year'] = d3.time.format('%m/%Y').parse(d['year'].toString());
        });

        election_years.forEach(function(d,i) {
            election_years[i] = d3.time.format('%Y-%m').parse(d);
        });

        var pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({ });
    }
})
