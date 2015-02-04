define(function(require,exports,module){
	module.exports = function(PIXI){
		PIXI.PretransFilter = function(texture)
		{
			PIXI.AbstractFilter.call( this );

			this.passes = [this];

			// set the uniforms
			this.uniforms = {
				inTex: {
					type:'sampler2D',
					value: texture
				}
			};

			this.fragmentSrc = [
				"precision mediump float;",
				"uniform sampler2D inTex;",
				//'uniform sampler2D uSampler;',
				"varying vec2 vTextureCoord;",
				"void main()",
				"{",
					"vec2 vTextureCoord_invert = vec2(vTextureCoord.x, 1.0-vTextureCoord.y);",
					"gl_FragColor = texture2D(inTex, vTextureCoord_invert);",
				"}"
			];


		};

		PIXI.PretransFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
		PIXI.PretransFilter.prototype.constructor = PIXI.PretransFilter;

		Object.defineProperty(PIXI.PretransFilter.prototype, 'texture', {
			get: function() {
				return this.uniforms.texture.value;
			},
			set: function(value) {
				this.uniforms.texture.value = value;
			}
		});
	}
})



