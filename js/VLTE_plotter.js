var main_point_color = 'black';
var main_stroke_color = '#444444';
var sing_lin_selection_color = 'blue';
var hover_color = 'red';
var highlighted_mutation = null;

var pdata; //fitness data
var plates = ['P1', 'P2', 'P3'];
var plate_names = ['YPD 30°C', 'SC 30°C', 'SC 37°C'];

var current_platewell;

var fgens = [70, 550, 1410, 2640, 3630, 5150, 7530, 10150];
var sgens = [70, 1410, 2640, 5150, 7530, 10150];

// This dictionary changes the recorded generation numbers to the correct generation numbers
// Since P3 only does 8 gens/day it is very different, the other differences are due to little recording errors
var gen_fixer = {70: {'P1': 70, 'P2': 70, 'P3': 56, 'P4': 70},
             550: {'P1': 560, 'P2': 560, 'P3': 448, 'P4': 560},
             1410: {'P1': 1410, 'P2': 1410, 'P3': 1128, 'P4': 1410},
             2640: {'P1': 2640, 'P2': 2640, 'P3': 2106, 'P4': 2640},
             3630: {'P1': 3660, 'P2': 3660, 'P3': 2922, 'P4': 3660},
             5150: {'P1': 5170, 'P2': 5170, 'P3': 4130, 'P4': 5170},
             7530: {'P1': 7550, 'P2': 7560, 'P3': 6042, 'P4': 7560},
             10150: {'P1': 10190, 'P2': 10200, 'P3': 8098, 'P4': 10200}}


var s_type = '_s_scaled';
var strain2col = {'diploid': '#000000', 'alpha': '#FFB000', 'a': '#648FFF', 'BAD': 'grey'};
var strains = ['diploid', 'alpha', 'a'];
var s_domains = {'P1': [-0.21, 0.15], 'P2': [-0.11, 0.17], 'P3': [-0.21, 0.21]};

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
var s_y = {'P1': d3.scaleLinear().range([fitness_h-fitness_h_buf, fitness_h_buf]).domain(s_domains['P1']),
            'P2': d3.scaleLinear().range([fitness_h-fitness_h_buf, fitness_h_buf]).domain(s_domains['P2']),
            'P3': d3.scaleLinear().range([fitness_h-fitness_h_buf, fitness_h_buf]).domain(s_domains['P3'])};

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
var current_wells = [];
var well;
var file_num = 0;

var coding_changes = ['missense', 'nonsense', 'indel', 'SV'];

var wgs_filters = {};

var fit_filters = {'good_data': ['strain', [RegExp('diploid', 'i'), RegExp('alpha', 'i'), RegExp('a', 'i')], 'look']};
var fit_filters_use = true;

//FUNCTION FOR BRING TO FRONT
//http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

function well_restruc(w) {
  return w.slice(0,2) + String((w.slice(3,5)=='11')) + w.slice(3,5) + w[2];
}

function well_sorter(w1, w2) {
  if (well_restruc(w1) < well_restruc(w2)) {
    return -1;
  } else if (well_restruc(w1) > well_restruc(w2)) {
    return 1;
  } else {
    return 0;
  }
}

function filter_fitness() {
  current_wells = []
  fitness_svg_obj.selectAll('.s_traj')
    .style('display', function(d) {
      for (var key in fit_filters) {
        var filt = fit_filters[key];
        if (fit_filters_use || (['show_f', 'good_data'].indexOf(key) > -1)) {
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
      }
      current_wells.push(d['platewell']);
      return 'block';
    });
  current_wells = current_wells.sort(well_sorter);
  console.log(current_wells);
}

function change_show_focals() {
  if (d3.select("#show_focal_pops").property('checked')) {
    fit_filters['show_f'] = ['platewell', wells, 'look']
  } else {
    fit_filters['show_f'] = ['no filter'];
  }
  filter_fitness();
}

function change_filter_focals() {
  if (d3.select("#filter_pops").property('checked')) {
    fit_filters_use = true;
  } else {
    fit_filters_use = false;
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

function big_image_toggle(display_type) {
  d3.select("#big_microscopy_div").style("display", display_type);
}

function highlight_well(platewell, tmp_info) {
  current_platewell = platewell;
  d3.select("#well_name_etc").html('Well: ' + platewell + ', ' + tmp_info['strain']);
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
    d3.select('#microscopy_img').attr('src', 'imaging/cropped_' + platewell + '.png');
    d3.select('#big_microscopy_img').attr('src', 'imaging/cropped_' + platewell + '.png');
  } else {
    d3.select('#microscopy_img').attr('src', 'no_microscopy.png');
    d3.select('#big_microscopy_img').attr('src', 'no_microscopy.png');
  }
}


function try_to_show_wgs(platewell) {
    //display wgs data
    if (wells.indexOf(platewell > -1)) {
      well_num = current_wells.indexOf(platewell);
      read_wgs_data(platewell)
    }
    else { 
      d3.select('#mut_gene').html('No sequencing data for this population');
      d3.selectAll(".wgs_data_svg").remove();
    }
}

function clicked_s(d) {
  console.log(d);
  highlight_well(d['platewell'], d);
  try_to_show_wgs(d['platewell']);
}

function make_fitness_graphs() {

  fitness_svg_obj = d3.select('#fitness_svg')
  for (let p of plates) {
    var fitness_gens_ax = d3.axisBottom(gens_x[p]).ticks(5);
    var fitness_s_ax = d3.axisLeft(s_y[p]).ticks(5);
    fitness_svg_obj.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + gens_x[p](0) + ", 0)")
      .call(fitness_s_ax);
    fitness_svg_obj.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + s_y[p](s_domains[p][0]) + ")")
      .call(fitness_gens_ax);
    
    fitness_svg_obj.append('text')
      .attr('class', 'axis_label')
      .attr('text-anchor', 'middle')
      .attr('x', gens_x[p](5000))
      .attr('y', fitness_h-2)
      .text('Generations');
  
    fitness_svg_obj.append('text')
      .attr('class', 'axis_label')
      .attr('text-anchor', 'middle')
      .attr('x', gens_x[p](5000))
      .attr('y', 40)
      .text("("+plate_names[plates.indexOf(p)]+")");

    fitness_svg_obj.append('text')
      .attr('class', 'axis_label')
      .attr('text-anchor', 'middle')
      .attr('x', gens_x[p](5000))
      .attr('y', 20)
      .text("Fitness");
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
        for (let gen of fgens) {
          traj_d.push({'x': gen_fixer[gen][d['plate']], 'y': d['Gen' + String(gen) + s_type]})
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
      for (row of pdata) {
        current_wells.push(row['platewell']);
      }
      console.log(current_wells);
      make_fitness_graphs();
      read_gff();
    })
    .catch(function(error) {
          console.log(error);
    });
}

//DATA OVERLAYS
function show_overlay(which_one) {
  d3.selectAll('.data_overlay')
    .style('display', function() {
      return (d3.select(this).attr('id')==which_one+'_div') ? 'block' : 'none';
  })
}

//MUTATION INFO DISPLAY STUFF
function highlight(mutation) {
  if (!mutation) {
    if (highlighted_mutation) {
      mutation = highlighted_mutation;
    }
  }
  if (mutation) {
    wgs_svg_obj.selectAll('.allele_count_text')
      .text(function(d) { return "(" + String(mutation["G"+String(d)+'_allele_counts']).replace(".0", '').replace(".0", '') + ")"; })
    d3.select("#mut_ann").html(mutation['CHROM']+' '+mutation['POS']+' '+mutation['REF']+'->'+mutation['ALT'] + "<br /><br />" + mutation["info"] + "<br /><br />" + mutation["briefDescription"]);
    d3.select("#mut_gene").html(function() { 
      if (mutation["ANN_simpler"].split(';')[0].split('|')[3] == null) { return "NA"; } 
      else { 
        return "<a target='_blank' href=https://www.yeastgenome.org/locus/" + mutation["Gene_ORF"] + ">" + mutation["Gene_ORF"] + "</a>"; 
      }  
    });
  }
}

function sticky_highlight(mutation) {
  d3.selectAll('.allele_path')
      .attr('class', 'allele_path')
  if (highlighted_mutation == mutation) {
    highlighted_mutation = null;
  } else {
    highlighted_mutation = mutation;
    show_region(mutation['CHROM'], parseInt(mutation['POS']), current_well, gen_fixer);
    d3.selectAll('.allele_path')
      .filter(function(d) { return (d['CHROM']==highlighted_mutation['CHROM']) && (d['POS']==highlighted_mutation['POS']); })
      .attr('class', 'allele_path highlighted_allele').moveToFront();
  }
}

function filter_wgs() {
  wgs_svg_obj.selectAll(".allele_path")
    .style('display', function(d) {
      for (var key in wgs_filters) {
        var filt = wgs_filters[key];
        if (filt[0] != 'no filter') {
          var filt_col = d[filt[0]];
          var pass = false;
          for (let f of filt[1]) {
            if (filt_col.search(f) > -1) {
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
  wgs_filters['search_block1'] = ['ANN_simpler', [search_for1], how1];
  wgs_filters['search_block2'] = ['ANN_simpler', [search_for2], how2];
  fit_filters['search_block1'] = ['genes_w_nonsyn_muts', [search_for1], how1];
  fit_filters['search_block2'] = ['genes_w_nonsyn_muts', [search_for2], how2];
  filter_fitness();
  filter_wgs();
}

function change_hide_syn() {
  if (d3.select("#hide_s_muts").property('checked')) {
    wgs_filters['hide_s'] = ['ANN_simpler', coding_changes, 'look'];
  } else {
    wgs_filters['hide_s'] = ['no filter'];
  }
  filter_wgs();
}

function make_allele_freq_graph(well) {
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
        .on("mouseout", function() {
          highlight(null)
        })
        .on("click", function(d) { 
          sticky_highlight(d);
        })
        .attr("stroke", "#333")
        .attr('d', function(d) {
          var traj_d = [];
          var bits = d['af_trajectory'].split(';');
          if (bits.length > 1) {
            for (let i=0; i<bits.length; i++) {
              traj_d.push({'x': gen_fixer[parseInt(bits[i].split('_')[0])][well.slice(0,2)], 'y': parseFloat(bits[i].split('_')[1])})
            }
            return freq_traj(traj_d); 
          } else {
            return "";
          }
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
        .attr('font-size', 12)
        .attr('x', function(d) { return time_x(gen_fixer[d][well.slice(0,2)]); })
        .attr('y', freq_ax(1.05));

  wgs_svg_obj.append('text')
    .attr('class', 'axis_label')
    .attr('text-anchor', 'middle')
    .attr('x', time_x(5000))
    .attr('y', freq_ax(-0.2))
    .text('Generations');

  wgs_svg_obj.append('text')
    .attr('class', 'axis_label')
    .attr('text-anchor', 'middle')
    .attr('x', time_x(5000))
    .attr('y', freq_ax(1.15))
    .text("Allele Frequency");
    
  lookup_highlight();
  change_hide_syn();
}

function read_wgs_data(well) {
  current_well = well;
  file_name = well + ".tsv";
  d3.tsv("Allele_freqs/" + file_name)
    .then(function(data_in) {
      dat = data_in;
      console.log(file_name);
      console.log(dat.length, dat[0]);
      //console.log(dat.length);
      d3.selectAll(".wgs_data_svg").remove();
      make_allele_freq_graph(well);
    })
    .catch(function(error) {
      console.log(error);  
  });
}

function new_well(increment) {
  if (well_num + increment >= current_wells.length) {
    well_num = 0;
  } else if (well_num + increment < 0) {
    well_num = wells.length-1;
  } else {
    well_num = well_num + increment;
  }
  try_to_show_wgs(current_wells[well_num]);
  highlight_well(current_wells[well_num], get_well_row(current_wells[well_num]));
}