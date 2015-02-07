define(function(require,exports,module){
	module.exports = function(PIXI){

		PIXI.EastAsianText = function(text,style)
		{
			PIXI.Text.call( this, text ,style );

			this.style.pageWrap = false;
			this.style.pageWrapWidth = 100;
			this.style.xInterval = 0;
			this.style.yInterval = 12;


			this.wrappedText = '';
			this.characterPositionX = this.characterPositionY = 0;

			this._speed = 50;
			this._lastStamp = Date.now();

			this._currentNum = this._printNum = this._currentLine = 0;

			this.blendMode = 7; //临时修正，WEBGL下7与Normal效果相同

		};

		PIXI.EastAsianText.prototype = Object.create( PIXI.Text.prototype );
		PIXI.EastAsianText.prototype.constructor = PIXI.EastAsianText;

		Object.defineProperty(PIXI.EastAsianText.prototype, 'speed', {
			get: function() {
				return (100-this._speed)<<0;
			},
			set: function(value) {
				this._speed = 100-value || 0.01;
			}
		});

		PIXI.EastAsianText.prototype.wordWrap = function(text){
			this.context.font = this.style.font;
			var lineWidth = 0;
			var result = '';
			for (var i = 0; i < text.length; i++) {
				lineWidth += this.context.measureText(text[i]).width+this.style.xInterval+this.style.strokeThickness;
				if(lineWidth >= this.style.wordWrapWidth+this.style.xInterval){
					lineWidth = 0;
					result += '\n';
					i--;
				}
				else
					result += text[i];
			};
			return result;
		}

		PIXI.EastAsianText.prototype.setText = function(text){
			PIXI.Text.prototype.setText.call(this,text);
			this._printNum = 0;
			// this.updateText()
		}

		PIXI.EastAsianText.prototype.setTextInterval = function(x,y){
			this.style.xInterval = x;
			this.style.yInterval = y;
			this.dirty = true;
		}
		PIXI.EastAsianText.prototype.setTextSpeed = function(speed){
			this.speed = speed;
		}

		PIXI.EastAsianText.prototype.updateText = function(){
			this.wrappedText = this.wordWrap(this.text);

			this.texture.baseTexture.resolution = this.resolution;

			this.context.font = this.style.font;

			var outputText = this.text;

			// word wrap
			// preserve original text
			if(this.style.wordWrap)outputText = this.wrappedText;

			outputText = outputText.replace(/(?:\r\n|\r)/,'\n');

			var characters = outputText.split('');
			this.maxLineWidth = 0;
			this.characterWidths = [];  //包含interval
			this.lineWidths = [];
			this.fontProperties = this.determineFontProperties(this.style.font);
			var lineCount = 0;	//行数

			var lineWidth = 0;
			for (var i = 0; i < characters.length; i++) {
				switch(characters[i]){
					case '\n': 
						this.maxLineWidth = Math.max(this.maxLineWidth, lineWidth);
						this.lineWidths[lineCount] = lineWidth;
						lineWidth = 0;
						lineCount++;
						this.characterWidths.push(0);	//使width与this.wrappedText对应
						break;
					default: 
						var width = this.context.measureText(characters[i]).width + this.style.xInterval + this.style.strokeThickness;
						this.characterWidths.push(width);
						lineWidth += width;
						break;
				}
			};

			this.lineWidths[lineCount] = lineWidth;

			var width = this.maxLineWidth + this.style.strokeThickness;
			if(this.style.dropShadow)width += this.style.dropShadowDistance;

			this.canvas.width = ( width + this.context.lineWidth ) * this.resolution;

			//计算最大行宽，设置Canvas宽度
			this.lineHeight = this.fontProperties.fontSize + this.style.strokeThickness + this.style.yInterval - 12;

			var height = this.lineHeight * this.lineWidths.length;
			if(this.style.dropShadow)height += this.style.dropShadowDistance;

			this.canvas.height = height * this.resolution;

			//设置缩放

			this.context.scale( this.resolution, this.resolution);

			//好像是CocoonJS用的补丁……
			if(navigator.isCocoonJS) this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
		
			//初始化
			this.characterPositionX = this.style.strokeThickness / 2;
			this.characterPositionY = (this.style.strokeThickness / 2 + this._currentLine * this.lineHeight) + this.fontProperties.ascent;


		}

		PIXI.EastAsianText.prototype.updateTransform = function(){
			PIXI.Text.prototype.updateTransform.call(this);

			if(this._currentNum>=this.wrappedText.length)
				return

			var stamp = Date.now();
			if(stamp - this._lastStamp < this._speed) return;
			var step = (stamp - this._lastStamp) / this._speed << 0;
			this._lastStamp += this._speed*step;

			this._currentNum += step;
			if(this._currentNum>=this.wrappedText.length)
				this._currentNum = this.wrappedText.length;

			this.context.font = this.style.font;
			this.context.strokeStyle = this.style.stroke;
			this.context.lineWidth = this.style.strokeThickness;
			this.context.textBaseline = 'alphabetic';

			if(this.style.dropShadow){
				this.context.fillStyle = this.style.dropShadowColor;
				var xShadowOffset = Math.sin(this.style.dropShadowAngle) * this.style.dropShadowDistance;
				var yShadowOffset = Math.cos(this.style.dropShadowAngle) * this.style.dropShadowDistance;
			}

			for (var i = this._printNum; i < this._currentNum; i++) {
				var ch = this.wrappedText[this._printNum];
				switch(ch){
					case '\n': 
						this._currentLine++;
						this.characterPositionX = this.style.strokeThickness / 2;
						this.characterPositionY = (this.style.strokeThickness / 2 + this._currentLine * this.lineHeight) + this.fontProperties.ascent;
						if(this.style.align === 'right')
						{
							this.characterPositionX += this.maxLineWidth - this.lineWidths[i];
						}
						else if(this.style.align === 'center')
						{
							this.characterPositionX += (this.maxLineWidth - this.lineWidths[i]) / 2;
						}
						break;
					default:
						if(this.style.dropShadow&&this.style.fill)
						{
							this.context.fillStyle = this.style.dropShadowColor;
							this.context.fillText(ch, this.characterPositionX + xShadowOffset, this.characterPositionY + yShadowOffset);
						}

						this.context.fillStyle = this.style.fill;
						if(this.style.stroke && this.style.strokeThickness)
						{
							this.context.strokeText(ch, this.characterPositionX, this.characterPositionY);
						}

						if(this.style.fill)
						{
							this.context.fillText(ch, this.characterPositionX, this.characterPositionY);
						}
						this.characterPositionX += this.characterWidths[this._printNum];
						break;
				}
				this._printNum++;
			};
			
			this.updateTexture();

		}

	}
})



