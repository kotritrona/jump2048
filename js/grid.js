function Grid(size) {
  this.size = size || 500;
  this.minX = -150;
  this.minY = -150;
  this.maxX = 1000;
  this.maxY = 1000;
  
  this.minDistance = 3;
  this.minTileX = 30;
  this.maxTileX = 440;
  
  this.lastInsertedTile = null;
  this.yScaler = Math.sqrt(3)/3;

  this.cells = [];
  this.tiles = [];

  this.build();
}

// Build a grid of the specified size
Grid.prototype.build = function () {
	
};

// Find an available random position, also returns rotation
Grid.prototype.randomAvailablePosition = function (nextSize) {
	nextSize = nextSize || 80;
	if(this.lastInsertedTile) {
		var originX = this.lastInsertedTile.x;
		var originY = this.lastInsertedTile.y;
		var lastSize = this.lastInsertedTile.size;
	}
	else {
		var originX = this.size / 2;
		var originY = this.size / 2;
		var lastSize = 0;
	}
	var leftX = originX - lastSize/2;
	var rightX = originX + lastSize/2;
	
	var leftSpace = leftX - this.minTileX - this.minDistance -  nextSize/2 - lastSize/2;
	var rightSpace = this.maxTileX - rightX - this.minDistance - nextSize/2 - lastSize/2;
	
	var sign = leftSpace < 0 ?
						   0
						 : rightSpace < 0 ?
						     1
						   : Math.floor(Math.random() * 2);
	if(!sign) {
		var dist =  lastSize/2 + nextSize/2 + this.minDistance + Math.floor(Math.random() * rightSpace);
	}
	else {
		var dist =  -1 * (lastSize/2 + nextSize/2 + this.minDistance + Math.floor(Math.random() * leftSpace));
	}
	return {position: {
			x: originX + dist,
			y: originY - Math.abs(dist * this.yScaler)
		},
		rotate: +sign
	};
};

// move down everything until top grid reaches y = 440
Grid.prototype.dropTiles = function (yTarget) {
	yTarget = yTarget || 440;
	
	var minY = this.getMinTileY();
	
	var dropDistance = yTarget - minY;
	this.eachTile(function(tile) {
		tile.y += dropDistance;
	});
};

// since we added player now (?)
Grid.prototype.dropTilesAndPlayer = function (yTarget, player) {
	yTarget = yTarget || 440;
	
	var minY = this.getMinTileY();
	
	var dropDistance = yTarget - minY;
	this.eachTile(function(tile) {
		tile.y += dropDistance;
	});
	
	player.nextPosition({x: player.x, y: player.y + dropDistance});
};

Grid.prototype.getMinTileY = function() {
	var minY = 2333333;
	this.eachTile(function(tile) {
		minY = Math.min(minY, tile.y);
	});
	return minY;
};

Grid.prototype.gcTiles = function(yMax, callback) {
	var self = this;
	yMax = yMax || 770;
	callback = callback || function(){};
	var exit = [];
	
	this.eachTile(function(tile) {
		if(tile.y > yMax) {
			exit.push(tile);
			callback(tile);
		}
	});
	exit.forEach(function(tile) {
		self.removeTile(tile);
	});
	
};

// Call callback for every cell
Grid.prototype.eachTile = function (callback) {
	this.tiles.forEach(callback);
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  if(this.tiles.indexOf(tile) == -1) {
  	this.tiles.push(tile);
  	this.lastInsertedTile = tile;
  }
};

Grid.prototype.removeTile = function (tile) {
	var ind;
  if((ind = this.tiles.indexOf(tile)) != -1) {
  	this.tiles.splice(ind, 1);
  }
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= minX && position.x < this.maxX &&
         position.y >= minY && position.y < this.maxY;
};
