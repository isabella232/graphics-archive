// Global vars
var pymChild = null;
var isMobile = false;
var dataSeries = [];
var annotations = [];

var projected_dates = [
    { 'begin': '2016', 'end': '2017' }
]

/*
 * Initialize graphic
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        formatData();

        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({});
    }

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
    });
}

/*
 * Format graphic data for processing by D3.
 */
var formatData = function() {
    DATA.forEach(function(d) {
        d['date'] = d3.time.format('%Y').parse(d['date']);

        for (var key in d) {
            if (key != 'date' && d[key] != null && d[key].length > 0) {
                d[key] = +d[key];
            }
        }

        annotations.push({
           'date': d['date'],
           'amt': d['Emissions']
       });
    });

    projected_dates.forEach(function(d) {
        d['begin'] = d3.time.format('%Y').parse(d['begin']);
        d['end'] = d3.time.format('%Y').parse(d['end']);
    })

    /*
     * Restructure tabular data for easier charting.
     */
    for (var column in DATA[0]) {
        if (column == 'date') {
            continue;
        }

        dataSeries.push({
            'name': column,
            'values': DATA.map(function(d) {
                return {
                    'date': d['date'],
                    'amt': d[column]
                };
            })
        });
    }
}

/*
 * Render the graphic(s). Called by pym with the container width.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = DEFAULT_WIDTH;
    }

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Render the chart!
    renderLineChart({
        container: '#line-chart',
        width: containerWidth,
        data: dataSeries
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a line chart.
 */
var renderLineChart = function(config) {
    /*
     * Setup
     */
    var dateColumn = 'date';
    var valueColumn = 'amt';

    var aspectWidth = isMobile ? 4 : 16;
    var aspectHeight = isMobile ? 3 : 9;

    var margins = {
        top: 15,
        right: 45,
        bottom: 20,
        left: 50
    };

    var ticksX = 10;
    var ticksY = 10;
    var roundTicksFactor = 25;

    // Mobile
    if (isMobile) {
        ticksX = 5;
        ticksY = 5;
        margins['right'] = 38;
        margins['left'] = 45;
    }

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth) - margins['top'] - margins['bottom'];

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create D3 scale objects.
     */
    var xScale = d3.time.scale()
        .domain(d3.extent(config['data'][0]['values'], function(d) {
            return d['date'];
        }))
        .range([ 0, chartWidth ])

    var min = d3.min(config['data'], function(d) {
        return d3.min(d['values'], function(v) {
            return Math.floor(v[valueColumn] / roundTicksFactor) * roundTicksFactor;
        })
    });

    if (min > 0) {
        min = 0;
    }

    var max = d3.max(config['data'], function(d) {
        return d3.max(d['values'], function(v) {
            return Math.ceil(v[valueColumn] / roundTicksFactor) * roundTicksFactor;
        })
    });

    var yScale = d3.scale.linear()
        .domain([min, max])
        .range([chartHeight, 0]);

    var colorScale = d3.scale.ordinal()
        .domain(_.pluck(config['data'], 'name'))
        .range([COLORS['teal4']]);

    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = chartWrapper.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

    /*
     * Create D3 axes.
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d, i) {
            if (isMobile) {
                return '\u2019' + fmtYearAbbrev(d);
            } else {
                return fmtYearFull(d);
            }
        });

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksY)
        .tickFormat(function(d) {
            return d;
        });

    /*
     * Render axes to chart.
     */
    chartElement.append('g')
        .attr('class', 'x axis')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxis);

    var yAxisGroup = chartElement.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    chartElement.append('text')
        .attr('class', 'y-axis-label chart-label')
        .attr('y', function() {
            if (isMobile) {
                return -30;
            } else {
                return -35;
            }
        })
        .attr('x', -(chartHeight / 2))
        .html(function() {
            if (isMobile) {
                return LABELS['axis_label_mobile'];
            } else {
                return LABELS['axis_label'];
            }
        });

    /*
     * Render grid to chart.
     */
    var xAxisGrid = function() {
        return xAxis;
    }

    var yAxisGrid = function() {
        return yAxis;
    }

    chartElement.append('g')
        .attr('class', 'x grid')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxisGrid()
            .tickSize(-chartHeight, 0, 0)
            .tickFormat('')
        );

    chartElement.append('g')
        .attr('class', 'y grid')
        .call(yAxisGrid()
            .tickSize(-chartWidth, 0, 0)
            .tickFormat('')
        );

    /*
     * Render lines to chart.
     */
     var projected = chartElement.append('g')
         .attr('class', 'projected')
         .selectAll('rect')
         .data(projected_dates)
         .enter()
             .append('rect')
                 .attr('x', function(d) {
                     return xScale(d['begin']);
                 })
                 .attr('width', function(d) {
                     return xScale(d['end']) - xScale(d['begin']);
                 })
                 .attr('y', 0)
                 .attr('height', chartHeight)
                 .attr('fill', '#ebebeb');

    var line = d3.svg.line()
        .interpolate('monotone')
        .x(function(d) {
            return xScale(d[dateColumn]);
        })
        .y(function(d) {
            return yScale(d[valueColumn]);
        });

    chartElement.append('g')
        .attr('class', 'lines')
        .selectAll('path')
        .data(config['data'])
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'line ' + classify(d['name']);
            })
            .attr('stroke', function(d) {
                return colorScale(d['name']);
            })
            .attr('d', function(d) {
                return line(d['values']);
            });

    chartElement.append('g')
        .attr('class', 'value')
        .selectAll('text')
        .data(config['data'])
        .enter().append('text')
            .attr('x', function(d, i) {
                var last = d['values'][d['values'].length - 1];

                return xScale(last[dateColumn]) + 5;
            })
            .attr('y', function(d) {
                var last = d['values'][d['values'].length - 1];

                return yScale(last[valueColumn]) + 3;
            })
            .text(function(d) {
                var last = d['values'][d['values'].length - 1];
                var value = last[valueColumn];

                var label = '';

                return label;
            });

    var annots = chartElement.append('g')
        .attr('class', 'annotations');

    annots.append('g')
        .attr('class', 'dots')
        .selectAll('text')
        .data(annotations)
        .enter().append('circle')
            .attr('cx', function(d, i) {
                return xScale(d['date']);
            })
            .attr('cy', function(d) {
                return yScale(d['amt']);
            })
            .attr('fill', function(d) {
                return COLORS['teal4'];
            })
            .attr('stroke', 'white')
            .attr('r', 3);

    var annotation = annots.append('g')
        .attr('class', 'value')
        .selectAll('text')
        .data(annotations)
        .enter().append('text')
            .attr('x', function(d, i) {
                return xScale(d['date']);
            })
            .attr('y', function(d) {
                return yScale(d['amt']);
            })
            .attr('display', function(d, i) {
                if (i == 27) {
                    return 'block'
                } else {
                    return 'none';
                }
            })
            .attr('dx', function(d, i) {
                return 8;
            })
            .attr('dy', function(d, i) {
                return 0;
            })
            .text(function(d) {
                return '2017: ' + d['amt'].toFixed(2);
            });

    if (!isMobile) {
        annotation.call(wrapText, 60, 13);
    } else {
        annotation.call(wrapText, 30, 13);
    }


    chartElement.append('text')
        .classed('chart-label', true)
        .attr('x', function(){
            var dates = projected_dates[0];

            if (isMobile) {
                return xScale(dates['begin']);
            } else {
                return xScale(dates['begin']) + 10;
            }
        })
        .attr('y', -5)
        .text('Projected');

}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
