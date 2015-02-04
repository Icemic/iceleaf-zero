define(function(require,exports,module){
	module.exports = function(PIXI){
		PIXI.TempDisplayObjectContainer = function(texture)
		{
			PIXI.DisplayObjectContainer.call( this );
		};

		PIXI.TempDisplayObjectContainer.prototype = Object.create( PIXI.DisplayObjectContainer.prototype );
		PIXI.TempDisplayObjectContainer.prototype.constructor = PIXI.TempDisplayObjectContainer;

		/**
		 * Adds a child to the container at a specified index. If the index is out of bounds an error will be thrown
		 *
		 * @method addChildAt
		 * @param child {DisplayObject} The child to add
		 * @param index {Number} The index to place the child in
		 * @return {DisplayObject} The child that was added.
		 */
		PIXI.TempDisplayObjectContainer.prototype.addChildAt = function(child, index)
		{
			if(index >= 0 && index <= this.children.length)
			{
				// if(child.parent)
				// {
				// 	child.parent.removeChild(child);
				// }

				// child.parent = this;

				this.children.splice(index, 0, child);

				// if(this.stage)child.setStageReference(this.stage);

				return child;
			}
			else
			{
				throw new Error(child + 'addChildAt: The index '+ index +' supplied is out of bounds ' + this.children.length);
			}
		};
	}
})



