define(function(require,exports,module){
	module.exports = function(PIXI){

		/**
		 * Converts a hex color number to an [R, G, B] array
		 *
		 * @method hex2rgb
		 * @param hex {Number}
		 */
		PIXI.hex2rgba = function(hex) {
		    return [(hex >> 24 & 0xFF) / 255, (hex >> 16 & 0xFF) / 255, ( hex >> 8 & 0xFF) / 255, (hex & 0xFF)/ 255];
		};

		/**
		 * Converts a color as an [R, G, B] array to a hex number
		 *
		 * @method rgb2hex
		 * @param rgb {Array}
		 */
		PIXI.rgba2hex = function(rgb) {
		    return ((rgb[0]*255 << 24) + (rgb[1]*255 << 16) + (rgb[2]*255 << 8) + rgb[3]*255);
		};

		PIXI.Layer = function(width,height,color,opacity)
		{
			PIXI.Graphics.call( this );

			// this.cacheAsBitmap = true;
			this.beginFill(color,opacity);
			this.drawRect(0,0,width,height);
			this.endFill();

			this._color = color;
			this._opacity = opacity;

			this._width = width;
			this._height = height;

		};

		PIXI.Layer.prototype = Object.create( PIXI.Graphics.prototype );
		PIXI.Layer.prototype.constructor = PIXI.Layer;

		/**
		 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
		 *
		 * @method addChildAt
		 * @param child {DisplayObject} The child to add
		 * @param index {Number} The index to place the child in
		 * @return {DisplayObject} The child that was added.
		 */
		// PIXI.Layer.prototype.setBackgroundColor = function(color)
		// {
		// 	this.backgroundColor = color;
		// 	this.backgroundColorArray = PIXI.hex2rgba(color);

		// 	this.shader = new PIXI.ColorShader(this.backgroundColorArray);
		// };
	}
})



