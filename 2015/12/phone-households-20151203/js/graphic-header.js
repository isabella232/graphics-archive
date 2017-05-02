var COLORS={'red1':'#6C2315','red2':'#A23520','red3':'#D8472B','red4':'#E27560','red5':'#ECA395','red6':'#F5D1CA','orange1':'#714616','orange2':'#AA6A21','orange3':'#E38D2C','orange4':'#EAAA61','orange5':'#F1C696','orange6':'#F8E2CA','yellow1':'#77631B','yellow2':'#B39429','yellow3':'#EFC637','yellow4':'#F3D469','yellow5':'#F7E39B','yellow6':'#FBF1CD','teal1':'#0B403F','teal2':'#11605E','teal3':'#17807E','teal4':'#51A09E','teal5':'#8BC0BF','teal6':'#C5DFDF','blue1':'#28556F','blue2':'#3D7FA6','blue3':'#51AADE','blue4':'#7DBFE6','blue5':'#A8D5EF','blue6':'#D3EAF7'};var classify=function(str){return str.toLowerCase().replace(/\s+/g,'-').replace(/[^\w\-]+/g,'').replace(/\-\-+/g,'-').replace(/^-+/,'').replace(/-+$/,'');};var formatStyle=function(props){var s='';for(var key in props)s+=key+': '+props[key].toString()+'; ';return s;};var makeTranslate=function(x,y){var transform=d3.transform();transform.translate[0]=x;transform.translate[1]=y;return transform.toString();};var getParameterByName=function(name){name=name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");var regex=new RegExp("[\\?&]"+name+"=([^&#]*)"),results=regex.exec(location.search);return results===null?"":decodeURIComponent(results[1].replace(/\+/g," "));};var urlToLocation=function(url){var a=document.createElement('a');a.href=url;return a;};var getAPMonth=function(dateObj){var apMonths=['Jan.','Feb.','March','April','May','June','July','Aug.','Sept.','Oct.','Nov.','Dec.'];var thisMonth=+fmtMonthNum(dateObj)-1;return apMonths[thisMonth];};var wrapText=function(texts,width,lineHeight){texts.each(function(){var text=d3.select(this);var words=text.text().split(/\s+/).reverse();var word=null;var line=[];var lineNumber=0;var x=text.attr('x');var y=text.attr('y');var dx=text.attr('dx')?parseFloat(text.attr('dx')):0;var dy=text.attr('dy')?parseFloat(text.attr('dy')):0;var tspan=text.text(null).append('tspan').attr('x',x).attr('y',y).attr('dx',dx+'px').attr('dy',dy+'px');while(word=words.pop()){line.push(word);tspan.text(line.join(' '));if(tspan.node().getComputedTextLength()>width){line.pop();tspan.text(line.join(' '));line=[word];lineNumber+=1;tspan=text.append('tspan').attr('x',x).attr('y',y).attr('dx',dx+'px').attr('dy',lineNumber*lineHeight).attr('text-anchor','begin').text(word);}}});};var getLocation=function(href){var l=document.createElement("a");l.href=href;return l;};var isProduction=function(u){var result=true;var u=u||window.location.href;var re_embedded=/^.*parentUrl=(.*)$/;var m=u.match(re_embedded);if(m)u=decodeURIComponent(m[1]);l=getLocation(u);if(l.hostname.startsWith("localhost")||l.hostname.startsWith("stage-")||l.hostname.startsWith("www-s1"))result=false;return result;};if(!String.prototype.trim)String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,'');};
var ANALYTICS=(function(){var DIMENSION_PARENT_URL='dimension1';var DIMENSION_PARENT_HOSTNAME='dimension2';var DIMENSION_PARENT_INITIAL_WIDTH='dimension3';var setupGoogle=function(){(function(i,s,o,g,r,a,m){i.GoogleAnalyticsObject=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments);},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m);})(window,document,'script','//www.google-analytics.com/analytics.js','ga');ga('create',GOOGLE_ANALYTICS_ACCOUNT_ID,'auto');var location=window.location.protocol+'//'+window.location.hostname+window.location.pathname;ga('set','location',location);ga('set','page',window.location.pathname);var parentUrl=getParameterByName('parentUrl')||'';var parentHostname='';if(parentUrl)parentHostname=urlToLocation(parentUrl).hostname;var initialWidth=getParameterByName('initialWidth')||'';var customData={};customData[DIMENSION_PARENT_URL]=parentUrl;customData[DIMENSION_PARENT_HOSTNAME]=parentHostname;customData[DIMENSION_PARENT_INITIAL_WIDTH]=initialWidth;ga('send','pageview',customData);};var trackEvent=function(eventName,label,value){var eventData={'hitType':'event','eventCategory':GOOGLE_ANALYTICS_PROJECT_SLUG,'eventAction':eventName};if(label)eventData.eventLabel=label;if(value)eventData.eventValue=value;ga('send',eventData);};setupGoogle();return{'trackEvent':trackEvent};}());