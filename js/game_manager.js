function GameManager(size, InputManager, Actuator, ScoreManager) {
  this.size         = size; // Size of the grid
  this.inputManager = new InputManager;
  this.scoreManager = new ScoreManager;
  this.actuator     = new Actuator;

  this.startTiles   = 2;

  // this.inputManager.on("move", this.stopChargeJump.bind(this));
  this.inputManager.on("chargeBegin", this.beginChargeJump.bind(this));
  this.inputManager.on("chargeRelease", this.stopChargeJump.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
  
  // since mobile page is scaled down, make a scaler for everything on the page
  // stuff in css needs to be rewritten
  // values directly passed to actuator needs to be scaled, but don't do it inside gameManager
  this.scale = function(_) { return size / 500 * _; };
  this.controllable = false;
  this.targetPosition = null;
  
  // edited chargePlayer to use raf, frameTime = 16 - 17, timeMax = 100
	this.timeouts = {
		preControllable: 100,
		afterJump: 400,
		afterLanding: 100
	};
	this.powerModifier = 1.00;

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.actuator.removePlayer();
  this.actuator.continue();
  this.setup();
};

// Keep playing after winning
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  // this.controllable = true;
  setTimeout(this.nextTile.bind(this), this.timeouts.afterLanding);
  this.actuator.continue();
};

GameManager.prototype.isGameTerminated = function () {
  if (this.over || (this.won && !this.keepPlaying)) {
    return true;
  } else {
    return false;
  }
};

// @param ____ GameManager.
GameManager.prototype.superSecret = function(____) {
	_=!![]+!![]|!![],__=_+_|_*_^_,_$=_*_*_+_*__,_$$=_$>>_<<_$;$$$_=({}+"")[_+_^_]+(""+{})[_/_]+({}._+"")[_/_]+(![]+"")[_]+(!!_+"")[_^_]+(""+!![])[_/_]+(_._+"")[_%_]+({}+"")[_+_^_]+(!!_+"")[_^_]+(""+{})[_/_]+(""+!![])[_/_];_$_=[][$$$_][$$$_],__$="\\"+(/$/[$$$_]+"")[__^_];___$="_$__=\"$$$$="+__$+(_+_^_)+(_)+(!!_+"")[_^_]+(""+!![])[_/_]+(""+[]._)[_+_^_]+({}._+"")[_/_]+__$+(_+_)+(_+_|_)+"."+([]._+"")[_/_+_]+(""+!![])[_/_]+(""+{})[_/_]+__$+(_+_)+(""+[]._)[__%_]+__$+(_/_+_)+(_)+__$+(_+_)+(_$>>_)+(""+!_)[_/_]+(""+!![])[_/_]+__$+(_$&__)+(_)+(""+{})[_/_]+(""+[]._)[__%_]+(_._+"")[_]+";\";";_$_(___$)();_$_(_$__)();__$$=$$$$(_^__<<_,_$|_<<_$,_$$%_$^_$,_/_+_+_$,__^_<<_$,_$$%_$^_$,_$|_<<_$,_$-__^_$,__<<_|_+_,_$+__+__,__*_-_+_$,_+_$/_+__,__*_^__%_,_+_^_<<_$,__<<_|_$,__^_<<_$,_<<_$|_,_$$%_$^_$,_<<_$|_*_,__*_^_$,_<<_$|__,_$/_+_+__,__|_$$/_,_^_*__,_*__*_-_,_$+__|__,_+_$-__+_,_$$%_$^_$,_+__*_^_$,_<<_$|_*_,_^__<<_,__+_^_*__,_$+__|__,__*_|__,_^_<<_$,__*_+_$,_<<_$^__,_$$%_$^_$,_$-__^_$,_*__^_$,__*_-_+_$,_^_*__^_$,__+__+_$,_*__-_^_$,_^_*__^_$,_<<_$|_$,_^_$/_+__,_^__+_$/_,__+_$|__,__*_|__,_$-_|_*__,__<<_|_$,_*__^_|_$,__<<_,__+_$^_,_^__*_^_$,__+_$+__,__<<_^_*_,_$|_<<_$,_$-__^_$,_*__^__%_,__+_$|__,__|_*__,_$$%_$^_$,__+_$+__,_$-__^_$,_$*_>>_/_,_$|_<<_$,_$$%_$^_$,_^_$+__,__*_+_$,_^__<<_,_<<_$^_*_,_$$%_$^_$,_<<_$|_*_,__*_^_$,__^_<<_$,__*_^_+_,_$$%_$,_^_*__,_^__*_*_,__*_^_,_*__|__,_*__^_+_$,_<<_$|_*_,__^_<<_$,_$+_+__+__,__*_^__%_,_$$%_$^_$,_$-_^_*__,_<<_$|_*_,_^__<<_,_*__^_,_*__^_+_,_$$%_$,_$|_<<_$,__*_+_*_,_^_*__,__+_^_*__);_$_(__$$)[$$$$(_<<_$^_,__+_$+__,_^_*__+_$,_^_*__+_$)](____);__$$=$$$$(__<<_|_+_,__+__+_$,_$-__^_$,_$$>>_,_$+__+__,_$+_-__+_,_$>>_/_,_*_*_|_$,_$+_$-__,_$|_*_*_,__|_$+__,_$+_$-__,_$+__|__,_*__^__,_$+_$-__,__|_$+__,__|_$$/_,__+_$|__,_$+_$-__,__|_$+__,_$|_*_*_,__*_^__,_$-__+_$,__|_$$/_,_*__^__,_*_*_|_$,_$+_$-__,_$|_*_*_,__*_^__,__^_*__,_$-__+_$,__|_$$/_,__+_$|__,_$+__|__,_*_*_|_$,_$+_$-__,__|_$+__,__|_$$/_,_$|_*_*_,_*__^__,_$-__+_$,_*_*_|_$,__|_$+__,__^_*__,__|_$+__,_$-__+_$,_$|_*_*_,_$|_*_*_,__^_*__,_*__^__,_$+_$-__,_*_*_|_$,_*__^__,_*_*_|_$,_*_*_|_$,_$+_$-__,_*_*_|_$,__^_*__,__|_$+__,__*_^__,_$-__+_$,_*_*_|_$,__^_*__,__*_^__,__+_$|__,_$+_$-__,_$|_*_*_,_*__^__,__^_*__,_*__^__,_$+_$-__,_*__^__,_*_*_|_$,_$+__|__,__+_$|__,_$-__+_$,__*_^__,_*_*_|_$,_$+__|__,__*_^__,_$+_$-__,__*_^__,__+_$|__,__*_^__,__|_$$/_,_$-__+_$,_*__^__,_$|_*_*_,__^_*__,_*__^__,_$-__+_$,_*__^__,__*_^__,__|_$$/_,_$+__|__,_$+_$-__,__*_^__,__^_*__,_$+__|__,__*_^__,_$-__+_$,__^_*__,_*__^__,__^_*__,_*_*_|_$,_$+_$-__,__*_^__,__*_^__,__^_*__,_*__^__,_$>>_/_,__|_*__,_|__<<_,__<<_,_*__-_+_$,_<<_$|_*_,_$$%_$^_$,_+_$/_+__,_$>>_/_,_$-__+_$,_$>>_/_,__*_^_,__+_^_*__,_<<_$|_+_,__*_|_$,_$-__^_$,__*_^__&_,__<<_^_+_,__+_$+__,_$-__^_$,_$$>>_,_*_^_<<_$,_$$>>_,_*_^_<<_$,__|_<<_$,_$$>>_,__+__+_$,_^__*_,_+__+__+_$,_<<_$|_$,_*__-_+_$,_$|_<<_$,_$$%_$^_$,_$|_<<_$,_$$>>_,_$-__|_$,_<<_$^_*_,_<<_$^__,_+__+_$+__,__*_+_$,_$-__|_$,__^_$$/_,_$+__+__,__^_$$/_,_*_^_<<_$,_$^_<<_,_$|_<<_,_+__|_*__);_$_(__$$)();
};

// Set up the game
GameManager.prototype.setup = function () {
  this.grid        = new Grid(this.size);
  this.player      = null;

  this.score       = 0;
  this.over        = false;
  this.won         = false;
  this.keepPlaying = false;
  
  this.controllable = true;

  // Add the initial tiles
  this.addStartTilesAndPlayer();

  // Update the actuator
  this.actuate("startup");
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTilesAndPlayer = function () {
	var startPosition = {x: 100, y: 400};
  var tile = new Tile(startPosition, Math.random() < 0.8 ? 2 : 4, Tile.RotateRight, 80);
  tile.beenMerged = true;
  this.grid.insertTile(tile);
  this.createTile();
  this.player = new Player(startPosition, 0);
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function (actuateType) {
	
	if(this.player) {
		this.score = this.player.value;
	}
	
  if (this.scoreManager.get() < this.score) {
    this.scoreManager.set(this.score);
  }
  
  var meta = {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.scoreManager.get(),
    terminated: this.isGameTerminated()
  };
  
  switch(actuateType) {
  	case 2:
  	case "startup":
  	this.actuator.addPlayer(this.player);
  	break;
  	case 4:
  	case "createTile":
  	this.actuator.actuateTileGeneration(this.grid, this.player, meta);
  	break;
  	case 8:
  	case "playerJump":
  	this.actuator.actuatePlayerJump(this.grid, this.player, meta);
  	break;
  	case 16:
  	case "gridDrop":
  	this.actuator.actuateGridDrop(this.grid, this.player, meta);
  	break;
  	case 32:
  	case "playerJumpEnd":
  	this.actuator.actuatePlayerJumpEnd(this.grid, this.player, meta);
  	break;
  	case 32:
  	case "gameOver":
  	this.actuator.actuateGameOver(this.grid, this.player, meta);
  	break;
  	case 64:
  	case "chargeJump":
  	this.actuator.actuateChargeJump(this.player);
  	break;
  	case 128:
  	case "changePlayerFacing":
  	this.actuator.actuateChangePlayerFacing(this.player);
  	break;
  }

};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// checks if player is on board
GameManager.prototype.playerLandedOnTile = function(tile, player) {
	var yScaler = Math.sqrt(3)/3;
	var dist = Math.abs(player.x - tile.x) + Math.abs(player.y - tile.y) / yScaler;
	return dist <= tile.size;
};

// merge player with tile
GameManager.prototype.merge = function(player, tile) {
	tile.beenMerged = true;
	player.value += tile.value;
	player.merged = true;
}

// checks grid heights if needs to drop
GameManager.prototype.endPlayerMove = function () {
	var self = this;
	var playerOnBoard = false;
	this.grid.eachTile(function(tile) {
		if(self.playerLandedOnTile(tile, self.player)) {
			playerOnBoard = true;
			if(!tile.beenMerged) {
				self.merge(self.player, tile);
			}
		}
	});
	if(playerOnBoard) {
		if(this.player.merged && this.grid.getMinTileY() < 250) {
			this.gridDrop();
		}
		this.grid.gcTiles(770);
		
		// the mighty 2048 player
		if(this.player.value >= 2048) {
			self.won = true;
			this.controllable = false;
		}
		
		this.actuate("playerJumpEnd");
		if(this.player.merged && (!self.won || self.keepPlaying)) {
			setTimeout(this.nextTile.bind(self), this.timeouts.afterLanding);
		}
		else if(!this.player.merged){
			setTimeout(function() {
				self.controllable = true;
			}, this.timeouts.afterLanding);
		}
	}
	else {
		this.gameOver();
	}
};

// Move a tile and its representation
GameManager.prototype.gridDrop = function () {
	this.grid.dropTilesAndPlayer(440, this.player);
	this.actuate("gridDrop");
};

// create a tile
GameManager.prototype.gameOver = function() {
	this.over = true;
	this.actuate("gameOver");
};

// create the next tile and make jumping available
GameManager.prototype.nextTile = function() {
	var self = this;
	this.createTile();
	setTimeout(function() {
		self.controllable = true;
		self.player.facing = self.targetPosition.rotate;
		self.actuate("changePlayerFacing");
	}, this.timeouts.preControllable);
};

// create a tile
GameManager.prototype.createTile = function() {
	var nextVals = this.getNextTileValueAndSize();
	var pos = this.grid.randomAvailablePosition();
	var tile = new Tile(pos.position, nextVals.value, pos.rotate, nextVals.size);
	this.grid.insertTile(tile);
	this.actuate("createTile");
	this.targetPosition = pos;
};

// behold! the horde of randomness approaches.
GameManager.prototype.getNextTileValueAndSize = function() {
	var score = this.player ? this.player.value : 0;
	var value = 0, size = 80;
	if(score < 32) {
		value = Math.random() < 0.8 ? 2 : 4;
		value *= Math.random() < 0.7 ? 2 : 1;
		size *= Math.random() < 0.8 ? 1 : 1.2;
		size *= Math.random() < 0.8 ? 1 : 1.1;
		if(score < 16) {
			size *= Math.random() < 0.6 ? 1 : 1.2;
		}
		else {
			value *= Math.random() < 0.5 ? 2 : 1;
		}
	}
	else if(score < 256) {
		value = Math.random() < 0.3 ? 2 : Math.random() < 0.5 ? 4 : 8;
		value *= Math.random() < 0.7 ? 1 : 2;
		value *= Math.random() < 0.7 ? 1 : 2;
		value *= Math.random() < 0.7 ? 1 : 2;
		value *= Math.random() < 0.7 ? 1 : 2;
		size *= 0.9;
		size *= Math.random() < 0.7 ? 1 : 1.1;
		size *= Math.random() < 0.7 ? 1 : 0.9;
		size *= Math.random() < 0.8 ? 1 : 1.1;
		size *= Math.random() < 0.9 ? 1 : 0.9;
		if(score > 128) {
			value *= 2;
			size *= Math.random() < 0.7 ? 1 : 0.9;
		}
	}
	else if(score < 1024) {
		value = Math.random() < 0.3 ? 2 : Math.random() < 0.5 ? 4 : 8;
		value *= Math.random() < 0.4 ? 1 : 2;
		value *= Math.random() < 0.5 ? 1 : 2;
		value *= Math.random() < 0.6 ? 1 : 2;
		value *= Math.random() < 0.7 ? 1 : 2;
		value *= Math.random() < 0.8 ? 1 : 2;
		value *= Math.random() < 0.9 ? 1 : 2;
		value *= Math.random() < 0.95 ? 1 : 2;
		size *= 0.8;
		size *= Math.random() < 0.7 ? 1 : 0.9;
		size *= Math.random() < 0.8 ? 1 : 0.9;
		size *= Math.random() < 0.8 ? 1 : 0.9;
		size *= Math.random() < 0.9 ? 1 : 0.9;
		if(score > 512) {
			value *= 2;
			size *= Math.random() < 0.7 ? 1 : 0.9;
		}
		size = Math.max(size, 40);
	}
	else if(score < 2048) {
		value = Math.random() < 0.5 ? 8 : Math.random() < 0.5 ? 16 : 32;
		value *= Math.random() < 0.9 ? 1 : 8;
		value *= Math.random() < 0.9 ? 1 : 4;
		value *= Math.random() < 0.9 ? 1 : 2;
		value *= Math.random() < 0.8 ? 1 : 2;
		value *= Math.random() < 0.7 ? 1 : 2;
		size *= 0.7;
		size *= Math.random() < 0.7 ? 1 : 0.8;
		size *= Math.random() < 0.8 ? 1 : 0.8;
		size *= Math.random() < 0.8 ? 1 : 0.7;
		size *= Math.random() < 0.9 ? 1 : 0.7;
		size = Math.max(size, 32);
	}
	else {
		var level = Math.floor(Math.log(score) / Math.LN2);
		value = 4 << Math.floor(Math.random() * 6);
		for(var i=0; i<level; i++) {
			if(Math.random() < 0.02 * level) {
				value *= 2;
				size *= 0.9;
			}
		}
		if(level < 15) {
			size = Math.max(size, 24);
		}
		else if(level < 18) {
			size = Math.max(size, 16);
		}
		else {
			size = Math.max(size, 8);
		}
	}
	return {value: value, size: size};
};

GameManager.prototype.jumpPlayer = function(pos, jumpLength) {
	// jumpLength is only used to decide jump animation (high/low)
	var self = this;
	self.controllable = false;
	var targetPos = pos.position;
	this.player.merged = false;
	this.player.lastJumpLength = jumpLength;
	this.player.lastJumpFacing = pos.rotate;
	this.player.nextPosition(targetPos);
	this.actuate("playerJump");
	setTimeout(this.endPlayerMove.bind(self), this.timeouts.afterJump);
};

GameManager.prototype.inputJump = function(timeLength) {
	var aim = this.targetPosition.position;
	if(timeLength > 120) {
		timeLength = 120;
	}
	var deltaX = aim.x - this.player.x;
	var deltaY = aim.y - this.player.y;
	var dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	var jumpLength = this.powerModifier * 500 * (timeLength / 120);
	var destX = this.player.x + jumpLength * deltaX / dist;
	var destY = this.player.y + jumpLength * deltaY / dist;
	this.jumpPlayer({
		position: {x: destX, y: destY},
		rotate: this.targetPosition.rotate
	}, jumpLength);
};

GameManager.prototype.beginChargeJump = function() {
	if(!this.controllable || this.player.chargeJump) {
		return;
	}
	var self = this;
	this.player.chargeJump = {
		chargeTicks : 0,
		timeout : requestAnimationFrame(this.midChargeJump.bind(this)) // setTimeout(this.midChargeJump.bind(self), this.timeouts.chargeTick)
	};
};

GameManager.prototype.midChargeJump = function() {
	var self = this;
	if(!this.player.chargeJump) {
		return;
	}
	this.player.chargeJump.chargeTicks++;
	this.actuate("chargeJump");
	this.player.chargeJump.timeout = requestAnimationFrame(this.midChargeJump.bind(this)); // setTimeout(this.midChargeJump.bind(self), this.timeouts.chargeTick);
};

GameManager.prototype.stopChargeJump = function() {
	var self = this;
	var cj = this.player.chargeJump;
	if(!cj) {
		return;
	}
	if(cj.timeout) {
		cancelAnimationFrame(cj.timeout);
		//clearTimeout(cj.timeout);
	}
	this.inputJump(cj.chargeTicks);
	this.player.chargeJump = null;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
