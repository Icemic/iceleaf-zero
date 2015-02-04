define(function(require,exports,module){

	//加载依赖

	var PIXI = require('Graphics/pixi.dev.js');
	require('Graphics/PretransFilter.js')(PIXI);
	require('Graphics/CrossFadeFilter.js')(PIXI);
	require('Graphics/UniversalFilter.js')(PIXI);
	require('Graphics/ColorShader.js')(PIXI);
	require('Graphics/Layer.js')(PIXI);
	require('Graphics/Animation.js')(PIXI);
	require('Graphics/EastAsianText.js')(PIXI);
	require('Graphics/MessageLayer.js')(PIXI);  //依赖Layer EastAsianText，必须在其后

	//默认变量

	var stageConfig = require('Environment.js');

	var stage,renderer;

	var spriteMap = [];

	//常量

	exports.BASICLAYER = -1;

	//PIXI.blendModes.BKEngine = 233;
	

	//内置方法
	function sortByZorder(a,b){
		return a.zorder > b.zorder;
	}
	//基础方法

	exports.set = function(config){
		for(var key in stageConfig){
			stageConfig[key] = config[key] || stageConfig[key];
		}
	}

	exports.init = function(DOM){
		spriteMap[-1] = stage = new PIXI.Stage(stageConfig.backgroundColor);
		renderer = PIXI.autoDetectRenderer(stageConfig.width, stageConfig.height);
		PIXI.blendModesWebGL[PIXI.blendModes.NORMAL] = [renderer.gl.SRC_ALPHA,renderer.gl.ONE_MINUS_SRC_ALPHA];
		exports.DOMView = renderer.view;
		(DOM || document.body).appendChild(renderer.view);
	}

	exports.render = function(){
		renderer.render(stage);
	}



	//功能实现

	exports.sprite = function(index,file,rect){
		if(!index || !file){
			throw new Error("[sprite] Too few arguments.");
		}
		if(index < 0){
			throw new Error("[sprite] Customize sprite index must be positive.");
		}


		//加载文件为 Texture 并剪裁

		var tex = PIXI.Texture.fromImage(file);
		if(rect)
			tex = new PIXI.Texture(tex,new PIXI.Rectangle(rect[0],rect[1],rect[2],rect[3]));
		

		var sprite = spriteMap[index];

		if(sprite&&sprite.type==='sprite')
		{
			//throw new Error("[sprite] Index "+index+" has been used.");

			this.remove(index,false);

			//如果新精灵和旧精灵都是普通的图片精灵，那么只替换图片
			sprite.texture = tex;
			sprite.shader = null;
		}
		else if(sprite)
		{
			//如果新精灵是普通图片精灵，旧精灵是特殊精灵，remove&delete
			this.remove(index,true);
			sprite = new PIXI.Sprite(tex);
			sprite.zorder = 0;
			sprite.index = index;
			sprite.type = 'sprite';
			spriteMap[index] = sprite;
		}
		else{
			//index 未被使用，正常创建精灵
			sprite = new PIXI.Sprite(tex);
			sprite.zorder = 0;
			sprite.index = index;
			sprite.type = 'sprite';
			spriteMap[index] = sprite;
		}
	}

	exports.addto = function(index,target,zorder,pos,opacity){
		if(!index || !target){
			throw new Error("[addto] Too few arguments.");
		}
		var sprite = spriteMap[index];
		if(!sprite){
			throw new Error("[addto] Not found sprite of "+index+".");
		}
		var targetSprite = spriteMap[target];
		if(!targetSprite){
			throw new Error("[addto] Not found target of "+target+".");
		}
		sprite.zorder = zorder || 0;
		pos = pos || [0,0]
		sprite.x = pos[0];
		sprite.y = pos[1];
		sprite.alpha = opacity/255 || 1;

		targetSprite.addChild(sprite);
		targetSprite.children.sort(sortByZorder);
	}

	exports.layer = function(index,width,height,color,opacity){
		if(!index || !width || !height){
			throw new Error("[layer] Too few arguments.");
		}

		//检查index是否被占用，若占用则 remove%delete
		var sprite = spriteMap[index];
		if(sprite)
			this.remove(index,true);

		//加载 layer
		var layer = new PIXI.Layer(width,height,color,opacity/255);
		layer.zorder = 0;
		layer.index = index;
		layer.type = 'layer';
		spriteMap[index] = layer;
	}

	exports.remove = function(index,_delete){
		if(!index){
			throw new Error("[remove] Too few arguments.");
		}
		var child = spriteMap[index];
		if(!child){
			throw new Error("[remove] Not found sprite of "+index+".");
		}
		if(child.parent){
			child.parent.removeChild(child);
		}
		if(_delete){
			for (var i = child.children.length - 1; i >= 0; i--) {
				child.children[i].parent = null;
			};
			// spriteMap[index].texture.destroy(true);
			delete spriteMap[index];
		}
	}

	exports.removeall = function(index,_delete,recursive){
		if(!index){
			throw new Error("[removeall] Too few arguments.");
		}
		var parent;
		if(typeof index === 'number')
			parent = spriteMap[index];
		else
			parent = index;
		if(!parent){
			throw new Error("[removeall] Not found sprite of "+index+".");
		}
		for (var i = parent.children.length - 1; i >= 0; i--) {
			if(recursive)
				this.removeall(parent.children[i],_delete,recursive);
			if(_delete){
				var child = spriteMap[parent.children[i].index];
				for (var i = child.children.length - 1; i >= 0; i--) {
					child.children[i].parent = null;
				};
				// spriteMap[parent.children[i].index].texture.destroy(true);
				delete spriteMap[parent.children[i].index];
			}
		};
		parent.removeChildren();
	}

	exports.info = function(file,get){

	}

	exports.infoex = function(index,get){

	}

	exports.anchor = function(index,value,keep){
		if(arguments.length<1){
			throw new Error("[anchor] Too few arguments.");
		}
		var sprite = spriteMap[index];
		if(!sprite){
			throw new Error("[anchor] Not found sprite of "+index+".");
		}

		//获取
		if(arguments.length==1)
		{
			var point = sprite.anchor;
			return [point.x*sprite._width<<0,point.y*sprite._height<<0];
		}
		//设置
		else
		{
			//存储旧的anchor信息，用于keep=true时的运算
			var ori_anchor = sprite.anchor;
			//若使用的是qset string
			if(typeof value==='string')
			{
				var point;
				switch(value)
				{
					case "center": point = new PIXI.Point(0.5, 0.5);break;
					case "topleft": point = new PIXI.Point(0, 0);break;
					case "topright": point = new PIXI.Point(1, 0);break;
					case "topcenter": point = new PIXI.Point(0.5, 0);break;
					case "leftcenter": point = new PIXI.Point(0, 0.5);break;
					case "bottomleft": point = new PIXI.Point(0, 1);break;
					case "bottomcenter": point = new PIXI.Point(0.5, 1);break;
					case "bottomright": point = new PIXI.Point(1, 1);break;
					case "rightcenter": point = new PIXI.Point(1, 0.5);break;
					default: throw new Error("[anchor] Wrong anchor string of "+index+".");
				}
				sprite.anchor = point;
			}
			//若使用的是坐标
			else{
				sprite.anchor = new	PIXI.Point(value[0]/sprite._width,value[1]/sprite._height);
			}
			
			//是否保持位置
			keep = (keep===undefined)?true:keep;
			if(keep){
				var delta_anchor = new PIXI.Point( sprite.anchor.x - ori_anchor.x, sprite.anchor.y - ori_anchor.y);
				sprite.x = (sprite.x - sprite.width * delta_anchor.x)<<0;
				sprite.y = (sprite.y - sprite.height * delta_anchor.y)<<0;
			}
		}
	}

	exports.zorder = function(index,value){
		
		if(arguments.length<1){
			throw new Error("[zorder] Too few arguments.");
		}
		var sprite = spriteMap[index];
		if(!sprite){
			throw new Error("[zorder] Not found sprite of "+index+".");
		}

		//与API不同，若参数数为2则视为set，数为1视为get并通过return返回
		if(arguments.length===1){

			return sprite.zorder;

		}else{

			sprite.zorder = value;

			//按新zorder重排
			if(sprite.parent)
				sprite.parent.children.sort(sortByZorder);

		}
	}

	exports.spriteopt = function(index,disable,recursive){
		if(arguments.length<1){
			throw new Error("[removeall] Too few arguments.");
		}
		var sprite = spriteMap[index];
		if(!sprite){
			throw new Error("[remove] Not found sprite of "+index+".");
		}

		//剩余未实现，需要考虑事件机制
	}

	//动画类

	exports.animate_hv = function(index,file,mode,frame,interval,loop,delay){
		if(arguments.length<4){
			throw new Error("[animate] Too few arguments.");
		}

		//检查index是否被占用，若占用则 remove%delete
		var sprite = spriteMap[index];
		if(sprite)
			this.remove(index,true);

		//加载 layer
		var animation = new PIXI.Animation(file,mode,frame,interval,loop,delay);
		animation.zorder = 0;
		animation.index = index;
		animation.type = 'animation';
		spriteMap[index] = animation;
	}

	exports.animate_multi = function(index,files,interval,loop,delay){
		if(arguments.length<4){
			throw new Error("[animate] Too few arguments.");
		}

		//检查index是否被占用，若占用则 remove%delete
		var sprite = spriteMap[index];
		if(sprite)
			this.remove(index,true);

		//加载 layer
		var animation = new PIXI.AnimationMulti(files,interval,loop,delay);
		animation.zorder = 0;
		animation.index = index;
		animation.type = 'animation';
		spriteMap[index] = animation;
	}

	exports.animate_start = function(index){
		if(arguments.length<1){
			throw new Error("[animate] Too few arguments.");
		}
		var animate = spriteMap[index];
		if(!animate||animate.type!=='animation'){
			throw new Error("[animate] Not found animate of "+index+".");
		}

		animate.play();
	}
	exports.animate_cell = function(index,n){
		if(arguments.length<2){
			throw new Error("[animate] Too few arguments.");
		}
		var animate = spriteMap[index];
		if(!animate||animate.type!=='animation'){
			throw new Error("[animate] Not found animate of "+index+".");
		}

		animate.setCell(n);
		animate.updateCell();
	}
	exports.animate_stop = function(index){
		if(arguments.length<1){
			throw new Error("[animate] Too few arguments.");
		}
		var animate = spriteMap[index];
		if(!animate||animate.type!=='animation'){
			throw new Error("[animate] Not found animate of "+index+".");
		}

		animate.stop();
	}

	exports.messageLayer = function(index,active){
		if(arguments.length<1){
			throw new Error("[messagelayer] Too few arguments.");
		}

	}




	exports.test = function(){
		this.sprite(10,'./res/BG25a_1280.jpg');
		this.addto(10,this.BASICLAYER,2);

		this.sprite(12,'./res/BG25a_1280.jpg',[0,0,300,300]);
		this.layer(12,300,300,0xffffff,220);
		this.addto(12,10,20,[10,50]);


		this.sprite(11,'./res/BG32a_1280.jpg');
		this.addto(11,12,10,[100,150]);


		//var mc = new PIXI.Animation('./res/PageBreak_b.png','horizontal',16,800/16,'bouncing',800);
		//console.log(mc)
		//var mc = PIXI.Sprite.fromImage('./res/PageBreak_b.png');
		// var multiArr = [
		// 	'./res/images/m_01.png',
		// 	'./res/images/m_02.png',
		// 	'./res/images/m_03.png',
		// 	'./res/images/m_04.png',
		// 	'./res/images/m_05.png',
		// 	'./res/images/m_06.png',
		// 	'./res/images/m_07.png',
		// 	'./res/images/m_08.png',
		// 	'./res/images/m_09.png',
		// 	'./res/images/m_10.png',
		// 	'./res/images/m_11.png',
		// 	'./res/images/m_12.png',
		// 	'./res/images/m_13.png',
		// 	'./res/images/m_14.png',
		// 	'./res/images/m_15.png',
		// 	'./res/images/m_16.png',
		// ]
		// var mc = new PIXI.AnimationMulti(multiArr,800/16,'bouncing',800);
		

		this.animate_hv(13,'./res/PageBreak_b.png','horizontal',16,800/16,'bouncing',800);
		this.addto(13,12,10,[50,150]);
		this.animate_start(13);


		var messageLayer = new PIXI.MessageLayer();
		stage.addChild(messageLayer);
		// messageLayer.setTextWindow(0xaaaaaa,200,[0,0,800,150]);
		messageLayer.setTextWindow("./res/dlgbox800.png",255,[0,0,800,150]);
		// messageLayer.setTextArea([0,0,800,150]);
		messageLayer.setTextArea([20,20,760,150]);
		// messageLayer.textOff();
		// messageLayer.textOn()
		messageLayer.setTextSpeed(50);
		messageLayer.setTextInterval(0,12);
		messageLayer.addText("This is a test text, which is auto-wrapped. 这是一段测试文字，这段文字会Auto-wrapped。这是一段ｔｅｓｔ文字，这段文字会自动换行。这是一段测试文字，这段文字会自动换行。这是一段测试文字，这段文字会自动换行。")
		//stage.addChild(mc);

		// mc.x = 200;
		// mc.y = 50;


		//mc.interval = ;

		//mc.play()
		//mc.animationSpeed = 1;
		//mc.play()
		// this.sprite(12,'./res/BG32a_1280.jpg',[10,300,350,200]);
		// this.addto(12,11,11,[10,30]);

		//this.removeall(10,true,true);
		//this.addto(11,10);
		//console.log(spriteMap)
		// this.sprite(10,'./res/BG32a_1280.jpg');
		// this.addto(10,this.BASICLAYER);

		// var bgTexture = PIXI.Texture.fromImage('./res/BG32a_1280.jpg');
		// var bg = new PIXI.Sprite(bgTexture);
		// bg.position.x = 0;
		// bg.position.y = 0;
		// bg.scale = new PIXI.Point(600/720,600/720);
		// var container = new PIXI.DisplayObjectContainer();
		// container.addChild(bg);
		// stage.addChild(container);
	}


})