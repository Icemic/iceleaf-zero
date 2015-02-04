define(function(require){
	var Graphics = require('./Graphics.js');
	Graphics.init();

	var lastTime;
	function animate() {
		requestAnimFrame( animate );
		if(Date.now()-lastTime<17)
			return
		//Tween.tick(Date.now()-lastTime);
		Graphics.render();
		lastTime = Date.now();
	}

	Graphics.test();
	requestAnimFrame( animate );
})