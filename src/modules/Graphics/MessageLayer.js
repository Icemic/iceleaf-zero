define(function(require,exports,module){
	var stageConfig = require('Environment.js');


	var defaultStyle = {
		font: 'normal 24px 微软雅黑',
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
		yInterval: 12
	}

	module.exports = function(PIXI){
		PIXI.MessageLayer = function()
		{
			PIXI.Layer.call( this );

			this.textSprite = new PIXI.EastAsianText('',defaultStyle);
			this.textSprite.x = 20;
			this.textSprite.y = 20;



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
			this.textSprite.setText(text);
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



