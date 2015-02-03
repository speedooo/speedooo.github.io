var ageConverter, ethnicityConverter, genderConverter, sentenceConverter,offenceConverter, outcomeConverter, regionsConverter;

ethnicityConverter = {
    E: 'European',
    M: 'Maori',
    O: 'Other',
    P: 'Pacific People',
    X: 'Unknown'
};

offenceConverter = {
    '01': 'Homicide And Related Offences',
    '02': 'Acts Intended To Cause Injury',
    '03': 'Sexual Assault And Related Offences',
    '04': 'Dangerous Or Negligent Acts Endangering Persons',
    '05': 'Abduction, Harassment And Other Offences Against The Person',
    '06': 'Robbery, Extortion And Related Offences',
    '07': 'Unlawful Entry With Intent/Burglary, Break And Enter',
    '08': 'Theft And Related Offences',
    '09': 'Fraud, Deception And Related Offences',
    '10': 'Illicit Drug Offences',
    '11': 'Prohibited And Regulated Weapons And Explosives Offences',
    '12': 'Property Damage And Environmental Pollution',
    '13': 'Public Order Offences',
    '14': 'Traffic And Vehicle Regulatory Offences',
    '15': 'Offences Against Justice Procedures, Government Security And Government Operations',
    '16': 'Miscellaneous Offences'
};


ageConverter = {
    '17+': '17-19',
    '20+': '20-24',
    '25+': '25-29',
    '30s': '30-39',
    '40+': '40+',
    'X': 'Unknown'
};

sentenceConverter = {

    'CW' :'Community work, Corrections',
    'RR' : 'Reparation/Restitution',
    'CR' :'Community Detention',
    'FN' :'Fine',
    'IS' :'Intensive Supervision',
    'CC' :'Supervision by Community Corrections',
    'DD' :'Disqualification from driving',
    'HD' :'Home Detention',
    'IP' :'Imprisonment',
    'PD' :'Preventive Detention',
    'CD' :'Conviction and discharge',
    'LP' :'Life imprisonment',
    'OT'  :'Other'


}

genderConverter = {
    'F': 'Female',
    'M': 'Male',
    'X': 'Unknown'
};

regionsConverter = {
    AUK: 'Auckland',
    BOP: 'Bay of Plenty',
    CAN: 'Canterbury',
    GIS: 'Gisborne',
    HKB: "Hawke's Bay",
    MWT: 'Manawatu-Whanganui',
    MBH: 'Marlborough',
    NSN: 'Nelson',
    NTL: 'Northland',
    OTA: 'Otago',
    STL: 'Southland',
    TAS: 'Tasman',
    TKI: 'Taranaki',
    WKO: 'Waikato',
    WGN: 'Wellington',
    WTC: 'West Coast',
    XXX: 'Others'
};


d3.csv("data/convicted_offenders.csv", function (data) {
    var age, age_chart, all, countByAge, countByRegion, countByEthnicity, countByGender, countByOffence, countBySentence, countByYear, ethnicity, regions, region_chart, ethnicity_chart, gender, gender_chart, ndx, offence, offence_chart, sentence, sentence_chart, reset_widths, year, year_chart;
    ndx = crossfilter(data);
    all = ndx.groupAll();


    year = ndx.dimension(function (d) {
        return d["Year"];
    });
    countByYear = year.group().reduceSum(function (d) {
        return d.COUNT/1000;
    });

    regions = ndx.dimension(function (d) {
        return d["CourtCluster"];
    });
    countByRegion = regions.group().reduceSum(function (d) {
        return d.COUNT;
    });

    age = ndx.dimension(function (d) {
        return d["AgeGroup"];
    });
    countByAge = age.group().reduceSum(function (d) {
        return d.COUNT;
    });
    ethnicity = ndx.dimension(function (d) {
        return d["Ethnicity"];
    });
    countByEthnicity = ethnicity.group().reduceSum(function (d) {
        return d.COUNT;
    });

    offence = ndx.dimension(function (d) {
        return d["Offence"];
    });
    countByOffence = offence.group().reduceSum(function (d) {
        return d.COUNT;
    });

    gender = ndx.dimension(function (d) {
        return d["Gender"];
    });
    countByGender = gender.group().reduceSum(function (d) {
        return d.COUNT;
    });

    sentence = ndx.dimension(function (d) {
        return d["Sentence"];
    });
    countBySentence = sentence.group().reduceSum(function (d) {
        return d.COUNT;
    });


    d3.json("geo/states_nzl.topojson", function (error, nz) {
        var statesJson = topojson.feature(nz, nz.objects.states);
        var projection = d3.geo.mercator()
            .center([193.5, -45])
            .scale(1000)


        offence_chart = dc.rowChart("#offence-chart")
            .width($("#offence-chart").width()).height(500)
            .dimension(offence).group(countByOffence)
            .elasticX(true).gap(7)
            .label(function (d) {
                    return offenceConverter[d.key < 10 ? "0" + d.key : d.key]; })
            .title(function (d) {
                return offenceConverter[d.key < 10 ? "0" + d.key : d.key] + " (" + d.value + ")";})
            .renderLabel(true).xAxis().ticks(4);

        year_chart = dc.barChart("#year-chart")
            .width($("#year-chart").width()).height(250)
            .dimension(year).group(countByYear)
            .elasticY(true)
            .xAxisPadding(50).xUnits(dc.units.integers)
            .x(d3.scale.linear().domain([2002, 2013]))
            .y(d3.scale.linear())
            .centerBar(true)
            .margins({ top: 10, left: 40, right: 10, bottom: 50 })
            .legend(dc.legend().x(60).y(10).itemHeight(13).gap(5))
            .renderlet(function (chart) {chart.selectAll("g.x text")
                .attr('dx', '-20').attr('transform', "rotate(-65)");})
            .title(function (d) {
                    return "Value: " + d.value;  })
            .xAxis().tickFormat(function (v) {
                        return v;
                });


        age_chart = dc.pieChart("#age-chart")
            .width(90).height(90).radius(45).innerRadius(10)
            .dimension(age).group(countByAge)
            .title(function (d) {
                return ageConverter[d.key] + " (" + d.value + ")"; })
            .renderTitle(true).label(function (d) {
                return ageConverter[d.key];  })
            .renderLabel(true)
            .colors(d3.scale.ordinal().domain(["banana", "cherry", "blueberry"])
                .range(["#eeff00", "#ff0022", "#2200ff"]));


        ethnicity_chart = dc.rowChart("#ethnicity-chart")
            .width(350).height(200)
            .dimension(ethnicity).group(countByEthnicity)
            .elasticX(true).gap(5)
            .label(function (d) {
                return ethnicityConverter[d.key]; })
            .title(function (d) {
                return ethnicityConverter[d.key] + " (" + d.value + ")";  })
            .renderLabel(true).xAxis().ticks(3);


        gender_chart = dc.pieChart("#gender-chart")
            .width(90).height(90).radius(45).innerRadius(10)
            .dimension(gender).group(countByGender)
            .renderLabel(false).title(function (d) {
                return genderConverter[d.key] + " (" + d.value + ")"; })
            .renderTitle(true).label(function (d) {
                return genderConverter[d.key];  })
            .renderLabel(true).colors(d3.scale.ordinal().range(['red','green','blue']));

        //sentence_chart = dc.rowChart("#sentence-chart")
        //    .width($("#sentence-chart").width()).height(400)
        //    .dimension(sentence).group(countBySentence)
        //    .elasticX(true).gap(7)
        //    .label(function (d) {
        //        return sentenceConverter[d.key];  })
        //    .title(function (d) {
        //        return sentenceConverter[d.key] + " (" + d.value + ")"; })
        //    .renderLabel(true).xAxis().ticks(3);

        sentence_chart = dc.barChart("#sentence-chart")
            .width($("#sentence-chart").width()).height(400)
            .dimension(sentence).group(countBySentence)
            .margins({top: 10, right: 50, bottom: 25, left: 50})
            .xAxisPadding(20).xUnits(dc.units.ordinal)
            .ordinalColors(["#6a51a3", "#2171b5", "#238b45", "#d94801", "#cb181d"])
            .transitionDuration(500)
            .x(d3.scale.ordinal().domain(sentenceConverter))
            //.y(d3.scale.linear().domain([min, max]))
            .gap(10)
            .brushOn(false)
            .renderTitle(true)
            .title(function (d) {
                return sentenceConverter[d.key] + " (" + d.value + ")"; })
            //.renderlet(function (chart) {chart.append("text")
            //    .attr("x", "10")
            //    .attr("y", "10" )
            // //   .attr('dy', '.75em').attr('transform', "rotate(-65)")
            //    .text(function(d){return sentenceConverter[d.key]});})
            //.xAxis().tickFormat(function (v) {
            //    return v;})
            .yAxis().tickFormat(function (v) {
                return v/1000+"K";
            });

        region_chart = dc.geoChoroplethChart("#region-chart")
            .width(350)
            .height(330)
            .dimension(regions)
            .group(countByRegion)
            .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
            .colorDomain([0, 100])
            .colorCalculator(function (d) {
                return d ? region_chart.colors()(d) : '#ccc';
            })
            .overlayGeoJson(statesJson.features, "state", function (d) {
                return (d.properties.code).substring(3);
            })
            .projection(projection)
            .title(function (d) {
                return "Region: " + regionsConverter[d.key] + "\nTotal: " + d.value;
            });


        dc.dataCount("#data-count").dimension(ndx).group(all);
        return dc.renderAll();

    })

});
