function barChart(){

	if(!barChart.id) barChart.id = 0;

	var margin = {top: 10, bottom: 20, left: 10, right: 10}, // default margin
		width = 960, // default width
		height = 150; // default height

	var dataframe;

	var xScale = d3.scale.ordinal().rangeRoundBands([0,500],.1), // need to set the domain of x
		yScale = d3.scale.linear();

	var xAxis = d3.svg.axis().orient("bottom"),
		brush = d3.svg.brush().x(xScale);

	var brushDirty,
		id = barChart.id++;

	function chart(div){

			yScale.range([(height - margin.top - margin.bottom), 0]);
			//console.log(d3.max(dataframe.comments));
			yScale.domain([0,200]);
			xScale.domain(dataframe.map(function(d) { return d.primary_key;} ));
			xAxis.scale(xScale).tickSubdivide(true).tickPadding(1);	      

		div.each(function(){
			var w = width;
			var h = height;

			var div = d3.select(this),
				g = div.select("g");
			
			//Create the skeletal chart.
			if(g.empty()) {
				div.select(".title").append("a")
					.attr("href","javascript:reset(" + id + ")")
					.attr("class", "reset")
					.text("reset")
					.style("display", "none");

				g = div.append("svg")
						.attr("width", w + margin.left + margin.right)
						.attr("height",	h + margin.top + margin.bottom)
					.append("g")
						.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				g.append("clipPath")
					.attr("id", "clip-" + id)
				.append("rect")
					.attr("width", w)
					.attr("height", h);

				g.selectAll(".bar")
					.data(["background", "foreground"])
				 .enter().append("path")
				 	.attr("class",function(d) { return d + " bar"; })
				 	.datum(dataframe); // <- do not understand here. 

				g.selectAll(".foreground.bar")
					.attr("clip-path", "url(#clip-" + id + ")");

				g.append("g")
					.attr("class", "axis")
					.attr("transform","translate(0," + h + ")")
					.call(xAxis);

				
				// Initialize the brush component with pretty resize handles.
				var gBrush = g.append("g").attr("class", "brush").call(brush);
				gBrush.selectAll("rect").attr("height", h);//.attr("width",w);
				//gBrush.selectAll(".resize").append("path").attr("d", resizePath);
			}

			// Only redraw the brush if set externally
			if(brushDirty){
				console.log("brush is Dirty");
				brushDirty = false;
				g.selectAll(".brush").call(brush);
				div.select(".title a").style("display", brush.empty() ? "none" : null);
				if(brush.empty()) {
					g.selectAll("#clip-" + id + " rect")
						.attr("x",0)
						.attr("width", width);
				} else {
					var extent = brush.extent();
					g.selectAll("#clip-" + id + " rect")
						.attr("x", xScale(extent[0]))
						.attr("width", xScale(extent[1]) - xScale(extent[0]));
				}
			}
			g.selectAll(".bar").attr("d", barPath);
		});
		
		function barPath()
		{
			// bar draw function here. ref the crossfilter code. 
			var path = [],
            	i = -1,
            	n = dataframe.length,
            	d;
        
        	while (++i < n) {
          		d = dataframe[i];
          		//console.log(d.comments);
          		path.push("M", xScale(d.primary_key), ",", height, "V", yScale(d.comments), "h4V", height); //h9 : bar width
          		//path.push("M",xpos in x,",",chart height,"V",ypos in y,"h'width'V",height)
          		// y is calculated by (height-ypos)
        	}

        	return path.join("");
		}

		function resizePath(d) {
			console.log("resizePath :");
			var e = +(d == "e"),
				x = e ? 1 : -1,
				y = height / 3;

			return "M" + (.5 * x) + "," + y
				+ "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y +6)
				+ "V" + (2 * y -6)
				+ "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
				+ "Z"
				+ "M" + (2.5 * x) + "," + (y + 8)
				+ "V" + (2 * y - 8)
				+ "M" + (4.5 * x) + "," + (y + 8)
				+ "V" + (2 * y - 8);
		}

		brush.on("brushstart.chart", function() {
			console.log("brushstart");
			var div = d3.select(this.parentNode.parentNode.parentNode);
			div.select(".title a").style("display",null);
		});
		
		brush.on("brush.chart", function() {
			console.log("brush...");
			var g = d3.select(this.parentNode),
				extent = brush.extent();
			if(round) g.select(".brush")
					.call(brush.extent(extent = extent.map(round)))
				.selectAll(".resize")
					.style("display",null);
			g.select("#clip-" + id + " rect")
				.attr("x", xScale(extent[0]))
				.attr("width", xScale(extent[1]) - xScale(extent[0]));
				// dimension.filterRange(extent);
		});

		brush.on("brushend.chart", function() {
			console.log("brushend");
			if(brush.empty()) {
				var div = d3.select(this.parentNode.parentNode.parentNode);
				div.select(".title a").style("display","none");
				div.select("#clip-" + id + " rect").attr("x",null).attr("width","100%");
				//dimension.filterALL();
			}
		});
	}

	chart.width = function(_){
		if(!arguments.length) return width; // chart.width의 인자로 아무것도 안들어왔을 경우는, default width를 return
		width = _;
		return chart;
	};

	chart.height = function(_){
		if(!arguments.length) return height; 
		height = _;
		return chart;
	};

	chart.xScale= function(_){
		if(!arguments.length) return xScale;
		xScale = _;
		xAxis.scale(xScale);
		return chart;
	};

	chart.yScale = function(_){
		if(!arguments.length) return yScale;
		yScale = _;
		return chart;
	};

	chart.dataframe = function(_){
		if(!arguments.length) return dataframe;
		dataframe = _;
		return chart;
	};
	
	return d3.rebind(chart, brush, "on"); 
}