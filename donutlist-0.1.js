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
        
        // Object for storing key value pairs
        base.data = {};
        
        
        //-------------------------------------------------------------------------------

        base.init = function(){

            base.options = $.extend({},$.donut.defaultOptions, options);
            
            base.size = base.$el.width();
            base.radius = (base.options.radius != undefined) ? base.options.radius - 1 : base.size / 2;
            base.innerRadius = (base.options.innerRadius != undefined ) ? base.options.innerRadius : base.size / 4;

            // Put your initialization code here
            base.readDataFromList();
         	
         	// Generate a UID for this instance (see the utils file)
            base.uid = base.uid();
            base.id = "#" + base.uid;
            
            base.setupCanvasAndHideList();
            
            base.drawSegments();
                       	
           	return base;
           	
        };
		
		//-------------------------------------------------------------------------------
		
		base.readDataFromList = function(){
			
			base.$el.find("li").each(function(){
				
				var $li = $(this);
				
				// the number should always come first
				var contentAsArray = $li.html().split( " " );
				
				var data = contentAsArray.shift();
				var key = contentAsArray.join("_").makeKeySafe();
				var label = contentAsArray.join(" ");
				
				base.data[ key ] = { value:parseFloat(data) , label:label, color: $li.attr("data-color") }
				
				base.data[key].oldValue = 0;
			    base.data[key].change = 0;

			
			});
			
		}
		
		base.listKeys = function(){
			
			for(var key in base.data){
				//console.log(key);
			}
		
		}
		
		//-------------------------------------------------------------------------------
		
		base.setupCanvasAndHideList = function(){
			
			// Wrap the list in a div
            base.$el.prepend("<div id=\""+base.uid+"\"class=\"donut-container\">");
            base.$container = $(base.id);
			
			// Set the dimensions of the container div
            base.$container.width(base.size);
            base.$container.height(base.size);
            
            // Hide the list
           // base.$el.hide();
            
            base.canvas = Raphael( document.getElementById( base.id.substr(1) ) );
			
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
								
				var decimal = base.data[key].value / 100;
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
		
		// b = beginning value
		// c = change
		// d = duration in seconds
		// function cubicEaseOut(t, b, c, d){
		// 		return c * (Math.pow (t/d-1, 3) + 1) + b;
		// }
		
		//-------------------------------------------------------------------------------
		
		
		base.updateValue = function(key, value){
			base.data[key].oldValue = base.data[key].value;
			base.data[key].change = value - base.data[key].value;			
			base.data[key].time = 0;
		}
		
		
		base.animate = function(){
			base.canvas.clear();
			// One way to make this less CPU intensive in IE8 and lower is
			// to reduce the duraction of the animations. But it feels more
			// clunky. 
			var d = ( $(".lt-ie9").length ) ? 10 : 300;
			//var d = 300;
			var valuesStillAnimating = 0;
			
			for(var key in base.data){
				
				var target = base.data[key];
				target.time += 1;
				var t = target.time;
				var c = target.change;
				var b = target.oldValue;
				
				if(target.time < d){
					valuesStillAnimating += 1;
					target.value = c * (Math.pow(t/d-1, 3) + 1) + b;
				}
			
			}
			
			base.drawSegments();
			
			if( valuesStillAnimating > 0 ){
				setTimeout(base.animate, 10);
			}else{
			
				for(var key in base.data){
					base.drawLabels();
				}
				
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
		
		
		base.drawLabels = function(){

			
			
			for(var key in base.data){
				var obj =  base.data[key];
			
				if(obj.value < 3 && obj.value > 0){ base.addLabelLines(obj); }
				
				
			}
		
		}
		
		//-------------------------------------------------------------------------------
		
		base.addLabelLines = function(obj){
			
			// removed
			
		}
		
		//-------------------------------------------------------------------------------
		
		base.uid = function(){
			var id = Math.random().toString(36).substr(2,9);
			"dl-"+id;
		}
		
        // Run initializer
        return base.init();
        
    };

    $.donut.defaultOptions = {
    	radius: undefined,
    	innerRadius: 100
    };

    $.fn.donut = function(options){
        return this.each(function(){
            
            return (new $.donut(this, options));
   
        });
    };

})(jQuery);

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
