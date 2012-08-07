
#donutlist.js
v 0.2

----

Donutlist.js takes an unordered list and turns it into a donut chart, which is like a pie chart but with a hole in the middle. They seem to be in vouge at the moment. 


##Basic Example
	// Create a list
	
	<ul>
		<li>UK: 60%</li>
		<li>USA: 20%</li>
		<li>China: 20%</li>
	</ul>
	
	<!-- List items must have the following format: <li>[label][spearator][value][suffix (optional)]</li> -->
	
	// Javascript
	
	$("ul").donut();
	
##Dependancies
- jQuery
- Raphael.js
	
##Plugin Options
	// Defaults
	$(ul).donut({
		hideList: false,
		keyPlacement: before
	});
	
- __hideList__: if true, the list items are hidden.  
- __keyPlacement__: before or after the list item text. Useful if right aligning text.

##List Attributes
It is possible to control some aspects of the donut chart such as colors and key/value separators using the HTML5 _data_ attribute.

###Colors
By default, _donutlist.js_ will generate random colors for each list item. However, you'll probably want to specify your own colors.
 
	<ul>
		<li data-color="#000">Example A: 50%</li> <!-- this item will be black -->
		<li data-color="#F00">Example B: 50%</li> <!-- this item will be red   -->
	</ul>
	
###Key/Value Separators
By default, _donutlist.js_ assumes keys and values are seperated by a colon. It is possible to specify your own key value separator per list item.

	<ul>
		<li data-key-value-separator="=">Example A = 50%</li> <!-- this item will be black -->
		<li data-key-value-separator="/">Example B / 50%</li> <!-- this item will be red   -->
	</ul>

##CSS
It is possible control over the appearance via CSS. _Donutlist.js_ adds the _.donut-list_ class to the UL itself and then prepends one div to the UL element with the _.donut-container_ class. In addition, a span is prepended to each list item with the _.donut-list-key-span_ class.

- ul.donut-list
- ul > div.donut-container
- ul > li > span.donut-list-key-span

##Detecting Percentages
It is possible to provide _donutlist.js_  raw values (eg: 150mm, 200mm) or precaulculated percentages (eg: 10%, 90%). _donutlist.js_ will look for the '%' character in you value suffix and respond accordingly.

##Browser Compatibility
At present, donutlist.js has been tested in the latest versions of Safari, Chrome and Firefox. It has not tested in IE yet. 



##Todo List  

- Documentation
- IE Testing
- Refine the String.makeKeySafe method. It's not very robust. 
- Pattern fills
- Possibly remove dependency on Raphael.js
- Options for padding, margins and inner radius
- Add and remove items on the fly
- Change values on the fly
- Animation when changing values or adding/removing items
- Animation and easing options (eg: ease-in-out, elastic)

__This is version 0.2 of donutlist.js. I welcome any help, suggestions and/or reccomendations on the road the v1.__

	 