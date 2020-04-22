var main_point_color = 'black';
var main_stroke_color = '#444444';
var sing_lin_selection_color = 'blue';
var hover_color = 'red';

var pdata; //fitness data
var plates = ['P1', 'P2', 'P3'];

var current_platewell;

var micro_type = 'cropped';

var fgens = [70, 550, 1410, 2640, 3630, 5150, 7530, 10150];
var sgens = [70, 1410, 2640, 5150, 7530, 10150];
var s_type = '_s_zeroed';
var strain2col = {'diploid': '#000000', 'alpha': '#FFB000', 'a': '#648FFF', 'BAD': 'grey'};
var strains = ['diploid', 'alpha', 'a'];
var s_domain = [-0.05, 0.25];

let_to_num = {'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8};

var clicked = false;

num_to_let = {1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 
              9: 'I', 10: 'J', 11: 'K', 12: 'L', 13: 'M', 14: 'N', 15: 'O', 16: 'P'}

//layout
var fitness_w = 650;
var fitness_left_break = 60;
var fitness_onegraph_w = (fitness_w - 3*fitness_left_break)/3;
var fitness_h = 250;
var fitness_h_buf = 40;
var wgs_w = 550;
var wgs_h = 250;
var wgs_left_break = 40;
var wgs_top_bottom_buf = 40;

var gens_x = {'P1': d3.scaleLinear().range([fitness_left_break, fitness_left_break+fitness_onegraph_w]).domain([0, 10000]),
              'P2': d3.scaleLinear().range([fitness_left_break*2+fitness_onegraph_w, fitness_left_break*2+fitness_onegraph_w*2]).domain([0, 10000]),
              'P3': d3.scaleLinear().range([fitness_left_break*3+fitness_onegraph_w*2, fitness_left_break*3+fitness_onegraph_w*3]).domain([0, 10000])};
var s_y = {'P1': d3.scaleLinear().range([fitness_h-fitness_h_buf, fitness_h_buf]).domain(s_domain),
            'P2': d3.scaleLinear().range([fitness_h-fitness_h_buf, fitness_h_buf]).domain(s_domain),
            'P3': d3.scaleLinear().range([fitness_h-fitness_h_buf, fitness_h_buf]).domain(s_domain)};

var s_trajectory = {'P1': d3.line().x(function(d) { return gens_x['P1'](d.x); }).y(function(d) { return s_y['P1'](d.y); }),
                    'P2': d3.line().x(function(d) { return gens_x['P2'](d.x); }).y(function(d) { return s_y['P2'](d.y); }),
                    'P3': d3.line().x(function(d) { return gens_x['P3'](d.x); }).y(function(d) { return s_y['P3'](d.y); })};

var fitness_svg_obj;

//Allele plotting set up

var wgs_svg_obj;

var time_x = d3.scaleLinear().range([wgs_left_break, wgs_w-wgs_left_break]).domain([0,10000]);

var freq_ax = d3.scaleLinear().range([wgs_h-wgs_top_bottom_buf, wgs_top_bottom_buf]).domain([0, 1]);

var freq_traj = d3.line()
.x(function(d) { return time_x(d.x); })
.y(function(d) { return freq_ax(d.y); });

var num_bc_thresh = 3;

var dat = {};
var wells = ['P1B02', 'P1C02', 'P1B03', 'P1D03', 'P1B04', 'P1C04', 'P1E04', 'P1G04', 'P1C05', 'P1F05', 'P1G05', 'P1C06', 'P1C07', 'P1B07', 'P1F07', 'P1C08', 'P1F08', 'P1G08', 'P1C09', 'P1D09', 'P1E09', 'P1G09', 'P1F10', 'P1G10', 'P1B11', 'P1C11', 'P1E11', 'P1F11', 'P1G11', 'P1H11', 'P2C02', 'P2F02', 'P2D03', 'P2B04', 'P2C04', 'P2G04', 'P2B05', 'P2C05', 'P2G05', 'P2C06', 'P2D06', 'P2E06', 'P2B07', 'P2F07', 'P2B08', 'P2D08', 'P2E08', 'P2G08', 'P2B09', 'P2F09', 'P2G09', 'P2B10', 'P2C10', 'P2G10', 'P2B11', 'P2C11', 'P2D11', 'P2E11', 'P2F11', 'P2G11', 'P3D02', 'P3E02', 'P3G02', 'P3C03', 'P3D03', 'P3F03', 'P3C04', 'P3C05', 'P3D05', 'P3F05', 'P3G05', 'P3G06', 'P3B07', 'P3C07', 'P3F07', 'P3B08', 'P3E08', 'P3D09', 'P3F09', 'P3G09', 'P3B10', 'P3C10', 'P3D10', 'P3G10', 'P3B11', 'P3C11', 'P3D11', 'P3E11', 'P3F11', 'P3G11'];
var well;
var file_num = 0;

var coding_changes = ['missense_variant', 'stop_lost', 'stop_gained', 'start_lost', 'conservative_inframe_insertion', 'conservative_inframe_deletion', 'disruptive_inframe_insertion', 'disruptive_inframe_deletion', 'frameshift_variant'];

var wgs_filters = {};

var fit_filters = {'good_data': ['strain', [RegExp('diploid', 'i'), RegExp('alpha', 'i'), RegExp('a', 'i')], 'look']};

//FUNCTION FOR BRING TO FRONT
//http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function filter_fitness() {
  fitness_svg_obj.selectAll('.s_traj')
    .style('display', function(d) {
      for (var key in fit_filters) {
        var filt = fit_filters[key];
        if (filt[0] != 'no filter') {
          var filt_col = d[filt[0]];
          var pass = false;
          for (var i in filt[1]) {
            if (filt_col.search(filt[1][i]) > -1) {
              pass = true;
            }
          }
          if ( ((!pass)&(filt[2]=='look')) | ((pass)&(filt[2]=='not')) ) {
            return 'none';
          }
        }
      }
      return 'block';
    });
}

function change_show_focals() {
  if (d3.select("#show_focal_pops").property('checked')) {
    fit_filters['show_f'] = ['platewell', wells, 'look']
  } else {
    fit_filters['show_f'] = ['no filter'];
  }
  filter_fitness();
}

function get_well_row(platewell) {
  for (var i=0; i<pdata.length; i++) {
    //console.log(platewell, pdata[i]['platewell']);
    if (platewell == pdata[i]['platewell']) {
      return pdata[i];
    }
  }
}

function show_coverage(i) {
  console.log(i);
  d3.select('#depth_img2').attr("src", "coverage/G" + String(sgens[i]) + "_" + current_platewell + '_depth.png');
}

function highlight_well(platewell, tmp_info) {
  current_platewell = platewell;
  d3.select("#well_name_etc").html('Well: ' + platewell + ', ' + tmp_info['strain'] + '  ploidy: ' + tmp_info['ploidy']);
  d3.selectAll('.facs_img').attr("src", "FACS_graphs/" + platewell.slice(0,2) + '_' + platewell.slice(2,platewell.length) + '.png');
  d3.select('#depth_img1').attr("src", "coverage/" + platewell + '_allgens_depth.png');
  d3.select('#depth_img2').attr("src", "coverage/G10150_" + platewell + '_depth.png');
  d3.select("#see_facs_data").html('see FACS data (click it to close it)');
  d3.select("#see_depth_data").html('see depth data');
  d3.selectAll('.s_traj').attr('class', 's_traj');
  d3.selectAll('.s_traj')
    .filter(function(d) { return d['platewell']==platewell; })
    .attr('class', 's_traj highlighted_traj').moveToFront();
  if (wells.indexOf(platewell) > -1) {
    d3.select('#microscopy_img').attr('src', 'Timecourse_images/' + micro_type + '_' + platewell.slice(0,2) + '_' + platewell.slice(2,platewell.length) + '.png');
  } else {
    d3.select('#microscopy_img').attr('src', 'no_microscopy.png');
  }
}

function change_micro_type() {
  if (micro_type == 'cropped') {
    micro_type = 'fuller';
  } else {
    micro_type = 'cropped';
  }
  console.log(micro_type);
  d3.select('#microscopy_img').attr('src', 'Timecourse_images/' + micro_type + '_' + current_platewell.slice(0,2) + '_' + current_platewell.slice(2,current_platewell.length) + '.png');
}

function clicked_s(d) {
  console.log(d);
  highlight_well(d['platewell'], d);
  //display wgs data
  if (wells.indexOf(d['platewell']) > -1) {
    file_num = wells.indexOf(d['platewell']);
    read_wgs_data(d['platewell'])
  }
  else { 
    d3.select('#mut_gene').html('No sequencing data for this population');
    d3.selectAll(".wgs_data_svg").remove();
  }
}

function make_fitness_graphs() {
  fitness_svg_obj = d3.select('#fitness_svg')
  for (var i=0; i<3; i++) {
    p = plates[i];
    var fitness_gens_ax = d3.axisBottom(gens_x[p]).ticks(5);
    var fitness_s_ax = d3.axisLeft(s_y[p]).ticks(5);
    fitness_svg_obj.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + gens_x[p](0) + ", 0)")
      .call(fitness_s_ax);
    fitness_svg_obj.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + s_y[p](s_domain[0]) + ")")
      .call(fitness_gens_ax);
  }

  fitness_svg_obj.selectAll('.s_traj')
    .data(pdata)
    .enter()
    .append('path')
      .attr('class', 's_traj')
      .attr('stroke', function(d) { 
        return strain2col[d['strain']]; 
      })
      .attr('d', function(d) {
        var traj_d = [];
        for (let i=0; i<fgens.length; i++) {
          traj_d.push({'x': fgens[i], 'y': d['Gen' + String(fgens[i]) + s_type]})
        }
        //console.log(traj_d);
        return s_trajectory[d['plate']](traj_d); 
      })
      .on('click', function(d) { 
        clicked_s(d); 
      } );
  change_show_focals();
}

function load_fitness_data() {
  d3.tsv('well_fitness_info_etc.tsv')
    .then(function(raw_data) {
      pdata = raw_data;
      make_fitness_graphs();
    })
    .catch(function(error) {
          console.log(error);
    });
}

//DATA OVERLAYS
function show_overlay(which_one) {
  d3.selectAll('.data_overlay')
    .style('display', function() {
      console.log(which_one, d3.select(this).attr('id'), (d3.select(this).attr('id')==which_one+'_div') ? 'block' : 'none')
      return (d3.select(this).attr('id')==which_one+'_div') ? 'block' : 'none';
  })
}

//MUTATION INFO DISPLAY STUFF
function highlight(lin) {
  d3.select("#mut_gene").html(function() { if (lin["ANN"].split(';')[0].split('|')[4] == null) { return "NA"; } else { return lin["ANN"].split(';')[0].split('|')[4]; } } );
  wgs_svg_obj.selectAll('.allele_count_text')
    .text(function(d) { return lin["G"+String(d)+'_allele_counts']; })
  d3.select("#mut_ann").html(lin["info"] + "<br /><br />Percentage of alt counts:" + lin['perc_of_alt']);
}

function filter_wgs() {
  wgs_svg_obj.selectAll(".allele_path")
    .style('display', function(d) {
      for (var key in wgs_filters) {
        var filt = wgs_filters[key];
        if (filt[0] != 'no filter') {
          var filt_col = d[filt[0]];
          var pass = false;
          for (var i in filt[1]) {
            if (filt_col.search(filt[1][i]) > -1) {
              pass = true;
            }
          }
          if ( ((!pass)&(filt[2]=='look')) | ((pass)&(filt[2]=='not')) ) {
            return 'none';
          }
        }
      }
      return 'block';
    });
}

function lookup_highlight() {
  //only displays lineages that have both search terms somewhere in their environment or bc info
  var search_for1 = document.getElementById("cat_search1").value;
  var search_for2 = document.getElementById("cat_search2").value;
  var how1 = 'look';
  var how2 = 'look';
  if (search_for1[0] == '!') {
    search_for1 = search_for1.slice(1, search_for1.length);
    how1 = 'not';
  }
  if (search_for2[0] == '!') {
    search_for2 = search_for2.slice(1, search_for2.length);
    how2 = 'not';
  }
  search_for1 = RegExp(search_for1);
  search_for2 = RegExp(search_for2);
  wgs_filters['search_block1'] = ['info', [search_for1], how1];
  wgs_filters['search_block2'] = ['info', [search_for2], how2];
  fit_filters['search_block1'] = ['genes_w_muts_fixed', [search_for1], how1];
  fit_filters['search_block2'] = ['genes_w_muts_fixed', [search_for2], how2];
  filter_fitness();
  filter_wgs();
}

function change_hide_syn() {
  if (d3.select("#hide_s_muts").property('checked')) {
    wgs_filters['hide_s'] = ['ANN', coding_changes, 'look'];
  } else {
    wgs_filters['hide_s'] = ['no filter'];
  }
  filter_wgs();
}

function make_allele_freq_graph() {
  wgs_svg_obj = d3.select("#wgs_svg")
    .append("svg")
        .attr("class", "wgs_data_svg");

  wgs_svg_obj.selectAll("path")
    .data(dat)
      .enter()
      .append("path")
        .attr("class", "allele_path")
        .on("mouseover", function(d) { 
            highlight(d); 
        })
        .on("click", function(d) { console.log(d); })
        .attr("stroke", "#333")
        .attr('d', function(d) {
          var traj_d = [];
          var bits = d['af_trajectory'].split(';');
          for (let i=0; i<bits.length; i++) {
            traj_d.push({'x': parseInt(bits[i].split('_')[0]), 'y': parseFloat(bits[i].split('_')[1])})
          }
          return freq_traj(traj_d); 
        });

  wgs_svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + time_x(0) + ", 0)")
    .call(d3.axisLeft(freq_ax));
  wgs_svg_obj.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + freq_ax(0) + ")")
    .call(d3.axisBottom(time_x));

  wgs_svg_obj.selectAll('.allele_count_text')
    .data(sgens)
      .enter()
      .append('text')
        .attr('class', 'allele_count_text')
        .attr('id', function(d) { return 'allele_count_' + String(d); })
        .attr('text-anchor', 'middle')
        .attr('x', function(d) { return time_x(d); })
        .attr('y', function(d) { return freq_ax(1.1); })
        .text(function(d) { return String(d); })
    
  lookup_highlight();
  change_hide_syn();
}

function read_wgs_data(well) {
  file_name = well + ".tsv";
  d3.tsv("Allele_freqs/" + file_name)
    .then(function(data_in) {
      dat = data_in;
      //console.log(dat.length);
      d3.selectAll(".wgs_data_svg").remove();
      make_allele_freq_graph();
    })
    .catch(function(error) {
      console.log(error);  
  });
}

function new_file(increment) {
  if (file_num + increment >= wells.length) {
    file_num = 0;
  } else if (file_num + increment < 0) {
    file_num = wells.length-1;
  } else {
    file_num = file_num + increment;
  }
  read_wgs_data(wells[file_num]);
  highlight_well(wells[file_num], get_well_row(wells[file_num]));
}