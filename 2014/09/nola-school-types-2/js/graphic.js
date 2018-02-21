var $graphic;
var graph;

var bar_height = 30;
var bar_gap = 5;
var color;
var graphic_margin = 11;
var label_width = 40;
var mobile_threshold = 500;
var num_x_ticks;
var pymChild = null;

var fmt_comma = d3.format(',');
var fmt_year_abbrev = d3.time.format('%y');
var fmt_year_full = d3.time.format('%Y');

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var graphic_data = [
    { 'label': 'Public', '2004': 123, '2014': 6 },
    { 'label': 'Private', '2004': 92, '2014': 58 },
    { 'label': 'Charter', '2004': 6, '2014': 67 },
    { 'label': 'Other', '2004': 0, '2014': 1 }
];

var labels = {
    '2004': '2004-05',
    '2014': '2014-05'
}


/*
 * Render the graphic
 */
function render(container_width) {
    if (!container_width) {
        container_width = graphic_default_width;
    }
    var graphic_width = container_width;

    if (container_width <= mobile_threshold) {
        is_mobile = true;
    } else {
        is_mobile = false;
    }

    graphic_width = Math.floor((container_width - graphic_margin - label_width) / 2);

    // clear out existing graphics
    $graphic.empty();
    
    graph = d3.select('#graphic');

    render_labels();
    render_bar_chart('2004', graphic_width)
    render_bar_chart('2014', graphic_width)
}

function render_labels() {
    var labels = graph.append('ul')
        .attr('class', 'labels')
        .attr('style', 'width: ' + label_width + 'px; height: 100px;')
        .selectAll('li')
            .data(graphic_data)
        .enter().append('li')
            .attr('style', function(d,i) {
                var s = '';
                s += 'width: ' + label_width + 'px; ';
                s += 'height: ' + bar_height + 'px; ';
                s += 'left: ' + 0 + 'px; ';
                s += 'top: ' + (i * (bar_height + bar_gap)) + 'px; ';
                return s;
            })
            .attr('class', function(d) {
                return classify(d['label']);
            })
            .append('span')
                .text(function(d) { 
                    return d['label'];
                });

}

function render_bar_chart(id, container_width) {
    var margin = { top: 0, right: 15, bottom: 20, left: 6 };
    var num_bars = graphic_data.length;
    var num_x_ticks = [];
    var width = container_width - margin['left'] - margin['right'];
    var height = ((bar_height + bar_gap) * num_bars);
    
    if (is_mobile) {
        num_x_ticks = [ 0, 50, 100, 150 ];
    } else {
        num_x_ticks = [ 0, 25, 50, 75, 100, 125, 150 ];
    }
    
    var x = d3.scale.linear()
        .domain([0, 150])
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickValues(num_x_ticks)
        .tickFormat(function(d) {
            return d.toFixed(0);
        });
        
    var x_axis_grid = function() { 
        return xAxis;
    }
    
    var chart = graph.append('div')
        .attr('class', 'chart');
    
    var title = chart.append('h3')
        .text(labels[id]);

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

    svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
            .data(graphic_data)
        .enter().append('rect')
            .attr("y", function(d, i) { 
                return i * (bar_height + bar_gap);
            })
            .attr("width", function(d){ 
                return x(d[id]);
            })
            .attr("height", bar_height)
            .attr('class', function(d, i) { 
                return 'bar-' + i + ' ' + classify(d['label']);
            });
    
    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(graphic_data)
        .enter().append('text')
            .attr('x', function(d) { 
                return x(d[id]);
            })
            .attr('y', function(d, i) { 
                return i * (bar_height + bar_gap);
            })
            .attr('dx', 6)
            .attr('dy', (bar_height / 2) + 3)
            .attr('text-anchor', 'begin')
            .attr('class', function(d) { 
                return classify(d['label']);
            })
            .text(function(d) { 
                return d[id].toFixed(0);
            });

    if (pymChild) {
        pymChild.sendHeight();
    }
}

function classify(str) {
    return str.replace(/\s+/g, '-').toLowerCase();
}


$(window).load(function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');

        // setup pym
        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({ });
    }
})
