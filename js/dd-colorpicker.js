/* global d3 */
/* exported DDColorPicker*/
function DDColorPicker(method,value){
	'use strict';

	this.settings = {
		height: 400,
		width: 800,
		rows: 35,
		margin: 80,
		selectedPreviewRadius: 30, //radius of selected colors preview
		selectedColorColumn: 30, //percentage of view for selectedColors
		textSpace: 20, //vertical space required for text in selectedColors preview
		colorElement: 'circle'
	};

	this.selectedData = function(){
		return this.settings.data.filter(function(item){return item.selected; });
	};
	this.extend = function(dst, src){
		for (var attrname in src) { dst[attrname] = src[attrname]; }
	};

	this.enterRect = function(){
		this.rect.enter().append(this.settings.colorElement);
	};
	
	// From http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
	// returns a number in the rage of 0 (black) to 255 (White) and to set the foreground color based on the Brightness method
	this.colorBrightness = function(c){
		return Math.sqrt(
		      c[0] * c[0] * .241 + 
		      c[1] * c[1] * .691 + 
		      c[2] * c[2] * .068);
	};

	this.UpdateSelectedPreviews = function(){
		var $this = this;
		var selectedData = $this.selectedData();

		//in this section we create the selected elements preview
		var selectedPreview = $this.svg.selectAll('.selected-preview')
			.data(selectedData);

		//create
		selectedPreview
			.enter()
				.append('circle')
				.attr('class', 'selected-preview');

		//remove
		selectedPreview
			.exit()
			.remove();

		//update
		selectedPreview
			.transition()
			.attr('cx',$this.settings.selectedColorCenter)
			.attr('cy',function(d,i){
				return ((i*($this.settings.selectedPreviewRadius*2+$this.settings.textSpace)) + $this.settings.selectedPreviewRadius + $this.settings.textSpace + ($this.settings.previewRadius * 2) + $this.settings.margin) + "px";
			})
			.attr('r',$this.settings.selectedPreviewRadius+"px")
			.style('fill',function(d){
				return d3.rgb(d.rgb[0],d.rgb[1],d.rgb[2]);
			});
		
		selectedPreview.on('click',function(data){
			data.selected = false; //it's always true if this element is present
			$this.updateRect();

			if ($this.settings.onSelectedChanged !== undefined){
				$this.settings.onSelectedChanged(selectedData);
			}
		});
	};

	this.updateRect = function(){

		var shapeProp = {
			"ellipse" : { 
				xProp: "cx",
				yProp: "cy",
				xSize: "rx",
				ySize: "ry",
				sizeMultiplier: 2
			},
			"circle": { 
				xProp: "cx",
				yProp: "cy",
				xSize: "r",
				ySize: "",
				sizeMultiplier: 2
			},
			"rect" : { 
				xProp: "x",
				yProp: "y",
				xSize: "width",
				ySize: "height",
				sizeMultiplier: 1
			}
		};
		
		var $this = this;
		var shape = this.settings.colorElement;
		var trans = this.rect
			.transition();
		var maxSize = Math.min($this.settings.rowHeight,$this.settings.colWidth);
		trans
			.style("fill", function(data){return d3.rgb(data.rgb[0],data.rgb[1],data.rgb[2]);})
		    .attr(shapeProp[shape].xProp, function(d,index){return (Math.floor(index/$this.settings.rows) * $this.settings.colWidth) + $this.settings.margin; })
			.attr(shapeProp[shape].yProp, function(d,index){return ( (index % $this.settings.rows) * $this.settings.rowHeight) + $this.settings.margin; })
			.style('stroke-width',function(d){
				return (d.selected === undefined | d.selected === false) ? '0' : Math.max(maxSize,'2');
				//return (d.selected === undefined | d.selected === false) ? '0' : '1';
			})
			.style('stroke',function(d){
				var color = d3.rgb(d.rgb[0],d.rgb[1],d.rgb[2]);
				//return d3.rgb(4,4,4);
				return ($this.colorBrightness(d.rgb) > 127 ) ? color.darker(1) : color.brighter(1);
			})
			.attr(shapeProp[shape].xSize, function(d){return (shapeProp[shape].xSize == 'r' ? maxSize : d.settings.colWidth) / shapeProp[shape].sizeMultiplier;});
		if (shapeProp[shape].ySize !== ''){
			trans
				.attr(shapeProp[shape].ySize, function(d){return d.settings.rowHeight / shapeProp[shape].sizeMultiplier;});
		}

		$this.UpdateSelectedPreviews();
		
	};
		
	this.ResetGrid = function(){
		
		//we calculate the width of the selectedColors column
		this.settings.selectedColorColumnWidth = this.settings.width * ((this.settings.selectedColorColumn)/100)
		
		//we get the width of the palette subtracting selectedColor width
		this.settings.paletteWidth = this.settings.width - this.settings.selectedColorColumnWidth
		this.settings.cols = Math.ceil(this.settings.data.length / this.settings.rows);
		this.settings.rowHeight = (this.settings.height - this.settings.margin*2) / this.settings.rows;
		this.settings.colWidth = (this.settings.paletteWidth /*- this.settings.margin * 2*/) / this.settings.cols;

		//the center of selectedcolors is midway between the end of the palette and the end of the viewPort
		this.settings.selectedColorCenter = this.settings.paletteWidth +  this.settings.selectedColorColumnWidth / 2
		this.settings.previewRadius = this.settings.selectedColorColumnWidth * 0.15;
		this.svg.attr('width',this.settings.width)
			.attr('height',this.settings.height)
		
	};
	//constructor pattern from http://stackoverflow.com/questions/1114024/constructors-in-javascript-objects
	(function(that, settings){
		that.extend(that.settings, settings);
		
		that.svg = d3.select(that.settings.elem)
			.append("svg");
		
		that.ResetGrid();

		var nA = that.settings.data.map(function(x){
			x.settings = that.settings;
			return x;
		});

		var $ddColorPicker = that;

		
		that.g = that.svg.append("g");
		
		
		that.rect = that.g.selectAll(that.settings.colorElement)
			.data(nA);
		
		// Enter…
		that.enterRect();

		// Update..
		that.updateRect();

		// Exit…
		that.rect.exit().remove();
		
		that.rect.on('mouseover',function(){
			
			var data = d3.select(this).data();

			//Update the preview elements
			var colorPreview = $ddColorPicker.svg.selectAll('#color-preview')
				.data(data);
				

			//Create the preview element
			colorPreview
				.enter()
				.append('circle')
				.attr('id', 'color-preview')
				.attr('r',that.settings.previewRadius)
				.attr('cx', that.settings.selectedColorCenter)
				.attr('cy', that.settings.previewRadius + that.settings.margin)
			
			//Update the preview element
			colorPreview.data(data);

			colorPreview
				.transition()
				.style('fill', function(d){return d3.rgb(d.rgb[0],d.rgb[1],d.rgb[2]);});

			colorPreview.exit().remove();
			//Update the color name text
			var text = $ddColorPicker.svg.selectAll("#colorNameText")
				.data(data)
				.text(function(d){return d.fullname;});

				
			//Create the text element
			var textFontSize = 10;
			var textMargin = 5;
			text
				.enter()
				.append('text')
				.attr('id', "colorNameText")
				.attr('x',that.settings.selectedColorCenter)
				.attr('y',(that.settings.margin + that.settings.previewRadius*2 + textFontSize + textMargin)+"px")
				.attr("font-size", textFontSize + "px")
				.attr("fill",d3.rgb(255,255,255))
				.attr('text-anchor','middle');

			text.data(data);


			//Update the background
			var bgRect = $ddColorPicker.svg.selectAll('#colorSelected').data(data);

			//Create the background
			bgRect.enter()
				.insert('rect',':first-child')
				.attr('id','colorSelected')
				.attr('height',that.settings.height)
				.attr('width',that.settings.width)
				.attr('fill-opacity',0);

			//bgRect
			//	.transition()
			//	.style('fill',function(d){return d3.rgb(d.rgb[0],d.rgb[1],d.rgb[2]);});

			if ($ddColorPicker.settings.onHoverChanged !== undefined){
				$ddColorPicker.settings.onHoverChanged(data[0]);
			}
			
		});
		

		that.rect.on('click',function(d){
			
			var selectedData = $ddColorPicker.selectedData();

			if (selectedData.length > 4 && d.selected !== true)
				return;

			//toggle slected / unselected
			d.selected = d.selected === undefined ? true : !d.selected;
			// we need to update the value after insertion/removal
			selectedData = $ddColorPicker.selectedData();

			//update rectangles
			$ddColorPicker.updateRect();
			
			//avoid event to bubble up to other elements
			d3.event.stopPropagation();
			
			if ($ddColorPicker.settings.onSelectedChanged !== undefined){
				$ddColorPicker.settings.onSelectedChanged(selectedData);
			}

		});

		that.svg.on('click',function(){
			d3.event.stopPropagation();
		})
		
	}(this,method));

	

	this.setSetting = function(setting, value){
		this.settings[setting] = value;
		this.ResetGrid();
		var rect = this.g.selectAll(this.settings.colorElement);
		this.updateRect(rect);
	}

	this.setRows = function(value){
		this.setSetting('rows',value);
	}

	this.setHeight = function(value){
		this.setSetting('height',value);
	}

	this.setWidth = function(value){
		this.setSetting('width',value);
	}

	//execute called method
	
	if(typeof(method) === "string"){
	 this[method](value);
	}
}
