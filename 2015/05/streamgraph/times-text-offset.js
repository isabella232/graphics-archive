            g.append('text')
                .attr('dy', '0.5ex')
               .append('textPath')
                .attr('xlink:href', function(d) { return '#path-'+state.replace(/ /g, '_')+'-'+d.name.replace(/ /g, '_'); })
                .call(drag ? drag : _.identity)
                .attr('startOffset', function(d) {
                    var maxYr = 0, maxV = 0;
                    d3.range(years.length).forEach(function(i) {
                        if (d[i*3+1].y > maxV) {
                            maxV = d[i*3].y;
                            maxYr = i;
                        }
                    });
                    d.maxVal = d[maxYr*3+1].y;
                    d.offset = Math.round(x(d[maxYr*3+1].x) / x.range()[1] * 100);
                    if (customLabelPos[state+'/'+d.name] !== undefined) return customLabelPos[state+'/'+d.name]+'%';
                    return Math.min(95, Math.max(5, d.offset))+'%';
                })
                .attr('text-anchor', function(d) {
                    return d.offset > 90 ? 'end' : d.offset < 10 ? 'start' : 'middle';
                })
                .text(function(d) {
                    var asSentence = d.maxVal > 5;
                    return niceName(d.name, false, asSentence, inMigration, d.name == state);
                    /*+ ' '+(d[38] < 1 ? '<1' : Math.round(d[38].y))+'%';*/
                });

                drag = d3.behavior.drag()
                .on("drag", function(d){
                    var cx = this.getAttribute('startOffset').slice(0,-1)/100*width;
                    cx += d3.event.dx;
                    customLabelPos[state+'/'+d.name] = Math.round(cx/width*100);
                    //console.log('drag', Math.round(cx/width*100));
                    this.setAttribute('startOffset', (cx/width*100)+'%');
                })
                .on("dragend", saveLabelPos);



define('data/label-offsets.json.js',[],function() {
    return {
    "in": {
        "Arizona/Arizona": 39,
        "Arizona/California": 86,
        "Arizona/others MW": 64,
        "Arkansas/others MW": 83,
        "Arkansas/others S": 16,
        "Arkansas/Mississippi": 26,
        "Arkansas/Texas": 94,
        "Arkansas/California": 97,
        "Arkansas/Tennessee": 4,
        "Arkansas/Arkansas": 50,
        "California/Foreign Born": 90,
        "California/California": 33,
        "California/others MW": 45,
        "Colorado/Nebraska": 49,
        "Colorado/others W": 49,
        "Colorado/Texas": 89,
        "Colorado/Pennsylvania": 72,
        "Colorado/others S": 46,
        "Connecticut/New York": 80,
        "Connecticut/Foreign Born": 25,
        "Connecticut/others NE": 71,
        "Delaware/Pennsylvania": 75,
        "Delaware/Delaware": 16,
        "Delaware/Foreign Born": 26,
        "Delaware/New Jersey": 95,
        "Delaware/New York": 96,
        "Delaware/others S": 57,
        "District of Columbia/North Carolina": 51,
        "District of Columbia/New York": 45,
        "District of Columbia/Virginia": 31,
        "District of Columbia/Maryland": 23,
        "District of Columbia/others S": 59,
        "District of Columbia/others NE": 39,
        "District of Columbia/Foreign Born": 71,
        "District of Columbia/Washington": 71,
        "District of Columbia/Pennsylvania": 25,
        "District of Columbia/South Carolina": 69,
        "District of Columbia/California": 84,
        "District of Columbia/District of Columbia": 42,
        "Florida/Georgia": 23,
        "Florida/Florida": 9,
        "Florida/New York": 83,
        "Florida/others NE": 82,
        "Florida/others MW": 56,
        "Florida/others S": 31,
        "Florida/South Carolina": 25,
        "Georgia/New York": 89,
        "Georgia/others MW": 89,
        "Georgia/others NE": 97,
        "Georgia/Foreign Born": 92,
        "Georgia/others S": 89,
        "Georgia/Alabama": 41,
        "Idaho/Nebraska": 50,
        "Idaho/others MW": 18,
        "Idaho/others NE": 3,
        "Idaho/Foreign Born": 6,
        "Idaho/others S": 61,
        "Idaho/Kansas": 21,
        "Illinois/others MW": 47,
        "Illinois/others S": 56,
        "Illinois/others W": 97,
        "Illinois/others NE": 22,
        "Illinois/Foreign Born": 24,
        "Indiana/Kentucky": 64,
        "Indiana/others S": 57,
        "Indiana/others NE": 79,
        "Iowa/others MW": 53,
        "Iowa/others S": 78,
        "Iowa/others W": 79,
        "Kansas/Kansas": 56,
        "Kansas/Missouri": 54,
        "Kansas/Oklahoma": 72,
        "Kansas/Illinois": 11,
        "Kansas/Indiana": 31,
        "Kansas/Ohio": 4,
        "Kentucky/Ohio": 95,
        "Kentucky/others MW": 96,
        "Louisiana/others W": 98,
        "Maine/Maine": 25,
        "Maine/Massachusetts": 86,
        "Maine/New Hampshire": 88,
        "Maine/New York": 88,
        "Maine/others NE": 82,
        "Maryland/Virginia": 23,
        "Maryland/Pennsylvania": 76,
        "Maryland/District of Columbia": 84,
        "Maryland/Foreign Born": 92,
        "Massachusetts/others MW": 64,
        "Massachusetts/others S": 64,
        "Massachusetts/Foreign Born": 30,
        "Michigan/Michigan": 88,
        "Michigan/others MW": 22,
        "Michigan/others S": 55,
        "Michigan/others NE": 47,
        "Michigan/New York": 2,
        "Michigan/Ohio": 21,
        "Minnesota/Minnesota": 62,
        "Minnesota/Foreign Born": 8,
        "Mississippi/others W": 97,
        "Mississippi/others NE": 73,
        "Missouri/others MW": 19,
        "Missouri/others S": 21,
        "Montana/Montana": 78,
        "Montana/Missouri": 8,
        "Montana/Minnesota": 33,
        "Montana/Wisconsin": 23,
        "Montana/Illinois": 11,
        "Montana/New York": 1,
        "Montana/Ohio": 1,
        "Montana/others MW": 68,
        "Montana/others S": 71,
        "Montana/Washington": 90,
        "Nebraska/Illinois": 12,
        "Nebraska/Ohio": 2,
        "Nebraska/others MW": 17,
        "Nebraska/Missouri": 12,
        "Nebraska/others NE": 2,
        "Nebraska/others W": 87,
        "Nevada/Nevada": 60,
        "Nevada/California": 89,
        "Nevada/New York": 87,
        "Nevada/Illinois": 82,
        "Nevada/Utah": 50,
        "Nevada/others MW": 52,
        "Nevada/others W": 58,
        "Nevada/others S": 58,
        "Nevada/Foreign Born": 24,
        "Nevada/Ohio": 12,
        "New Jersey/New Jersey": 51,
        "New Jersey/others NE": 45,
        "New Mexico/New Mexico": 14,
        "New Mexico/others MW": 67,
        "New Mexico/others NE": 81,
        "New Mexico/Foreign Born": 91,
        "New Mexico/others S": 20,
        "New Mexico/Missouri": 14,
        "New Mexico/others W": 80,
        "New York/others NE": 51,
        "New York/Foreign Born": 30,
        "New York/others S": 57,
        "North Carolina/North Carolina": 11,
        "North Carolina/New York": 96,
        "North Carolina/Virginia": 96,
        "North Carolina/others NE": 96,
        "North Carolina/others S": 77,
        "North Dakota/Minnesota": 84,
        "North Dakota/North Dakota": 72,
        "North Dakota/Wisconsin": 8,
        "Ohio/Ohio": 34,
        "Ohio/Kentucky": 56,
        "Ohio/others S": 56,
        "Ohio/others MW": 86,
        "Ohio/Foreign Born": 17,
        "Oklahoma/Texas": 11,
        "Oklahoma/Kansas": 41,
        "Oklahoma/Arkansas": 43,
        "Oklahoma/others S": 32,
        "Oklahoma/others W": 80,
        "Oklahoma/others NE": 84,
        "Oregon/Minnesota": 48,
        "Oregon/Kansas": 38,
        "Oregon/Illinois": 12,
        "Oregon/Missouri": 9,
        "Oregon/Iowa": 19,
        "Oregon/Nebraska": 45,
        "Oregon/others S": 70,
        "Rhode Island/New York": 96,
        "Rhode Island/Massachusetts": 86,
        "Rhode Island/Foreign Born": 22,
        "South Carolina/South Carolina": 9,
        "South Carolina/others NE": 84,
        "South Carolina/others S": 88,
        "South Carolina/others MW": 92,
        "South Carolina/North Carolina": 88,
        "South Carolina/New York": 86,
        "Montana/Iowa": 22,
        "New Mexico/Texas": 55,
        "Oklahoma/Missouri": 7,
        "Oregon/others NE": 34,
        "South Dakota/New York": 8,
        "Texas/others MW": 79,
        "Texas/others W": 83,
        "Texas/Alabama": 10,
        "Texas/Tennessee": 10,
        "Vermont/New York": 95,
        "Vermont/Vermont": 17,
        "Wyoming/California": 98,
        "Wyoming/Colorado": 96,
        "Wyoming/Montana": 63,
        "Wyoming/South Dakota": 89,
        "Wyoming/Nebraska": 20,
        "Wyoming/Illinois": 2,
        "Wyoming/New York": 69,
        "Wyoming/Pennsylvania": 13,
        "Wyoming/others MW": 3,
        "Arizona/Illinois": 82,
        "Arizona/New York": 80,
        "Arizona/Ohio": 73,
        "Arizona/Oklahoma": 38,
        "Arizona/New Mexico": 1,
        "Arizona/Arkansas": 46,
        "Arizona/Utah": 10,
        "California/New York": 21,
        "California/others NE": 15,
        "Colorado/others MW": 52,
        "Colorado/others NE": 8,
        "Connecticut/Massachusetts": 41,
        "Maryland/Maryland": 55,
        "Virginia/New York": 90,
        "Arizona/Foreign Born": 17,
        "Colorado/Foreign Born": 24,
        "Maine/others MW": 82,
        "Maine/others S": 90,
        "Maine/Foreign Born": 23,
        "New Hampshire/Foreign Born": 25,
        "New Jersey/Foreign Born": 24,
        "North Dakota/Foreign Born": 8,
        "Oregon/Foreign Born": 22,
        "Pennsylvania/Foreign Born": 24,
        "Vermont/Foreign Born": 23,
        "Washington/Foreign Born": 17,
        "Wyoming/Foreign Born": 16,
        "Wyoming/Wyoming": 59,
        "Wyoming/Iowa": 8,
        "Wyoming/others S": 84,
        "Missouri/Foreign Born": 16,
        "Florida/Foreign Born": 91,
        "Alabama/Alabama": 28,
        "Michigan/Foreign Born": 10,
        "Montana/Foreign Born": 10,
        "Nebraska/Foreign Born": 8,
        "South Dakota/Foreign Born": 8,
        "Texas/Foreign Born": 88,
        "Texas/Texas": 40,
        "Alabama/others S": 52,
        "California/others W": 38,
        "California/Illinois": 23,
        "West Virginia/West Virginia": 58,
        "New York/others MW": 70,
        "Wyoming/Missouri": 22,
        "Wyoming/others W": 76,
        "Wyoming/Utah": 90,
        "North Dakota/others W": 78,
        "Oregon/others W": 70,
        "Washington/others W": 73,
        "Washington/others NE": 3,
        "Connecticut/others USO": 89,
        "South Dakota/South Dakota": 63,
        "Wisconsin/others NE": 4,
        "Hawaii/Foreign Born": 38,
        "Hawaii/Hawaii": 52,
        "Alaska/Foreign Born": 70,
        "Alaska/Alaska": 49,
        "Alaska/US Other": 32,
        "Hawaii/others USO": 71,
        "Hawaii/others W": 96,
        "Maryland/others W": 93,
        "Louisiana/Louisiana": 14,
        "California/Oklahoma": 48,
        "California/Missouri": 26,
        "Alaska/Oregon": 67,
        "Arizona/Missouri": 23,
        "Florida/Pennsylvania": 67,
        "Alaska/others S": 36,
        "Colorado/Illinois": 27,
        "Colorado/Kansas": 42,
        "Colorado/Ohio": 20,
        "Idaho/Iowa": 46,
        "Idaho/Missouri": 21,
        "Kansas/others NE": 11,
        "Minnesota/others MW": 81,
        "North Dakota/others MW": 13,
        "South Dakota/Illinois": 7,
        "South Dakota/Wisconsin": 3,
        "South Dakota/others NE": 9,
        "South Dakota/others MW": 39,
        "South Dakota/others W": 73,
        "Tennessee/Tennessee": 24,
        "Utah/Foreign Born": 12,
        "Montana/North Dakota": 69,
        "Montana/others NE": 32,
        "Tennessee/others S": 82,
        "Tennessee/others MW": 92,
        "Utah/others NE": 37,
        "Wyoming/Ohio": 13,
        "New York/US Other": 9,
        "Alaska/others MW": 50,
        "Alaska/others W": 70,
        "District of Columbia/others MW": 32,
        "Hawaii/others S": 58,
        "Iowa/Foreign Born": 7,
        "Massachusetts/others NE": 82,
        "Washington/others MW": 39
    },
    "in-mobile": {
        "Arizona/Arizona": 52,
        "Arizona/California": 90,
        "Arizona/others MW": 64,
        "Arkansas/others MW": 33,
        "Arkansas/others S": 16,
        "Arkansas/Mississippi": 35,
        "Arkansas/Texas": 96,
        "Arkansas/California": 97,
        "Arkansas/Tennessee": 3,
        "Arkansas/Arkansas": 50,
        "California/Foreign Born": 90,
        "California/California": 70,
        "California/others MW": 51,
        "Colorado/Nebraska": 49,
        "Colorado/others W": 49,
        "Colorado/Texas": 89,
        "Colorado/Pennsylvania": 7,
        "Colorado/others S": 46,
        "Connecticut/New York": 80,
        "Connecticut/Foreign Born": 25,
        "Connecticut/others NE": 71,
        "Delaware/Pennsylvania": 75,
        "Delaware/Delaware": 16,
        "Delaware/Foreign Born": 32,
        "Delaware/New Jersey": 87,
        "Delaware/New York": 87,
        "Delaware/others S": 57,
        "District of Columbia/North Carolina": 51,
        "District of Columbia/New York": 97,
        "District of Columbia/Virginia": 46,
        "District of Columbia/Maryland": 35,
        "District of Columbia/others S": 59,
        "District of Columbia/others NE": 75,
        "District of Columbia/Foreign Born": 71,
        "District of Columbia/Washington": 71,
        "District of Columbia/Pennsylvania": 28,
        "District of Columbia/South Carolina": 69,
        "District of Columbia/California": 84,
        "District of Columbia/District of Columbia": 59,
        "Florida/Georgia": 33,
        "Florida/Florida": 9,
        "Florida/New York": 80,
        "Florida/others NE": 62,
        "Florida/others MW": 51,
        "Florida/others S": 31,
        "Florida/South Carolina": 17,
        "Georgia/New York": 96,
        "Georgia/others MW": 81,
        "Georgia/others NE": 97,
        "Georgia/Foreign Born": 92,
        "Georgia/others S": 81,
        "Georgia/Alabama": 49,
        "Idaho/Nebraska": 53,
        "Idaho/others MW": 24,
        "Idaho/others NE": 53,
        "Idaho/Foreign Born": 6,
        "Idaho/others S": 61,
        "Idaho/Kansas": 22,
        "Illinois/others MW": 47,
        "Illinois/others S": 56,
        "Illinois/others W": 97,
        "Illinois/others NE": 22,
        "Illinois/Foreign Born": 24,
        "Indiana/Kentucky": 64,
        "Indiana/others S": 70,
        "Indiana/others NE": 79,
        "Iowa/others MW": 53,
        "Iowa/others S": 78,
        "Iowa/others W": 79,
        "Kansas/Kansas": 56,
        "Kansas/Missouri": 54,
        "Kansas/Oklahoma": 72,
        "Kansas/Illinois": 11,
        "Kansas/Indiana": 1,
        "Kansas/Ohio": 4,
        "Kentucky/Ohio": 95,
        "Kentucky/others MW": 92,
        "Louisiana/others W": 86,
        "Maine/Maine": 25,
        "Maine/Massachusetts": 56,
        "Maine/New Hampshire": 38,
        "Maine/New York": 92,
        "Maine/others NE": 76,
        "Maryland/Virginia": 44,
        "Maryland/Pennsylvania": 76,
        "Maryland/District of Columbia": 84,
        "Maryland/Foreign Born": 92,
        "Massachusetts/others MW": 64,
        "Massachusetts/others S": 87,
        "Massachusetts/Foreign Born": 30,
        "Michigan/Michigan": 88,
        "Michigan/others MW": 68,
        "Michigan/others S": 70,
        "Michigan/others NE": 47,
        "Michigan/New York": 2,
        "Michigan/Ohio": 27,
        "Minnesota/Minnesota": 49,
        "Minnesota/Foreign Born": 8,
        "Mississippi/others W": 97,
        "Mississippi/others NE": 73,
        "Missouri/others MW": 19,
        "Missouri/others S": 21,
        "Montana/Montana": 48,
        "Montana/Missouri": 40,
        "Montana/Minnesota": 76,
        "Montana/Wisconsin": 48,
        "Montana/Illinois": 18,
        "Montana/New York": 90,
        "Montana/Ohio": 87,
        "Montana/others MW": 68,
        "Montana/others S": 86,
        "Montana/Washington": 99,
        "Nebraska/Illinois": 47,
        "Nebraska/Ohio": 2,
        "Nebraska/others MW": 52,
        "Nebraska/Missouri": 68,
        "Nebraska/others NE": 51,
        "Nebraska/others W": 87,
        "Nevada/Nevada": 60,
        "Nevada/California": 89,
        "Nevada/New York": 87,
        "Nevada/Illinois": 82,
        "Nevada/Utah": 63,
        "Nevada/others MW": 23,
        "Nevada/others W": 52,
        "Nevada/others S": 66,
        "Nevada/Foreign Born": 62,
        "Nevada/Ohio": 12,
        "New Jersey/New Jersey": 51,
        "New Jersey/others NE": 45,
        "New Mexico/New Mexico": 25,
        "New Mexico/others MW": 67,
        "New Mexico/others NE": 81,
        "New Mexico/Foreign Born": 91,
        "New Mexico/others S": 34,
        "New Mexico/Missouri": 14,
        "New Mexico/others W": 80,
        "New York/others NE": 51,
        "New York/Foreign Born": 30,
        "New York/others S": 57,
        "North Carolina/North Carolina": 11,
        "North Carolina/New York": 96,
        "North Carolina/Virginia": 96,
        "North Carolina/others NE": 93,
        "North Carolina/others S": 77,
        "North Dakota/Minnesota": 57,
        "North Dakota/North Dakota": 72,
        "North Dakota/Wisconsin": 55,
        "Ohio/Ohio": 34,
        "Ohio/Kentucky": 56,
        "Ohio/others S": 56,
        "Ohio/others MW": 59,
        "Ohio/Foreign Born": 21,
        "Oklahoma/Texas": 70,
        "Oklahoma/Kansas": 33,
        "Oklahoma/Arkansas": 43,
        "Oklahoma/others S": 9,
        "Oklahoma/others W": 74,
        "Oklahoma/others NE": 84,
        "Oregon/Minnesota": 73,
        "Oregon/Kansas": 57,
        "Oregon/Illinois": 50,
        "Oregon/Missouri": 48,
        "Oregon/Iowa": 19,
        "Oregon/Nebraska": 24,
        "Oregon/others S": 70,
        "Rhode Island/New York": 86,
        "Rhode Island/Massachusetts": 64,
        "Rhode Island/Foreign Born": 29,
        "South Carolina/South Carolina": 9,
        "South Carolina/others NE": 84,
        "South Carolina/others S": 88,
        "South Carolina/others MW": 92,
        "South Carolina/North Carolina": 88,
        "South Carolina/New York": 86,
        "Montana/Iowa": 16,
        "New Mexico/Texas": 55,
        "Oklahoma/Missouri": 38,
        "Oregon/others NE": 8,
        "South Dakota/New York": 19,
        "Texas/others MW": 34,
        "Texas/others W": 90,
        "Texas/Alabama": 12,
        "Texas/Tennessee": 10,
        "Vermont/New York": 89,
        "Vermont/Vermont": 49,
        "Wyoming/California": 98,
        "Wyoming/Colorado": 96,
        "Wyoming/Montana": 63,
        "Wyoming/South Dakota": 89,
        "Wyoming/Nebraska": 20,
        "Wyoming/Illinois": 2,
        "Wyoming/New York": 2,
        "Wyoming/Pennsylvania": 4,
        "Wyoming/others MW": 3,
        "Arizona/Illinois": 82,
        "Arizona/New York": 82,
        "Arizona/Ohio": 80,
        "Arizona/Oklahoma": 36,
        "Arizona/New Mexico": 78,
        "Arizona/Arkansas": 53,
        "Arizona/Utah": 15,
        "California/New York": 39,
        "California/others NE": 54,
        "Colorado/others MW": 52,
        "Colorado/others NE": 51,
        "Connecticut/Massachusetts": 41,
        "Maryland/Maryland": 21,
        "Virginia/New York": 90,
        "Arizona/Foreign Born": 61,
        "Colorado/Foreign Born": 24,
        "Maine/others MW": 82,
        "Maine/others S": 90,
        "Maine/Foreign Born": 25,
        "New Hampshire/Foreign Born": 32,
        "New Jersey/Foreign Born": 34,
        "North Dakota/Foreign Born": 8,
        "Oregon/Foreign Born": 25,
        "Pennsylvania/Foreign Born": 27,
        "Vermont/Foreign Born": 33,
        "Washington/Foreign Born": 31,
        "Wyoming/Foreign Born": 24,
        "Wyoming/Wyoming": 59,
        "Wyoming/Iowa": 8,
        "Wyoming/others S": 84,
        "Missouri/Foreign Born": 18,
        "Florida/Foreign Born": 91,
        "Alabama/Alabama": 28,
        "Michigan/Foreign Born": 10,
        "Montana/Foreign Born": 8,
        "Nebraska/Foreign Born": 7,
        "South Dakota/Foreign Born": 8,
        "Texas/Foreign Born": 93,
        "Texas/Texas": 40,
        "Alabama/others S": 40,
        "California/others W": 50,
        "California/Illinois": 25,
        "West Virginia/West Virginia": 58,
        "New York/others MW": 70,
        "Wyoming/Missouri": 22,
        "Wyoming/others W": 85,
        "Wyoming/Utah": 90,
        "North Dakota/others W": 81,
        "Oregon/others W": 70,
        "Washington/others W": 69,
        "Washington/others NE": 3,
        "Connecticut/others USO": 89,
        "South Dakota/South Dakota": 63,
        "Wisconsin/others NE": 21,
        "Hawaii/Foreign Born": 50,
        "Hawaii/Hawaii": 52,
        "Alaska/Foreign Born": 42,
        "Alaska/Alaska": 49,
        "Alaska/US Other": 32,
        "Hawaii/others USO": 71,
        "Hawaii/others W": 96,
        "Maryland/others W": 93,
        "Louisiana/Louisiana": 36,
        "Florida/Pennsylvania": 74,
        "Colorado/Kansas": 48,
        "Colorado/Illinois": 49,
        "Colorado/Iowa": 8,
        "Colorado/Ohio": 9,
        "District of Columbia/others MW": 30,
        "Hawaii/others NE": 56,
        "Hawaii/others S": 57,
        "Hawaii/others MW": 53,
        "Idaho/Utah": 31,
        "Idaho/Missouri": 28,
        "Iowa/Foreign Born": 11,
        "Minnesota/others MW": 62,
        "North Dakota/others MW": 62,
        "South Dakota/others NE": 4,
        "South Dakota/others MW": 38,
        "Tennessee/others S": 56,
        "Tennessee/others MW": 83,
        "Vermont/others NE": 78,
        "Vermont/others MW": 81,
        "Virginia/Foreign Born": 93,
        "Washington/Minnesota": 49,
        "Washington/Illinois": 49,
        "Washington/Iowa": 40,
        "Washington/New York": 26,
        "Washington/Missouri": 15,
        "Washington/Ohio": 3,
        "West Virginia/Foreign Born": 13,
        "California/others S": 51,
        "California/Texas": 52,
        "California/Missouri": 24,
        "California/Oklahoma": 50,
        "Nevada/Texas": 59,
        "Nevada/others NE": 66,
        "Alaska/others MW": -16,
        "Arizona/others W": 57,
        "Arizona/Missouri": 62,
        "Arizona/Texas": 81,
        "Arizona/others NE": 75,
        "Arizona/others S": 34,
        "Alaska/California": 56,
        "Alaska/Washington": 56,
        "Alaska/Oregon": 61,
        "Alaska/others S": 42,
        "Alaska/others W": 69,
        "Alaska/others NE": 57,
        "Colorado/Missouri": 21,
        "Delaware/Maryland": 69,
        "Georgia/Georgia": 24,
        "Idaho/Iowa": 74,
        "Idaho/California": 89,
        "Idaho/Illinois": 46,
        "Indiana/Illinois": 69,
        "Indiana/Ohio": 36,
        "Louisiana/Texas": 27,
        "Louisiana/others MW": 60,
        "Maryland/New York": 67,
        "Massachusetts/Massachusetts": 48,
        "Minnesota/others W": 83,
        "Minnesota/others S": 74,
        "Missouri/others W": 78,
        "Montana/North Dakota": 63,
        "Nebraska/Iowa": 86,
        "Nebraska/others S": 73,
        "New Hampshire/Massachusetts": 85,
        "New Hampshire/others NE": 68,
        "North Dakota/Iowa": 17,
        "North Dakota/Illinois": 35,
        "Ohio/Pennsylvania": 56,
        "Oregon/Ohio": 44,
        "Oregon/California": 85,
        "Pennsylvania/Pennsylvania": 49,
        "Rhode Island/Rhode Island": 46,
        "South Dakota/Illinois": 91,
        "South Dakota/Wisconsin": 43,
        "South Dakota/Nebraska": 62,
        "South Dakota/Iowa": 48,
        "Tennessee/Tennessee": 49,
        "Tennessee/others NE": 91,
        "Texas/Oklahoma": 49,
        "Utah/Utah": 49,
        "Utah/California": 91,
        "Utah/Idaho": 54,
        "Utah/others MW": 74,
        "Utah/others NE": 53,
        "Vermont/New Hampshire": 88,
        "Washington/California": 84,
        "Washington/Wisconsin": 13
    },                
