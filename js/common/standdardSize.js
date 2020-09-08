(function(){
    document.addEventListener('DOMContentLoaded', function(){
        var html = document.documentElement;
        var windowWidth = html.clientWidth;
        html.style.fontSize = (windowWidth/750)*100 + 'px'; 
    }, false);
  	window.addEventListener("resize", function() {
	    if(document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
	        setTimeout(function() {
	            document.activeElement.scrollIntoViewIfNeeded();
	        }, 0);
	    }
	});
})();
