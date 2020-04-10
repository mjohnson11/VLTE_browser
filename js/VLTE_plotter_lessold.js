var main_point_color = 'black';
var main_stroke_color = '#444444';
var sing_lin_selection_color = 'blue';
var hover_color = 'red';

var pdata = {};
var plates = ['P1', 'P2', 'P3']

var fgens = [70, 550, 1410, 2640, 3630, 5150, 7530, 10150];
var s_type = '_s_with_T0_scaled';
strain2col = {'a': 'red', 'alpha': 'green', 'diploid': 'blue', 'BAD': 'grey'};
var s_domain = [-0.15, 0.1];

let_to_num = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8};

var clicked = false;

num_to_let = {1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 
              9: 'I', 10: 'J', 11: 'K', 12: 'L', 13: 'M', 14: 'N', 15: 'O', 16: 'P'}

var gens_x = {'P1': d3.scaleLinear().range([40, 750]).domain([0, 10000]),
              'P2': d3.scaleLinear().range([40, 750]).domain([0, 10000]),
              'P3': d3.scaleLinear().range([40, 750]).domain([0, 10000])}
var s_y = {'P1': d3.scaleLinear().range([500, 40]).domain(s_domain),
            'P2': d3.scaleLinear().range([500, 40]).domain(s_domain),
            'P3': d3.scaleLinear().range([500, 40]).domain(s_domain)}

var s_trajectory = {};
for (var i=0; i<3; i++) {
  s_trajectory[plates[i]] = d3.line().x(function(d, i) { return gens_x[plates[i]](d.x); }).y(function(d) { return s_y[plates[i]](d.y); });
}


//FUNCTION FOR BRING TO FRONT
//http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


function make_shit(p, pdat) {

  svg_obj = d3.select('#big_svg')

  p = plates[i];
  svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + gens_x[p](0) + ", 0)")
    .call(d3.axisLeft(s_y[p]));
  svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + s_y[p](s_domain[0]) + ")")
    .call(d3.axisBottom(gens_x[p]));

  svg_obj.selectAll('.nothing')
    .data(pdat)
    .enter()
    .append('path')
      .attr('class', 's_traj')
      .attr('stroke', function(d) { 
        return strain2col[d['strain']]; 
      })
      .attr('d', function(d) {
        var traj_d = [];
        for (let i=0; i<fgens.length; i++) {
          traj_d.push({'x': fgens[i], 'y': d['Gen' + String(gens[i]) + s_type]})
        }
        return s_trajectory[p](traj_d); 
      })
      .attr('display', function(d) { if (d['strain'] == 'BAD') { return 'none'; } else { return 'block'; }; });

      
}

function load_data() {
  for (var i=0; i<3; i++) {
    d3.tsv(plates[i] + 'fitness_data.tsv')
      .then(function(raw_data) {
        pdata[plates[i]] = raw_data;
        make_shit(plates[i], pdata[plates[i]]);
      })
      .catch(function(error) {
            console.log(error);
      });
  }
}


var time_x = d3.scaleLinear()
  .range([100, 1200])
  .domain([0,11000]);

var freq_ax = d3.scaleLinear()
  .range([470, 50])
  .domain([0, 1]);

var freq_traj = d3.line()
  .x(function(d) { return time_x(d.x); })
  .y(function(d) { return freq_ax(d.y); });

var num_bc_thresh = 3;

var dat = {};
var wells = ['P1B02', 'P1C02', 'P1B03', 'P1D03', 'P1B04', 'P1C04', 'P1E04', 'P1G04', 'P1C05', 'P1F05', 'P1G05', 'P1C06', 'P1C07', 'P1B07', 'P1F07', 'P1C08', 'P1F08', 'P1G08', 'P1C09', 'P1D09', 'P1E09', 'P1G09', 'P1F10', 'P1G10', 'P1B11', 'P1C11', 'P1E11', 'P1F11', 'P1G11', 'P1H11', 'P2C02', 'P2F02', 'P2D03', 'P2B04', 'P2C04', 'P2G04', 'P2B05', 'P2C05', 'P2G05', 'P2C06', 'P2D06', 'P2E06', 'P2B07', 'P2F07', 'P2B08', 'P2D08', 'P2E08', 'P2G08', 'P2B09', 'P2F09', 'P2G09', 'P2B10', 'P2C10', 'P2G10', 'P2B11', 'P2C11', 'P2D11', 'P2E11', 'P2F11', 'P2G11', 'P3D02', 'P3E02', 'P3G02', 'P3C03', 'P3D03', 'P3F03', 'P3C04', 'P3C05', 'P3D05', 'P3F05', 'P3G05', 'P3G06', 'P3B07', 'P3C07', 'P3F07', 'P3B08', 'P3E08', 'P3D09', 'P3F09', 'P3G09', 'P3B10', 'P3C10', 'P3D10', 'P3G10', 'P3B11', 'P3C11', 'P3D11', 'P3E11', 'P3F11', 'P3G11'];
var well;
var file_num = 0;

var gens = [70, 1410, 2640, 5150, 7530, 10150];


function lookup_highlight() {
    //only displays lineages that have both search terms somewhere in their environment or bc info
    var search_for1 = document.getElementById("cat_search1").value;
    var search_for2 = document.getElementById("cat_search2").value;
    
    svg_obj.selectAll(".allele_path")
        .style("display", function(d) {
            var d_all_info = d['ANN'];
            var tmp_return = "none";
            if ((d_all_info.indexOf(search_for1) > -1) &&
                (d_all_info.indexOf(search_for2) > -1)) {
                tmp_return = 'block';
            }
            return tmp_return;
        });
}


//LINEAGE INFO DISPLAY STUFF
function highlight(lin) {
  d3.select("#lin_gene").html(lin["ANN"].split(';')[0].split('|')[4]);
  d3.select("#lin_edge").html(lin["REF"] + ' -> ' + lin["ALT"] + "\t" + [lin["G70_allele_counts"], lin["G1410_allele_counts"], lin["G2640_allele_counts"], lin["G5150_allele_counts"], lin["G7530_allele_counts"], lin["G10150_allele_counts"]].join("\t") + "\t" + lin['perc_of_alt']);
  d3.select("#lin_info").html(lin["ANN"]);
}

function do_it() {
    svg_obj = d3.select("#svg_div")
        .append("svg")
            .attr("class", "raw_data_svg");

    svg_obj.selectAll("path")
      .data(dat)
        .enter()
        .append("path")
          .attr("class", "allele_path")
          .on("mouseover", function(d) { 
              d3.select(this).attr('stroke', 'red');
              highlight(d); 
          })
          .on("mouseout", function(d) { 
              d3.select(this).attr('stroke', '#333');
          })
          .on("click", function(d) { console.log(d); })
          .attr("fill", "none")
          .attr('stroke', "#333")
          .attr("stroke-width", 1.5)
          .attr('d', function(d) {
            var traj_d = [];
            var bits = d['af_trajectory'].split(';');
            for (let i=0; i<bits.length; i++) {
              traj_d.push({'x': parseInt(bits[i].split('_')[0]), 'y': parseFloat(bits[i].split('_')[1])})
            }
            return freq_traj(traj_d); 
          });

    svg_obj.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + time_x(0) + ", 0)")
      .call(d3.axisLeft(freq_ax));
    svg_obj.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + freq_ax(0) + ")")
      .call(d3.axisBottom(time_x));
  
    lookup_highlight();

}

function read_data() {
  d3.selectAll(".raw_data_svg").remove();
  well = wells[file_num];
  file_name = well + "_fixed.tsv";
  d3.select("#well_name").html(well);
  d3.tsv("Allele_freqs/" + file_name)
    .then(function(data_in) {
      dat = data_in;
      console.log(dat.length);
      do_it();
    })
    .catch(function(error) {
      console.log(error);  
  });
}

function new_file(increment) {
  if (file_num + increment >= wells.length) {
    alert('no more');
  } else if (file_num + increment < 0) {
    alert('too low');
  } else {
    file_num = file_num + increment;
    read_data()
  }
}

