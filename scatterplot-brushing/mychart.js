
function myChart() {
	if(!myChart.id) myChart.id = 0;

	var margin = {top: 10, right: 20, bottom: 20, left: 20},
		id = myChart.id++,
		w = 700,
		h = 150,
		xScale,
		yScale = d3.scale.linear().range([h , 0]),
		xAxis = d3.svg.axis().orient("bottom"),
		brush = d3.svg.brush(), brushDirty;
	
	var datum;

	function chart(selection) {

		yScale.domain([0, Math.log(d3.max(datum, function(d){ return d[0]; }))+.1]);

		selection.each(function() {
			var div = d3.select(this)
			g = div.select("g");

			// Create the skeletal chart.
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

				g.append("g")
					.attr("class", "axis")
					.attr("transform","translate(0," + h + ")")
					.call(xAxis);

				// draw bar here
				var bars = g.selectAll(".bar").data(datum)
						.enter().append("rect")
						.attr("class","bar")
						.attr("x", function(d) { return xScale(d[1]); })
						.attr("width", 4)
						.attr("y", function(d) {return yScale(Math.log(d[0]+.1)); })
						.attr("height", function(d) { return h - yScale(Math.log(d[0]+.11)); });

				// Initialize the brush component with pretty resize handles.
				var gBrush = g.append("g").attr("class", "brush").call(brush);
				gBrush.selectAll("rect").attr("height", h);//.attr("width",w);
			}

			// Only redraw the brush if set externally
			if(brushDirty){
				console.log("brush is Dirty");
				brushDirty = false;
				g.selectAll(".brush").call(brush);
				div.select(".title a").style("display", brush.empty() ? "none" : null);
				if(brush.empty()) {
					console.log("brush is empty");
					d3.select(this.parentNode).selectAll(".bar").classed("selected",false);
					g.selectAll("#clip-" + id + " rect")
						.attr("x",0)
						.attr("width", w);
				} else {
					console.log("brush isn't empty");
					var extent = brush.extent();
					g.selectAll("#clip-" + id + " rect")
						.attr("x", xScale(extent[0]))
						.attr("width", xScale(extent[1]) - xScale(extent[0]));
				}
			}
														
			//g.selectAll(".bar").attr("d", barPath);
			
		});


		// deprecated.
		function barPath() {
			// bar draw function here. ref.: the crossfilter code. 
			var path = [],
            	i = -1,
            	n = datum.length,
            	d;        
        	while (++i < n) {
          		d = datum[i];
          		//console.log(xScale(0));
          		path.push("M", xScale(d[1]), ",", h, "V", yScale(Math.log(d[0])), "h4V", h); //h9 : bar width								
        	}
        	return path.join("");
		}

		// deprecated.
		function resizePath(d) {
			console.log("resizePath :");
			var e = +(d == "e"),
				x = e ? 1 : -1,
				y = h / 3;

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

		////////////////////////
		// Brush event setting.
		////////////////////////
		
		brush.on("brushstart.chart", function() {

			console.log("brushstart");
			var div = d3.select(this.parentNode.parentNode.parentNode);
			div.select(".title a").style("display",null);

		}); // brushstart END
		
		brush.on("brush", function(p) {
			console.log("brush...");			// [DEBUG]
			
			var g = d3.select(this.parentNode),
				extent = brush.extent(),
				range = func2(extent),
				selected = [],
				ids = [0,1,2,3];

			var container = d3.select(this.parentNode.parentNode.parentNode.parentNode);

			g.selectAll(".bar").classed("selected",function(d,i) {
					
					if( i>= range[0] && i <= range[1]) {
						selected.push(d[1]);
						return true;
					}
				});

			ids.forEach(function(i){
				//console.log(i+"/"+id);   // [DEBUG]
				if(i !== id) {
					container.select("#chart"+(i+1)).selectAll(".bar")
					.classed("selected",function(d,i){
						if(selected.indexOf(d[1]) !== -1)
							return true;
					}); //if END
				} 	// if END
			}); // forEach END

		}); // brush END

		brush.on("brushend", function() {
			console.log("brushend");
			console.log(brushDirty);			// [DEBUG]
			//console.log(brush.extent());		// [DEBUG]
			//console.log(func2(brush.extent()));	// [DEBUG]
			if(brush.empty()) {
				var div = d3.select(this.parentNode.parentNode.parentNode);
				div.select(".title a").style("display","none");
				div.select("#clip-" + id + " rect").attr("x",null).attr("width","100%");
				//dimension.filterALL();
			}
		}); // brushend END


		// Should be modified... the algorithm is imperfect.
		function func2(d) {
			var lo = d[0],
				hi = d[1];

			var start, end;

			function rangeCal(val,hicut) {
				//var intVal = Math.floor(val/10);
				var point = val%10;
				var locut = Math.floor;

				if((point >= 0 && point < 4)) {
					return locut(val/10);
				} else {
					return hicut(val/10);
				}
			}
			start = rangeCal(lo,Math.ceil);
			end = rangeCal(hi,Math.floor);
			
			
			return [start,end];
		};
	}

	chart.margin = function(_) {
		if(!arguments.length) return margin;
		margin = _;
		return chart;
	};

	chart.width = function(_) {
		if(!arguments.length) return width;
		width = _;
		return chart;
	};

	chart.height = function(_) {
		if(!arguments.length) return height;
		height = _;
		return chart;
	};

	chart.xScale = function(_) {
		
		if(!arguments.length) return xScale;
		xScale = _;
		xAxis.scale(xScale);
		brush.x(xScale);
		return chart;
	};

	chart.yScale = function(_) {
		if(!arguments.length) return yScale;
		yScale = _;
		return chart;
	};

	chart.datum = function(_) {
		if(!arguments.length) return datum;
		datum = _;

		return chart;
	};

	chart.filter = function(_) {
      if (_) {
        brush.extent(_);
      } else {
        brush.clear();
      }
      brushDirty = true;
      return chart;
    };


	return d3.rebind(chart, brush, "on"); 
}