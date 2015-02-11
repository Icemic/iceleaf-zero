define(function(require,exports,module){
	var stageConfig = require('Environment.js');


	var defaultStyle = {
		// font: 'normal 24px 微软雅黑',
		fill: 'white',
		align: 'left',
		stroke: 'black',
		strokeThickness: 0,
		wordWrap: true,
		wordWrapWidth: stageConfig.width-40,
		dropShadow: false,
		dropShadowColor: '#000000',
		dropShadowAngle: Math.PI/4,
		dropShadowDistance: 5,
		xInterval: 0,
		yInterval: 12,
		fontStyle: "normal",
		fontSize: "24px",
		fontName: "微软雅黑"
	}

	FLAGS = {
		Normal: 1,
		Italic: 2,
		Bold: 4,
		Strike: 8,
		Underline: 16
	}

	module.exports = function(PIXI){
		PIXI.MessageLayer = function()
		{
			PIXI.Layer.call( this );

			this.textSprite = new PIXI.EastAsianText('',defaultStyle);
			this.textSprite.x = 20;
			this.textSprite.y = 20;

			this.fontStyle = 1;

			this.textCache = '';	//当前屏幕的文本

			// this.s

			//注意this.textSprite的引用
			this.addChild(this.textSprite);

		};

		PIXI.MessageLayer.prototype = Object.create( PIXI.Layer.prototype );
		PIXI.MessageLayer.prototype.constructor = PIXI.MessageLayer;


		PIXI.MessageLayer.prototype.setTextWindow = function(file_color,opacity,rect){
			if(typeof file_color==='number'){
				if(this.children.length>=2){
						this.removeChildAt(0);
				}
				this.beginFill(file_color,opacity/255);
				this.drawRect(rect[0],rect[1],rect[2],rect[3]);
				this.endFill();
			}
			else if(typeof file_color==='string'){
				if(this.children.length>=2){
						this.removeChildAt(0);
				}
				this.clear();
				var bg = PIXI.Sprite.fromImage(file_color);
				bg.alpha = opacity/255;
				this.addChildAt(bg,0);
			}
		}

		PIXI.MessageLayer.prototype.setTextArea = function(rect){
			this.textSprite.x = rect[0];
			this.textSprite.y = rect[1];
			this.textSprite.style.wordWrapWidth = rect[2];
		}

		PIXI.MessageLayer.prototype.setTextInterval = function(x,y){
			this.textSprite.setTextInterval(x,y);
		}

		PIXI.MessageLayer.prototype.addText = function(text){
			this.textCache += text;
			this.textSprite.setText(this.textCache,false);
		}

		PIXI.MessageLayer.prototype.i = function(){
			if((this.fontStyle&FLAGS.Italic)===FLAGS.Italic)
				this.fontStyle &= ~FLAGS.Italic;
			else
				this.fontStyle |= FLAGS.Italic;
			this._setTextStyle();
		}

		PIXI.MessageLayer.prototype.b = function(){
			if((this.fontStyle&FLAGS.Bold)===FLAGS.Bold)
				this.fontStyle &= ~FLAGS.Bold;
			else
				this.fontStyle |= FLAGS.Bold;
			this._setTextStyle();
		}

		PIXI.MessageLayer.prototype.s = function(){
			if((this.fontStyle&FLAGS.Strike)===FLAGS.Strike)
				this.fontStyle &= ~FLAGS.Strike;
			else
				this.fontStyle |= FLAGS.Strike;
			// this._setTextStyle();
		}

		PIXI.MessageLayer.prototype.u = function(){
			if((this.fontStyle&FLAGS.Underline)===FLAGS.Underline)
				this.fontStyle &= ~FLAGS.Underline;
			else
				this.fontStyle |= FLAGS.Underline;
			// this._setTextStyle();
		}

		PIXI.MessageLayer.prototype.r = function(){
			this.addText('\n');
		}

		PIXI.MessageLayer.prototype.l = function(){
			
		}

		PIXI.MessageLayer.prototype._setTextStyle = function(){
			if((this.fontStyle&FLAGS.Italic)===FLAGS.Italic && 
				(this.fontStyle&FLAGS.Bold)===FLAGS.Bold)
				this.textSprite.setItalicBold();
			else if((this.fontStyle&FLAGS.Italic)===FLAGS.Italic)
				this.textSprite.setItalic();
			else if((this.fontStyle&FLAGS.Bold)===FLAGS.Bold)
				this.textSprite.setBold();
			// else if((this.fontStyle&FLAGS.Strike)===FLAGS.Strike)
			// else if((this.fontStyle&FLAGS.Underline)===FLAGS.Underline)
			else
				this.textSprite.setNormal();
		}


		PIXI.MessageLayer.prototype.textOn = function(){
			this.visible = true;
		}

		PIXI.MessageLayer.prototype.textOff = function(){
			this.visible = false;
		}

		PIXI.MessageLayer.prototype.setTextSpeed = function(speed){
			this.textSprite.setTextSpeed(speed);
		}

		//私有方法



	}
})



