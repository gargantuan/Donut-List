//-------------------------------------------------------------------------------

(function($){
	$.donut = function(el, options){
		// To avoid scope issues, use 'base' instead of 'this'
		// to reference this class from internal events and functions.
		var base = this;
		
		// Access to jQuery and DOM versions of element
		base.$el = $(el);
		base.el = el;
		
		// Add a reverse reference to the DOM object
		base.$el.data("donut", base);
		
		base.$el.addClass("donut-list");
		
		// Object to store key value pairs
		base.data = { };
	
		base.init = function(){
		
			base.options = $.extend({},$.donut.defaultOptions, options);
			// Put your initialization code here
            
            base.readDataFromList();
            base.calculatePercentages();
            base.addKey();
            
            
            base.prepareCanvas();
            base.drawSegments();
            
		};
		
		//-------------------------------------------------------------------------------
		
		base.readDataFromList = function(){
			
			base.$el.find("li").each(function(){
				
				var $li = $(this);
				
				var separator = ( $li.attr("data-key-value-separator") != undefined ) ? $li.attr("data-key-value-separator") : ":";
				var keyValueArr = $li.html().split( separator );
				var value = keyValueArr.pop();
				var label = keyValueArr[0];
				var key = keyValueArr[0].trim().split(" ").join("_").makeKeySafe();
				
				// this might help when people to do stuff on the fly
				$li.attr("data-donut-key", key);
				
				// Is there a custom key specified?
				key = ($li.attr("data-key") != undefined) ? $li.attr("data-key") : key; 
				
				base.data[ key ] = { value:parseFloat(value) , label:label , suffix:base.extractSuffix(value) };
			    base.data[ key ].li = $li;
			    base.data[ key ].separator = separator;
			    
			    // Used when animating
			    base.data[ key ].oldValue = 0; 
			    base.data[ key ].change = 0;
			    
			    if($li.attr("data-color") === undefined){
					base.data[ key ].color = "#"+("000"+(Math.random()*(1<<24)|0).toString(16)).substr(-6);    
			    }else{
				   base.data[key].color = $li.attr("data-color"); 
			    }
			    
			 
			    if(base.options.hideKey){
				    $li.hide();
			    }
			    			
			});
			
		}
		
		//-------------------------------------------------------------------------------
		// The data may or may not already be in percentages
		// Percentages are implied when the % character is in the suffix
		base.calculatePercentages = function(){
			
			// sum the values
			var sum = 0;
			for(var key in base.data){
				sum += base.data[ key ].value;
			}
			

			for(var key in base.data){			
				var item = base.data[key];
				
				if( item.suffix.indexOf("%") > -1 ){ 
					item.percentValue = item.value / 100; // values are already in percentages, convert to decimals
				}else{
					item.percentValue = item.value / sum; // values are raw, convert to percentagers
				}
			}
		}
		
		//-------------------------------------------------------------------------------
		
		base.addKey = function(){
			
			for(var key in base.data){
			
			 	var $li = base.data[key].li;
			    var $keySpan = $("<span class=\"donut-list-key-span\">");
			    $keySpan.css("background-color", base.data[key].color);
			    $keySpan.css("padding", "0 " + $li.height()/4);
			    
			    
			    if(base.options.keyPlacement == "before"){
			    	$keySpan.css("margin-right", parseFloat(base.options.keyMargin) + "px");
				    $li.prepend($keySpan);
			    }else{
			    	$keySpan.css("margin-left", parseFloat(base.options.keyMargin) + "px");
				 	$li.append($keySpan);   
			    }
			}
		}
		
		//-------------------------------------------------------------------------------
		
		base.prepareCanvas = function(){
			
			// Wrap the list in a div
            base.$container = base.$el.prepend("<div class=\"donut-container\">");
			
			// Set the dimensions of the container div
            base.$container.width(base.$el.width());
            base.$container.height(base.$el.width());
            
            base.size = base.$container.width();
            base.radius = (base.options.radius != undefined) ? base.options.radius - 1 : base.size / 2;
            base.innerRadius = (base.options.innerRadius != undefined ) ? base.options.innerRadius : base.size / 4.5;
            
            base.canvas = Raphael( base.$container[0] );
		}
		
		//-------------------------------------------------------------------------------
		
		base.extractSuffix = function(string){
			var arr = string.trim().split("");
			var suffixArr = new Array();
			for(var i in arr){
				// test for number
				if(isNaN(parseFloat( arr[i] )) && !isFinite( arr[i] )){
					suffixArr.push( arr[i] );
				}					
			}
			return suffixArr.join("");
		}
		
		
		//-------------------------------------------------------------------------------
		
		base.drawSegments = function(){
						
			base.canvas.clear();

			var lineWidth = 0;
			base.generateSegmentPaths();
			
			for(var key in base.data){
				
				var segment = base.canvas.path( base.data[key].path );
				segment.attr("stroke", base.data[key].color);
				segment.attr("fill", base.data[key].color)
				segment.attr("stroke-width", lineWidth);
				base.data[key].segment = segment;
				
			}
		
		}
		
		//-------------------------------------------------------------------------------
		
		base.generateSegmentPaths = function(){
			var startAngle = -90;
			var cx = base.size / 2;
			var cy = base.size / 2;
			var lineWidth = 2;
			var r = base.radius;
			
			for(var key in base.data){
				
				var startPoint = base.plotPointOnCircle(cx, cy, r, startAngle);
				var startPointInner = base.plotPointOnCircle(cx, cy, base.innerRadius, startAngle);
								
				var decimal = base.data[key].percentValue;
				var endAngle = 360 * decimal;
				

				var arcAngle = startAngle - startAngle ;	
				var endPoint = base.plotPointOnCircle(cx,cy,r, endAngle + startAngle);
				
				var endPointInner = base.plotPointOnCircle(cx,cy,base.innerRadius, endAngle + startAngle);
				
				
				// For some reason, checking the arcAngle against 180¼ causes a slight rendering 'glitch'
				var sweep = (endAngle >= 180) ? 1 : 0;
				
				var path = "M" + startPoint.x.toString() + ", " + startPoint.y.toString()  + "A" + r +", "+r + ", 1, " + sweep + ", 1,"	+ endPoint.x +", "+endPoint.y + "L" + endPointInner.x + " "+ endPointInner.y + "A" + base.innerRadius +", "+ base.innerRadius + ", 1	, " + sweep + ", 0,"	+ startPointInner.x +", "+startPointInner.y;
				
				// Store some useful data in the object
				base.data[key].path = path;
				base.data[key].midPoint = base.plotPointOnCircle(cx,cy,r + (lineWidth / 2), (endAngle/2) + startAngle);
				base.data[key].midPointAngle = (endAngle/2) + startAngle + 90;
							
				startAngle += endAngle;

				
			}
		}
		
		//-------------------------------------------------------------------------------
		
		base.plotPointOnCircle = function(cx, cy, r, a){
			var radian = Math.PI / 180;
			return { 
				x: cx + r * (Math.cos(a * radian)), 
				y: cy + r * (Math.sin(a * radian)) 
			}
			
		}
		
		//-------------------------------------------------------------------------------
		
		base.setValue = function(key, value){
			if( base.data[key] == undefined ) return 0;
			base.data[key].oldValue = base.data[key].value;
		
			// these are used when animating
			base.data[key].change = value - base.data[key].value;			
			base.data[key].time = 0;
		
			base.data[key].value = value;
			return 1;
		}
		
		
		//-------------------------------------------------------------------------------
		
		base.update = function(){
			console.log("Updating");
			base.calculatePercentages();
			base.drawSegments();
			
			for(var key in base.data){
				label = base.data[key].label;
				separator = base.data[key].separator;
				value = base.data[key].value;
				suffix = base.data[key].suffix;
				base.data[key].li.html(label + separator + " " +  value + suffix);
			}
		}
		
		//-------------------------------------------------------------------------------
		
		// Run initializer
		base.init();
		
		};
		
		$.donut.defaultOptions = {
		    hideList: false,
		    keyMargin: 7,
		    keyPlacement: "before"
		};
		
		$.fn.donut = function(options){
			
			var donuts = new DonutsContainer();
			this.each(function(){
				donuts.arr.push((new $.donut(this, options)));			
		  	});		  	
		  	return donuts;
		  	
		};
		
		
})(jQuery);

//-------------------------------------------------------------------------------
		
// this is what the plugin returns. You can access each individual donut by 
// calling the methods on this object. 
 
function DonutsContainer(){

	var dc = this;
	dc.arr = new Array();
	
	//-------------------------------------------------------------------------------
	
	this.setValueForKey = function( key, value ){
	 
		var success = 0;	
		for(var i = 0; i < dc.arr.length; i++){
			success += dc.arr[i].setValue(key, value);
		}
		
		// Provide some feedback if the key can not
		// be found in any of the donut lists.
		if(success == 0) dc.warn("'"+key+"' could not be found");
		
		return dc;
	}
	
	//-------------------------------------------------------------------------------
	
	this.update = function(){
		
		for(var i = 0; i < dc.arr.length; i++){
			dc.arr[i].update();
		}
		
		return dc;

	}
	
	//-------------------------------------------------------------------------------
	
	dc.warn = function(msg){ if(window.console&&window.console.warn){window.console.warn(msg);} }

};


// Utilities used by donutlist.js
//-------------------------------------------------------------------------------
// Some utitlites
String.prototype.makeKeySafe = function(){	
	return this.stripTags().removeHTMLEntities().trim().replace(/ /g, "_").replace(/__/g, "_").toLowerCase();
}

String.prototype.stripTags = function(){
	return this.replace(/<.*?>/g, "");
}

String.prototype.removeHTMLEntities = function(){	
	return this.replace(/&[^\s]*;/g, "");
}

