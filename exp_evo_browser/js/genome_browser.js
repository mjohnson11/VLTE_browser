var codon_lookup = {
  'GCA': 'A','GCC': 'A', 'GCG': 'A','GCT': 'A',
  'TGC': 'C','TGT': 'C',
  'GAC': 'D','GAT': 'D',
  'GAA': 'E','GAG': 'E',
  'TTC': 'F','TTT': 'F',
  'GGA': 'G','GGC': 'G','GGG': 'G','GGT': 'G',
  'CAC': 'H','CAT': 'H',
  'ATA': 'I','ATC': 'I','ATT': 'I',
  'AAA': 'K','AAG': 'K',
  'CTA': 'L','CTC': 'L','CTG': 'L','CTT': 'L','TTA': 'L','TTG': 'L',
  'ATG': 'M',
  'AAC': 'N','AAT': 'N',
  'CCA': 'P','CCC': 'P','CCG': 'P','CCT': 'P',
  'CAA': 'Q','CAG': 'Q',
  'AGA': 'R','AGG': 'R','CGA': 'R','CGC': 'R','CGG': 'R','CGT': 'R',
  'AGC': 'S','AGT': 'S','TCA': 'S','TCC': 'S','TCG': 'S','TCT': 'S',
  'ACA': 'T','ACC': 'T','ACG': 'T','ACT': 'T',
  'GTA': 'V','GTC': 'V','GTG': 'V','GTT': 'V',
  'TGG': 'W',
  'TAC': 'Y','TAT': 'Y',
  'TAA': '*', 'TAG': '*', 'TGA': '*',
}

var gff_dat;
var gene_map = {};
var chromo_seqs = {};
var wide_range = 5000;
var short_range = 60;
var text_thresh = 50;

function translate(entry) {
  rt = {'A': 'T', 'C': 'G', 'G': 'C', 'T': 'A'};
  let seq;
  if (entry['strand']=='+') {
    seq = chromo_seqs[entry['seqname']].slice(parseInt(entry['start']), parseInt(entry['end'])+1);
  } else {
    seq = chromo_seqs[entry['seqname']].slice(parseInt(entry['start']), parseInt(entry['end'])+1).split("").reverse().map(c => rt[c]).join("");
  }
  let aas = []
  for (let i=0; i<seq.length; i+=3) {
    aas.push(codon_lookup[seq.slice(i, i+3)]);
  }
  if (entry['strand']=='+') {
    return '-'+aas.join('--')+'-';
  } else {
    return '-'+aas.reverse().join('--')+'-';
  }
}

function show_region(chromo, loc, well, gen_fixer) {
  let use_rows = [];
  for (let entry of gene_map[chromo]) {
    if (parseInt(entry['end']) > (loc-wide_range) && parseInt(entry['start']) < (loc+wide_range)) {
      use_rows.push(entry);
    } 
  }
  
  var gsvg = d3.select("#genome_browser").attr("width", 1100).attr("height", 50);
  gsvg.selectAll('.gene_block').remove();
  gsvg.selectAll('.gene_name').remove();
  gsvg.selectAll('#wide_genome_axis').remove();

  let wide_scale = d3.scaleLinear().range([50, 1050]).domain([loc-wide_range, loc+wide_range]);
  gsvg.append("g")
      .attr("class", "axis")
      .attr("id", "wide_genome_axis")
      .attr("transform", "translate(0, 30)")
      .call(d3.axisBottom(wide_scale));
  for (let d of use_rows) {
    gsvg.append('text').text(d['display_name']);
  }
  gsvg.selectAll('.gene_block')
    .data(use_rows)
      .enter()
      .append('rect')
        .attr('class', 'gene_block')
        .attr('id', function(d) { return 'block_'+String(d['display_name']); })
        .attr('x', d=> wide_scale(parseInt(d['start'])))
        .attr('width', d=> wide_scale(parseInt(d['end']))-wide_scale(parseInt(d['start'])))
        .attr('y', 5)
        .attr('height', 20)
        .append('title').html(function(d) { return String(d['display_name']); });
  
  gsvg.append('rect')
    .attr('class', 'gene_block')
    .attr('id', 'highlight')
    .attr('x', wide_scale(loc-short_range))
    .attr('width', wide_scale(loc+short_range)-wide_scale(loc-short_range))
    .attr('y', 2)
    .attr('height', 27)
    .style('stroke', 'none')
    .style('fill', 'red')
    .style('opacity', 0.6);

  gsvg.selectAll('.gene_name')
    .data(use_rows)
      .enter()
      .append('text')
        .attr('class', 'gene_name')
        .attr('id', function(d) { return String(d['display_name']); })
        .attr('text-anchor', 'middle')
        .attr('x', function(d) { return wide_scale((parseInt(d['start'])+parseInt(d['end']))/2); })
        .attr('y', 20)
        .text(function(d) { 
          if (text_thresh<(wide_scale(parseInt(d['end']))-wide_scale(parseInt(d['start'])))) {
            return String(d['display_name']); 
          } else {
            return "";
          }
        })

  let galign = d3.select("#alignment_area")
  d3.selectAll('.alignment').remove();
  for (let entry of use_rows) {
    if ((entry['end'] > (loc-short_range)) && (entry['start'] < (loc+short_range))) {
      let aa_seq = translate(entry);
      let seq_in_place = place_alignment(loc, aa_seq, parseInt(entry['start']));
      galign.append('p')
        .attr('class', 'alignment')
        .html(seq_in_place);
    }
  }
  let base_seq = chromo_seqs[chromo].slice(loc-short_range, loc+short_range);
  galign.append('p')
    .attr('class', 'alignment')
    .attr('id', 'genome_seq')
    .html(base_seq);
  
  d3.selectAll('.gen_button').remove();
  d3.select('#genome_gen_buttons').selectAll('.gen_button')
    .data(sgens)
    .enter()
    .append('div')
      .attr('class', 'gen_button')
      .html(function(d) { 
        return String(gen_fixer[d][well.slice(0,2)]); })
      .on('click', function(d) { alignments_for_gen(galign, chromo, loc, base_seq, d); });
  alignments_for_gen(galign, chromo, loc, base_seq, 70);
}

function alignments_for_gen(galign, chromo, loc, base_seq, g) {
  d3.selectAll('.gen_button')
    .attr('class', d => (d == g) ? 'gen_button gb_highlighted' : 'gen_button')
  read_alignments(galign, current_platewell, chromo, loc, String(g), base_seq);
}

function place_alignment(loc, seq, start) {
  if (start<=loc-short_range) {
    return seq.slice(loc-short_range-start, loc+short_range-start);
  } else {
    return "_".repeat(start-(loc-short_range)) + seq.slice(0, loc+short_range-start);
  }
}

function process_alignment(a, bs) {
  let formatted_alignment = "";
  let ai = 0
  for (let i=0; i<bs.length; i++) {
    if (ai >= a.length) {
      return formatted_alignment;
    } else {
      if (a[ai] == '(') { //insertion
        let tmp = a.slice(ai+1, a.length);
        let insertion = tmp.slice(0, tmp.indexOf(')')) + tmp[tmp.indexOf(')')+1]
        formatted_alignment += '<em class="alignment_insertion" title="' + insertion + '">^</em>'
        ai += insertion.length+2
      } else {
        if (a[ai]==bs[i]) {
          formatted_alignment += '|';
        } else {
          formatted_alignment += a[ai];
        }
        ai += 1
      }
    }
  }
  return formatted_alignment;
}

function read_alignments(galign, well, chromo, loc, gen, base_seq) {
  d3.selectAll('.read_alignment').remove();
  d3.tsv("/exp_evo_browser/evidence_sams/"+well+'_'+chromo+'_sam.tsv')
    .then(function(align_in) {
        for (let row of align_in) {
          if (row["Gen"]==gen) {
            let left = parseInt(row['POS'])-1;
            let right = left + row['Aligned'].length;
            if ((right > (loc-short_range)) && (left < (loc+short_range))) {
              galign.append('p')
                .attr('class', 'alignment read_alignment')
                .html(process_alignment(place_alignment(loc, row['Aligned'], left), base_seq));
            }
          }
        }
    })
    .catch(function(error) {
      console.log(error);  
  });
}

function setup_gbrowse() {
  // splitting the data into a dict for each chromosome
  for (let entry of gff_dat) {
    if (entry['seqname'] in gene_map) {
      gene_map[entry['seqname']].push(entry);
    } else {
      gene_map[entry['seqname']] = [entry];
    }
  }
}

function read_gff() {
  d3.tsv("/exp_evo_browser/w303_vlte_gff_simplified.tsv")
    .then(function(data_in) {
      gff_dat = data_in;
      d3.text("w303_vlte.fasta")
        .then(function(fasta_in) {
          for (let s of fasta_in.split('>')) {
            if (s.length > 0) {
              lines = s.split('\n');
              chromo_seqs[lines[0]] = lines.slice(1, lines.length).join("");
            }
          }
          setup_gbrowse();
        })
        .catch(function(error) {
            console.log('fasta reader error', error);  
        });
    })
    .catch(function(error) {
      console.log(error);  
  });
}
