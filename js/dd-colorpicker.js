/* global console, d3 */
/* exported DDColorPicker*/
function DDColorPicker(elem, settings){
	'use strict';

	var nA = settings.data;

	var height = 400,
		width = 800,
		rows = 35,
		cols = nA.length / rows,
		margin = 10,
		rowHeight = (height-margin*2) / rows,
		colWidth = (width-margin*2) / cols;

	console.dir(settings.data);
	console.dir({
		height: height,
		width: width,
		rows: rows,
		cols: cols,
		rowHeight: rowHeight,
		colWidth: colWidth
	});

	var svg = d3.select(elem)
		.append("svg")
		.attr('width',width)
		.attr('height',height);
	var g = svg.append("g");
	
	// Update…
	var circle = g.selectAll("circle")
	    .data(nA)
	    .text(String);
	//g.attr("transform", "rotate(90 "  + ((width-margin*2) / 2 ) + " " + ((height-margin*2) / 2 ) + ") ")
	// Enter…
	circle.enter().append("rect")
	    .style("fill", function(data){return d3.rgb(data.rgb[0],data.rgb[1],data.rgb[2]);})
	    .attr("width", colWidth)
	    .attr("height", rowHeight)
	    .attr("x", function(d,index){return (Math.floor(index/rows) * colWidth) + margin; })
		.attr("y", function(d,index){return ( (index % rows) * rowHeight) + margin; })
		.attr("data-index",function(d,i){return i});

	// Exit…
	circle.exit().remove();


	console.dir(svg);
}