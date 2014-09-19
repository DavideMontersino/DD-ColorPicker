/* global d3 */
/* exported DDColorPicker*/
function DDColorPicker(method,value){
	'use strict';

	this.settings = {
		height: 420,
		width: 820,
		rows: 35,
		margin: 20,
	};

	this.extend = function(dst, src){
		for (var attrname in src) { dst[attrname] = src[attrname]; }
	};

	this.enterRect = function(rect){
		rect.enter().append("rect")
		    ;
	};

	this.updateRect = function(rectangle){
		var $this = this;
		rectangle
			.style("fill", function(data){return d3.rgb(data.rgb[0],data.rgb[1],data.rgb[2]);})
		    .attr("x", function(d,index){return (Math.floor(index/$this.settings.rows) * $this.settings.colWidth) + $this.settings.margin; })
			.attr("y", function(d,index){return ( (index % $this.settings.rows) * $this.settings.rowHeight) + $this.settings.margin; })
			.style('stroke-width',function(d){return (d.selected === undefined | d.selected === false) ? '0' : '1';})
			.style('stroke',d3.rgb(0,0,0))
			.attr("width", this.settings.colWidth)
		    .attr("height", this.settings.rowHeight);	
	};
		
	this.ResetGrid = function(){

		this.settings.cols = Math.ceil(this.settings.data.length / this.settings.rows);
		this.settings.rowHeight = (this.settings.height - this.settings.margin*2) / this.settings.rows;
		this.settings.colWidth = (this.settings.width - this.settings.margin * 2) / this.settings.cols;
		console.log('setting up a grid of ' + this.settings.rows + ' rows and ' + this.settings.cols + ' cols');
		console.dir(this.settings);
	};
	//constructor pattern from http://stackoverflow.com/questions/1114024/constructors-in-javascript-objects
	(function(that, settings){
		that.extend(that.settings, settings);
		that.ResetGrid();

		var nA = that.settings.data;

		var $ddColorPicker = that;

		that.svg = d3.select(that.settings.elem)
			.append("svg")
			.attr('width',that.settings.width)
			.attr('height',that.settings.height);
		
		that.g = that.svg.append("g");
		
		
		var rect = that.g.selectAll("rect")
			.data(nA);
		
		// Enter…
		that.enterRect(rect);

		// Update..
		that.updateRect(rect);

		// Exit…
		rect.exit().remove();
		
		rect.on('mouseover',function(){
			
			var data = d3.select(this).data();

			//Update the color name text
			var text = $ddColorPicker.svg.selectAll("#colorNameText")
				.data(data)
				.text(function(d){return d.fullname;})
				.attr('fill',function(d){return d.Lab[0] > 50 ? d3.rgb(4,4,4) : d3.rgb(251,251,251);});

			//Create the text element
			text
				.enter()
				.append('text')
				.attr('id', "colorNameText")
				.attr('x',that.settings.width - that.settings.margin)
				.attr('y',15)
				.attr("font-size", "10px")
				.attr('text-anchor','end');

			//Update the background
			var div = $ddColorPicker.svg.selectAll('#colorSelected').data(data);

			//Create the background
			div.enter()
				.insert('rect',':first-child')
				.attr('id','colorSelected')
				.attr('height',that.settings.height)
				.attr('width',that.settings.width);

			div
				.transition()
				.style('fill',function(d){return d3.rgb(d.rgb[0],d.rgb[1],d.rgb[2]);});

			if ($ddColorPicker.settings.onHoverChanged !== undefined){
				$ddColorPicker.settings.onHoverChanged(data[0]);
			}
			
		});
		

		rect.on('click',function(d){
			
			d.selected = d.selected === undefined ? true : !d.selected;
			$ddColorPicker.updateRect(rect);
			d3.event.stopPropagation();
			if ($ddColorPicker.settings.onSelectedChanged !== undefined){
				$ddColorPicker.settings.onSelectedChanged($ddColorPicker.selectedData());
			}
		});

		that.svg.on('click',function(){
			d3.event.stopPropagation();
		})
		
	}(this,method));

	this.selectedData = function(){
		return this.settings.data.filter(function(item){return item.selected; });
	};

	this.setRows = function(value){
		console.log('inside setRows');
		this.settings.rows = value;
		console.log('133 setRows');
		this.ResetGrid();
		console.log('135 setRows');
		var rect = this.g.selectAll("rect");
		console.log('137 setRows');
		//this.enterRect(rect);
		console.log('139 setRows');
		this.updateRect(rect);
	}
	//execute calles method
	
	if(typeof(method) === "string"){
	 this[method](value);
	}
}
