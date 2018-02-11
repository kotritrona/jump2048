/*
 * 2048 Jumper skin-specific script for 100OJ Hime.
 * contains modified functions of all script parts.
 *
 */
 
/* ----------- PLAYER FRAMES / FACING CHANGE FEATURE ----------- */

// player character
Player.prototype.character = "hime";

if(/chr=[a-z0-9]+/i.test(location.search.toString())) {
	var supportedCharacters = ["hime", "mariepoppo"];
	var character = location.search.toString().match(/chr=([a-z0-9]+)/i)[1].toLowerCase();
	if(supportedCharacters.indexOf(character) != -1) {
		Player.prototype.character = character;
	}
}

HTMLActuator.prototype.getPlayerClassSet = function(player) {
	return ["player", "player-character-" + player.character, "player-level-" + this.getPlayerLevel(player), "player-fontsize-" + Math.min(9, player.value.toString().length), "player-" + (player.facing ? "left" : "right"), "player-status-" + player.status];
};

// change player frame# each time it actuates, according to actuateType
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
  
  if(this.player) {
  	this.player.status = actuateType;
  }
  
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

// update the player to change her facing
HTMLActuator.prototype.actuateChangePlayerFacing = function (player) {
  this.updatePlayer(player, "changeFacing");
};

// added facing transition
// also added sound effects
HTMLActuator.prototype.updatePlayer = function(player, type) {
	var self = this;
	var scale = this.scale || function(_) { return _; };
	
	var container = this.playerContainer;
	var wrapper = container.querySelector(".player");
	
	var position  = { x: player.x, y: player.y };
  var classes = this.getPlayerClassSet(player);
  
  if(type == "abyss") {
  	classes.push("player-fail");
  }
  
  if(type == "jump") {
  	var mid = wrapper.querySelector(".player-mid");
  	this.applyClasses(mid, ["player-mid"]);
  }
  
  if(!player.source || !player.target) {
  	return;
  }
  
  var inner = wrapper.querySelector(".player-inner");
	inner.textContent = player.value;
  
  // render in prev position first, then animate to current position
  if(type != "abyss") {
		wrapper.style.left = scale(player.source.x) + "px";
		wrapper.style.top = scale(player.source.y) + "px";
	}
	else {
		wrapper.style.left = scale(player.x) + "px";
		wrapper.style.top = scale(player.y) + "px";
	}
  this.applyClasses(wrapper, classes);
	
  window.requestAnimationFrame(function (timeStamp) {
		wrapper.style.left = scale(player.target.x) + "px";
		wrapper.style.top = scale(player.target.y) + "px";
		if(type == "jump") {
			if(scale(player.lastJumpLength) < 200) {
				if(player.lastJumpFacing == 0) {
  				classes.push("animation-jump");
  			}
  			else {
  				classes.push("animation-jump2");
  			}
  		}
  		else {
				if(player.lastJumpFacing == 0) {
  				classes.push("animation-jumpLong");
  			}
  			else {
  				classes.push("animation-jumpLong2");
  			}
  		}
  		self.playSound("jump");
  	}
  	else if(type == "abyss") {
  		classes.push("animation-abyss");
  		self.playSound("abyss");
  	}
  	else if(type == "changeFacing") {
  		classes.push("animation-change-facing");
  	}
  	else {
  		classes.push("animation-update");
  	}
    self.applyClasses(wrapper, classes); // Update the position
  });
	
};

// added sound effects
HTMLActuator.prototype.mergePlayer = function(player) {
	var container = this.playerContainer;
	var wrapper = container.querySelector(".player");
  var mid = wrapper.querySelector(".player-mid");
  this.applyClasses(mid, ["player-mid", "animation-mid-merged"]);
  var inner = wrapper.querySelector(".player-inner");
	inner.textContent = player.value;
	if(player.mergedValue >= 30) {
  	this.playSound("levelup");
	}
	else if(player.mergedValue >= 10) {
  	this.playSound("stars");
	}
	else if(player.mergedValue >= 1) {
  	this.playSound("landed");
	}
};

HTMLActuator.prototype.chargePlayer = function(player, chargeTicks) {
	var container = this.playerContainer;
	var wrapper = container.querySelector(".player");
  var classes = this.getPlayerClassSet(player);
  this.applyClasses(wrapper, classes);
  var mid = wrapper.querySelector(".player-mid");
  this.applyClasses(mid, ["player-mid"]);
  this.setTransform(mid, {
  	"scaleX" : 1.0 + 0.01 * Math.min(40, chargeTicks),
  	"scaleY" : 1.0 - 0.01 * Math.min(40, chargeTicks)
  });
};





 
/* ----------- LocalStorage Key ----------- */

LocalScoreManager.prototype.key = "bestScore-jump2048-ojhime";

/* ----------- SOUND EFFECTS ----------- */

HTMLActuator.prototype.loadSounds = function() {
	if(this.sounds) {
		return;
	}
	else {
		if(/android [0-4]/i.test(navigator.userAgent.toString())) {
			this.sounds = {};
			return;
		}
		this.sounds = {
			jump: new Audio("skins/ojhime/throwdice.mp3"),
			abyss: new Audio("skins/ojhime/hit.mp3"),
			landed: new Audio("skins/ojhime/draw.mp3"),
			stars: new Audio("skins/ojhime/stars.mp3"),
			levelup: new Audio("skins/ojhime/levelup.mp3")
		};
		this.sounds.jump.volume = 0.3;
		this.sounds.landed.volume = 0.3;
		this.sounds.stars.volume = 0.7;
		this.sounds.levelup.volume = 0.7;
		this.sounds.abyss.volume = 0.7;
	}
};

HTMLActuator.prototype.playSound = function(sound) {
	if(!this.sounds) {
		return;
	}
	var soundFile = this.sounds[sound];
	if(!soundFile || typeof soundFile.play != 'function' || !soundFile.readyState) {
		return;
	}
	soundFile.currentTime = 0;
	soundFile.play();
};

// call loadSounds on initialization
HTMLActuator.prototype.addPlayer = function(player) {
	
	this.loadSounds();
	
	var $C = function(_) {
		return document.createElement(_);
	}
	
	var scale = this.scale || function(_) { return _; };
  var position  = { x: player.x, y: player.y };
	
	var classes = this.getPlayerClassSet(player);
  classes.push("animation-new");
	
	var wrapper = $C("div");
	var mid = $C("div");
	var inner = $C("div");
	
	inner.textContent = player.value;
	
	this.applyClasses(wrapper, classes);
	this.applyClasses(mid, ["player-mid"]);
	this.applyClasses(inner, ["player-inner"]);
	
	wrapper.style.left = scale(position.x) + "px";
	wrapper.style.top = scale(position.y) + "px";
	
	wrapper.appendChild(mid);
	mid.appendChild(inner);
	this.playerContainer.appendChild(wrapper);
	
};
 
/* ----------- OJ SPECIFIC ----------- */

// randomly choose value from 1 - 

/*

1 EMPTY
2 DROP
3 ENCOUNTER
4 WARP
5 WARPMOVE
6 MOVE
7 ICE
8 DRAW
9 BONUS
10 DROP 2x
11 ENCOUNTER 2x
12 WARPMOVE 2x
13 MOVE 2x
14 DRAW 2x
15 BONUS 2x
16 BOSS
17 HOME

*/

GameManager.prototype.addStartTilesAndPlayer = function () {
	var startPosition = {x: 100, y: 400};
  var tile = new Tile(startPosition, 1 + Math.floor(Math.random() * 9), Tile.RotateRight, 80);
  tile.beenMerged = true;
  this.grid.insertTile(tile);
  this.createTile();
  this.player = new Player(startPosition, 0);
};

GameManager.prototype.getNextTileValueAndSize = function() {
	var score = this.player ? this.player.value : 0;
	var value = 1 + Math.floor(Math.random() * 17), size = 100;
	if(score < 20) {
		value = 1 + Math.floor(Math.random() * 9);
		size *= Math.random() < 0.8 ? 1 : 1.2;
		size *= Math.random() < 0.8 ? 1 : 1.1;
		if(score < 10) {
			size *= Math.random() < 0.6 ? 1 : 1.2;
		}
	}
	else if(score < 60) {
		value = 1 + Math.floor(Math.random() * 15);
		size *= 0.9;
		size *= Math.random() < 0.7 ? 1 : 1.1;
		size *= Math.random() < 0.7 ? 1 : 0.9;
		size *= Math.random() < 0.8 ? 1 : 1.1;
		size *= Math.random() < 0.9 ? 1 : 0.9;
		if(score > 20) {
			size *= Math.random() < 0.7 ? 1 : 0.9;
		}
	}
	else if(score < 120) {
		value = 1 + Math.floor(Math.random() * 16);
		size *= 0.8;
		size *= Math.random() < 0.7 ? 1 : 0.9;
		size *= Math.random() < 0.8 ? 1 : 0.9;
		size *= Math.random() < 0.8 ? 1 : 0.9;
		size *= Math.random() < 0.9 ? 1 : 0.9;
		if(score > 90) {
			size *= Math.random() < 0.8 ? 1 : 0.9;
			size *= Math.random() < 0.8 ? 1 : 0.9;
		}
		size = Math.max(size, 48);
	}
	else if(score < 160) {
		size *= 0.7;
		size *= Math.random() < 0.7 ? 1 : 0.8;
		size *= Math.random() < 0.8 ? 1 : 0.8;
		size *= Math.random() < 0.8 ? 1 : 0.7;
		size *= Math.random() < 0.9 ? 1 : 0.7;
		size = Math.max(size, 40);
	}
	else {
		var level = Math.floor(score / 40);
		for(var i=0; i<level; i++) {
			if(Math.random() < 0.25) {
				size *= 0.9;
			}
		}
		if(level < 15) {
			size = Math.max(size, 32);
		}
		else if(level < 18) {
			size = Math.max(size, 24);
		}
		else {
			size = Math.max(size, 20);
		}
	}
	return {value: value, size: size};
};

// merge only gives 1 pt, unless tile is special
GameManager.prototype.merge = function(player, tile) {
	tile.beenMerged = true;
	if(tile.value <= 8) {
		player.mergedValue = 1;
	}
	else if(tile.value <= 9) {
		player.mergedValue = 10;
	}
	else if(tile.value <= 14) {
		player.mergedValue = 2;
	}
	else if(tile.value <= 15) {
		player.mergedValue = 20;
	}
	else if(tile.value <= 16) {
		player.mergedValue = 5;
	}
	else if(tile.value <= 17) {
		player.mergedValue = 30;
	}
	else {
		player.mergedValue = 1;
	}
	player.value += player.mergedValue;
	player.merged = true;
}

// actuator function to trace back the player position
HTMLActuator.prototype.tracebackPlayerPosition = function() {
	var container = this.playerContainer;
	var player = container.querySelector(".player");
	return { x: player.offsetLeft, y: player.offsetTop };
};

// do not win!
GameManager.prototype.endPlayerMove = function () {
	// fix some bug caused by lag on mobile page
	// if player is not animated to the point due to lag,
	// re-call this function itself next frame
	var tracedPlayerPosition = this.actuator.tracebackPlayerPosition();
	var scale = this.scale;
	if(Math.abs(tracedPlayerPosition.x - scale(this.player.target.x)) + Math.abs(tracedPlayerPosition.y - scale(this.player.target.y)) > 5) {
		return requestAnimationFrame(this.endPlayerMove.bind(this));
	}
	
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
		if(this.player.value >= 2048 && false) {
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

HTMLActuator.prototype.getTileLevel = function(tile) {
	return tile.value;
};

// set +x text to appear on hime
HTMLActuator.prototype.updateScore = function (score) {
	var container = this.playerContainer;
  var player = container.querySelector(".player");

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    player.appendChild(addition);
    setTimeout(function() {
    	if(player && addition) {
    		player.removeChild(addition);
    	}
    }, 600);
  }
};

// render the tiles a little larger
HTMLActuator.prototype.addTile = function(tile) {
	
	var self = this;
	var scale = this.scale || function(_) { return _; };
	
	// since we have too many possible positions, set it directly in style-prop instead of class
  var position  = { x: tile.x, y: tile.y };

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = this.getTileClassSet(tile);
  classes.push("animation-new");

  if (tile.value > 2048) classes.push("tile-super");
  
  if(tile.beenMerged) {
  	classes.push("tile-been-merged");
  }
	
	var wrapper = document.createElement("div");
	var mid = document.createElement("div");
	var innerTop = document.createElement("div");
	if(tile.beenMerged) {
		innerTop.textContent = "";
	}
	else {
  	innerTop.textContent = tile.value;
  }
  // originally other two sides of the box were planned
  // removed because they would break the round border
	
	this.applyClasses(wrapper, classes);
	this.applyClasses(mid, ["tile-mid"]);
	this.applyClasses(innerTop, ["tile-inner-top"]);
	
	// scale mid element
	this.setTransform(mid, "scale(" + (tile.size / 72) + ")");
	
	// the graphics is translated to its center point, so we have style.left == position.x
	wrapper.style.left = scale(position.x) + "px";
	wrapper.style.top = scale(position.y) + "px";
	
	wrapper.appendChild(mid);
	mid.appendChild(innerTop);
	this.tileContainer.appendChild(wrapper);
	
};
