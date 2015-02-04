define(function(require,exports,module){
	module.exports = function(PIXI){
		PIXI.Animation = function(file,mode,frame,interval,loop,delay)
		{

			PIXI.Sprite.call( this );

			//加载精灵表单，存为baseTexture
			var baseTexture = PIXI.BaseTexture.fromImage(file);
			this.baseTexture = baseTexture;

			//判断水平/垂直，决定权重
			switch(mode){
				case 'horizontal': this.weightX = true;this.weightY = false;break;
				case 'vertical': this.weightX = false;this.weightY = true;break;
				default: throw new Error("Animation: Unknown mode of "+mode+".");
			}

			//记录总cell数
			this.cellCount = frame;

			//初始化
			this.cellWidth = 0;
			this.cellHeight = 0;

			//动画参数
			this.interval = interval || 33;
			var loops = ['none','forward','bouncing'];
			this.loop = loops[loop] || loop || 'forward';
			this.delay = delay || 0;

			//内部变量
			this._lastStamp = 0;
			this.currentCell = 0;
			this.playing = false;


			//判断baseTexture是否加载完，并设定cell尺寸
			if(this.baseTexture.hasLoaded)
			{
				this.onBaseTextureUpdate();
			}
			else
			{
				this.onBaseTextureUpdateBind = this.onBaseTextureUpdate.bind(this);
				this.baseTexture.on( 'loaded', this.onBaseTextureUpdateBind );
			}

		};

		PIXI.Animation.prototype = Object.create( PIXI.Sprite.prototype );
		PIXI.Animation.prototype.constructor = PIXI.Animation;


		PIXI.Animation.prototype.onBaseTextureUpdate = function(){
			this.cellWidth = this.weightX?(this.baseTexture.width / this.cellCount << 0):this.baseTexture.width;
			this.cellHeight = this.weightY?(this.baseTexture.height / this.cellCount << 0):this.baseTexture.height;
			this.updateCell();
		}

		PIXI.Animation.prototype.setCell = function(n){
			this.currentCell = n;
		}

		PIXI.Animation.prototype.updateCell = function(n){
			// console.log(n||this.currentCell)
			var texture = new PIXI.Texture(this.baseTexture,{
				x: this.cellWidth*(n||this.currentCell)*this.weightX,
				y: this.cellHeight*(n||this.currentCell)*this.weightY,
				width: this.cellWidth,
				height: this.cellHeight
			})
			this.setTexture(texture);
		}

		PIXI.Animation.prototype.updateTransform = function(){
			PIXI.Sprite.prototype.updateTransform.call(this);
			if(!this.playing) return;
			var stamp = Date.now();
			if(stamp - this._lastStamp < this.interval) return;
			var step = (stamp - this._lastStamp) / this.interval << 0;
			this._lastStamp += this.interval*step;
			switch(this.loop){
				case 'none':
					this.currentCell += step;
					if(this.currentCell >= this.cellCount) 
						this.stop();
					else
						this.updateCell();
					break;
				case 'forward':
					this.currentCell += step;
					if(this.currentCell >= this.cellCount){
						this.currentCell = 0;
						this._lastStamp += this.delay;
					}
					this.updateCell();
					break;
				case 'bouncing':
					this.currentCell += step;
					if(this.currentCell > this.cellCount && this.currentCell < this.cellCount*2-1)
					{
						//this.setCell();
						this.updateCell(2*this.cellCount-1-this.currentCell);
						//this.setCell(2*this.cellCount-this.currentCell+2)
					}
					else if(this.currentCell < this.cellCount)
					{
						this.updateCell();
					}
					else if(this.currentCell >= this.cellCount*2-1) // this.currentCell >= this.cellCount*2
					{
						this._lastStamp += this.delay;
						this.currentCell = 0;
						this.updateCell();
					}
					else //this.currentCell == this.cellCount
					{
						this.currentCell ++;
						this.updateCell(2*this.cellCount-1-this.currentCell);
					}
					break;
			}
		}

		PIXI.Animation.prototype.play = function(){
			this._lastStamp = Date.now();
			this.playing = true;
		}

		PIXI.Animation.prototype.pause = function(){
			this.playing = false;
		}

		PIXI.Animation.prototype.stop = function(){
			this.playing = false;
			this.currentCell = 0;
		}



		PIXI.AnimationMulti = function(files,interval,loop)
		{

			PIXI.Sprite.call( this );

			//加载精灵表单，存为cells数组

			this.cells = [];

			for (var i = 0; i < files.length; i++) {
				this.cells.push(PIXI.Texture.fromImage(files[i]));
			};


			//记录总cell数
			this.cellCount = files.length;

			//初始化

			//动画参数
			this.interval = interval || 33;
			var loops = ['none','forward','bouncing'];
			this.loop = loops[loop] || loop || 'forward';

			//内部变量
			this._lastStamp = 0;
			this.currentCell = 0;
			this.playing = false;


			//判断baseTexture是否加载完，并设定cell尺寸
			if(this.cells[0].baseTexture.hasLoaded)
			{
				this.onBaseTextureUpdate();
			}
			else
			{
				this.onBaseTextureUpdateBind = this.onBaseTextureUpdate.bind(this);
				this.cells[0].baseTexture.on( 'loaded', this.onBaseTextureUpdateBind );
			}

		};

		PIXI.AnimationMulti.prototype = Object.create( PIXI.Sprite.prototype );
		PIXI.AnimationMulti.prototype.constructor = PIXI.AnimationMulti;

		PIXI.AnimationMulti.prototype.destroy = function(destroybase){
			//PIXI.Sprite.prototype.destroy.call(this,destroybase);
			this.texture.destroy(destroybase);
			for (var i = this.cells.length - 1; i >= 0; i--) {
				this.cells[i].destroy(destroybase);
			};
		}

		PIXI.AnimationMulti.prototype.onBaseTextureUpdate = function(){
			this.updateCell();
		}

		PIXI.AnimationMulti.prototype.setCell = function(n){
			this.currentCell = n;
		}

		PIXI.AnimationMulti.prototype.updateCell = function(n){
			// console.log(n||this.currentCell)
			this.setTexture(this.cells[n||this.currentCell]);
		}

		PIXI.AnimationMulti.prototype.updateTransform = function(){
			PIXI.Sprite.prototype.updateTransform.call(this);
			if(!this.playing) return;
			var stamp = Date.now();
			if(stamp - this._lastStamp < this.interval) return;
			var step = (stamp - this._lastStamp) / this.interval << 0;
			this._lastStamp += this.interval*step;
			switch(this.loop){
				case 'none':
					this.currentCell += step;
					if(this.currentCell >= this.cellCount) 
						this.stop();
					else
						this.updateCell();
					break;
				case 'forward':
					this.currentCell += step;
					if(this.currentCell >= this.cellCount)
						this.currentCell = 0;
					this.updateCell();
					break;
				case 'bouncing':
					this.currentCell += step;
					if(this.currentCell > this.cellCount && this.currentCell < this.cellCount*2-1)
					{
						//this.setCell();
						this.updateCell(2*this.cellCount-1-this.currentCell);
						//this.setCell(2*this.cellCount-this.currentCell+2)
					}
					else if(this.currentCell < this.cellCount)
					{
						this.updateCell();
					}
					else if(this.currentCell >= this.cellCount*2-1) // this.currentCell >= this.cellCount*2
					{
						this.currentCell = 0;
						this.updateCell();
					}
					else //this.currentCell == this.cellCount
					{
						this.currentCell ++;
						this.updateCell(2*this.cellCount-1-this.currentCell);
					}
					break;
			}
		}

		PIXI.AnimationMulti.prototype.play = function(){
			this._lastStamp = Date.now();
			this.playing = true;
		}

		PIXI.AnimationMulti.prototype.pause = function(){
			this.playing = false;
		}

		PIXI.AnimationMulti.prototype.stop = function(){
			this.playing = false;
			this.currentCell = 0;
		}

	}
})



