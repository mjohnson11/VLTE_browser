var main_point_color = 'black';
var main_stroke_color = '#444444';
var sing_lin_selection_color = 'blue';
var hover_color = 'red';

var time_x = d3.scaleLinear()
  .range([100, 1200])
  .domain([0,11000]);

var freq_ax = d3.scaleLinear()
  .range([470, 50])
  .domain([0, 1]);

var freq_traj = d3.line()
  .x(function(d) { return time_x(d.x); })
  .y(function(d) { return freq_ax(d.y); });

var svg_obj;

var num_bc_thresh = 3;

var dat = {};
var wells = ['P1B02', 'P1C02', 'P1B03', 'P1D03', 'P1B04', 'P1C04', 'P1E04', 'P1G04', 'P1C05', 'P1F05', 'P1G05', 'P1C06', 'P1C07', 'P1B07', 'P1F07', 'P1C08', 'P1F08', 'P1G08', 'P1C09', 'P1D09', 'P1E09', 'P1G09', 'P1F10', 'P1G10', 'P1B11', 'P1C11', 'P1E11', 'P1F11', 'P1G11', 'P1H11', 'P2C02', 'P2F02', 'P2D03', 'P2B04', 'P2C04', 'P2G04', 'P2B05', 'P2C05', 'P2G05', 'P2C06', 'P2D06', 'P2E06', 'P2B07', 'P2F07', 'P2B08', 'P2D08', 'P2E08', 'P2G08', 'P2B09', 'P2F09', 'P2G09', 'P2B10', 'P2C10', 'P2G10', 'P2B11', 'P2C11', 'P2D11', 'P2E11', 'P2F11', 'P2G11', 'P3D02', 'P3E02', 'P3G02', 'P3C03', 'P3D03', 'P3F03', 'P3C04', 'P3C05', 'P3D05', 'P3F05', 'P3G05', 'P3G06', 'P3B07', 'P3C07', 'P3F07', 'P3B08', 'P3E08', 'P3D09', 'P3F09', 'P3G09', 'P3B10', 'P3C10', 'P3D10', 'P3G10', 'P3B11', 'P3C11', 'P3D11', 'P3E11', 'P3F11', 'P3G11'];
var well;
var file_num = 0;

var gens = [70, 1410, 2640, 5150, 7530, 10150];


//FUNCTION FOR BRING TO FRONT
//http://bl.ocks.org/eesur/4e0a69d57d3bfc8a82c2
// https://github.com/wbkd/d3-extended
d3.selection.prototype.moveToFront = function() {  
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


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

