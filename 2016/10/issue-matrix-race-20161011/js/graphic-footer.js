var onWindowLoaded=function(){pymChild=new pym.Child({});pymChild.onMessage('on-screen',function(bucket){ANALYTICS.trackEvent('on-screen',bucket);});pymChild.onMessage('scroll-depth',function(data){data=JSON.parse(data);ANALYTICS.trackEvent('scroll-depth',data.percent,data.seconds);});};window.onload=onWindowLoaded;