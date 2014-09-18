/* global console, d3 */
/* exported DDColorPicker*/
function DDColorPicker(elem, settings){
	'use strict';

	var nA = settings.data;

	var height = 420,
		width = 820,
		rows = 35,
		cols = nA.length / rows,
		margin = 20,
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
	
	
	var rect = g.selectAll("rect")
		.data(nA);
	
	// Enter…
	rect.enter().append("rect")
	    .attr("width", colWidth)
	    .attr("height", rowHeight);
		

	// Update..
	var updateRect = function(rectangle){
		rectangle
		.style("fill", function(data){return d3.rgb(data.rgb[0],data.rgb[1],data.rgb[2]);})
	    .attr("x", function(d,index){return (Math.floor(index/rows) * colWidth) + margin; })
		.attr("y", function(d,index){return ( (index % rows) * rowHeight) + margin; })
		.style('stroke-width',function(d){return (d.selected === undefined | d.selected === false) ? '0' : '1'})
		.style('stroke',d3.rgb(0,0,0));	
	}
	
	updateRect(rect);

	// Exit…
	rect.exit().remove();
	
	rect.on('mouseover',function(){
		
		var data = d3.select(this).data();

		console.dir(data);

		//Update the color name text
		var text = svg.selectAll("#colorNameText")
			.data(data)
			.text(function(d){return d.fullname})
			.attr('fill',function(d){return d.Lab[0] > 50 ? d3.rgb(4,4,4) : d3.rgb(251,251,251)});

		//Create the text element
		text
			.enter()
			.append('text')
			.attr('id', "colorNameText")
			.attr('x',width - margin)
			.attr('y',15)
			.attr("font-size", "10px")
			.attr('text-anchor','end');

		//Update the background
		var div = svg.selectAll('#colorSelected')
			.data(data)
			.style('fill',function(d){return d3.rgb(d.rgb[0],d.rgb[1],d.rgb[2]);})
			.html(function(d){return d.fullname});
		
		//Create the background
		div.enter()
			.insert('rect',':first-child')
			.attr('id','colorSelected')
			.attr('height',height)
			.attr('width',width)
	});

	rect.on('click',function(d,i){
		var $this = d3.select(this);
		
		d.selected = d.selected === undefined ? true : !d.selected;
		updateRect(rect);

	});
	


	console.dir(svg);
}