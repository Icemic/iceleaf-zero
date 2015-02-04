define(function(require,exports,module){
	module.exports = function(PIXI){
		PIXI.UniversalFilter = function(inTex,ruleTex,vague)
		{
			PIXI.AbstractFilter.call( this );

			this.passes = [this];

			// set the uniforms
			this.uniforms = {
				inTex: {
					type:'sampler2D',
					value: inTex
				},
				ruleTex: {
					type:'sampler2D',
					value: ruleTex
				},
				progress: {
					type: '1f',
					value: 0
				},
				vague: {
					type: '1f',
					value: vague||64/255
				}
			};

			this.fragmentSrc = [
				"precision mediump float;",
				"uniform sampler2D inTex;",
				"uniform sampler2D uSampler;",
				"uniform sampler2D ruleTex;",
				"uniform float progress;",
				"uniform float vague;",
				"varying vec2 vTextureCoord;",
				"void main()",
				"{",
					"vec2 vTextureCoord_invert = vec2(vTextureCoord.x, 1.0-vTextureCoord.y);",
					"vec4 col=texture2D(inTex, vTextureCoord_invert);",
					"vec4 col2=texture2D(uSampler, vTextureCoord);",
					"float b=texture2D(ruleTex, vTextureCoord_invert).b;",
					"float phase=(1.0+vague)*progress;",
					//"b = (b - phase + vague) / vague; ",
					//"b = clamp(b, 0, 1); ",
					"b = smoothstep(phase - vague, phase, b);",
					"gl_FragColor = mix(col2, col, b);",
				"}"
			];


		};

		PIXI.UniversalFilter.prototype = Object.create( PIXI.AbstractFilter.prototype );
		PIXI.UniversalFilter.prototype.constructor = PIXI.UniversalFilter;

		Object.defineProperty(PIXI.UniversalFilter.prototype, 'progress', {
			get: function() {
				return this.uniforms.progress.value;
			},
			set: function(value) {
				
				this.uniforms.progress.value = value;
				if(this.uniforms.progress.value<0)
					this.uniforms.progress.value = 0;
				else if(this.uniforms.progress.value>1)
					this.uniforms.progress.value = 1;
				else
					console.log(value)
			}
		});
	}
})

