define(function(require,exports,module){
	module.exports = function(PIXI){
		PIXI.ColorShader = function(color)
		{
			PIXI.AbstractFilter.call( this );

			this.passes = [this];

			// set the uniforms
			this.uniforms = {
				color_RGBA: {
					type:'4fv',
					value:  [1,0,0,0.8]
				}
			};

			this.fragmentSrc = [
				"precision lowp float;",
				"uniform vec4 color_RGBA;",
				//"varying vec2 vTextureCoord;",
				"void main()",
				"{",
					//"vec2 vTextureCoord_invert = vec2(vTextureCoord.x, 1.0-vTextureCoord.y);",
					"gl_FragColor = color_RGBA;",
				"}"
			];


		};

		PIXI.ColorShader.prototype = Object.create( PIXI.AbstractFilter.prototype );
		PIXI.ColorShader.prototype.constructor = PIXI.ColorShader;

		Object.defineProperty(PIXI.ColorShader.prototype, 'texture', {
			get: function() {
				return this.uniforms.texture.value;
			},
			set: function(value) {
				this.uniforms.texture.value = value;
			}
		});
	}
})



