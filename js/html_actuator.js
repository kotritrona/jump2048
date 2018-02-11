(function(exports) {
	
	function $I(_) {
		return document.getElementById(_);
	}
	function $Q(_) {
		return document.querySelector(_);
	}
	function $C(_) {
		return document.createElement(_);
	}
	function $A(_) {
		return document.querySelectorAll(_);
	}

function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.playerContainer  = document.querySelector(".player-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.sharingContainer = document.querySelector(".score-sharing");

	var size = document.querySelector(".game-container").offsetWidth;
  this.scale = function(_) { return Math.floor(size / 500 * _); };
  this.score = 0;
}

// in this game we have different events, so actuate it separately
HTMLActuator.prototype.actuateTileGeneration = function (grid, player, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
  	
  	grid.eachTile(function (tile) {
  		self.updateTile(tile);
  	});
  	self.removeUnusedTiles(grid);

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

HTMLActuator.prototype.actuatePlayerJump = function (grid, player, metadata) {
  var self = this;
  self.releasePlayerCharge(player);

  window.requestAnimationFrame(function () {
  	
	  self.updatePlayer(player, "jump");

  });
};

HTMLActuator.prototype.actuatePlayerJumpEnd = function (grid, player, metadata) {
  var self = this;
  window.requestAnimationFrame(function () {
		self.resetPlayerAnimation(player);
		grid.eachTile(function(tile) {
			self.updateTile(tile);
		});

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }
  });
  if(player.merged) {
  	self.mergePlayer(player);
  }
  self.removeUnusedTiles(grid);
};

HTMLActuator.prototype.actuateGridDrop = function (grid, player, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
  	
  	self.updatePlayer(player, "drop");
		grid.eachTile(function(tile) {
			self.updateTile(tile);
		});

  });
};

HTMLActuator.prototype.actuateGameOver = function (grid, player, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    if (metadata.terminated) {
      if (metadata.over) {
      	self.updatePlayer(player, "abyss");
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }
  });
};

HTMLActuator.prototype.actuateChargeJump = function (player) { // I think grid and meta were not important, so removed
  var self = this;
  if(player.chargeJump) {
  	self.chargePlayer(player, player.chargeJump.chargeTicks);
  }
};

// since the default version is 2048, which has no "face", we shouldn't update it at all.
HTMLActuator.prototype.actuateChangePlayerFacing = function (player) {
  // this.updatePlayer(player, "changeFacing");
};

// set the transform property in HTMLElement style.
// arg2 is either string or level 1 object like {translate: "10px"}.
HTMLActuator.prototype.setTransform = function(elem, ts) {
	var transformStr = (typeof ts == 'string') ? ts : (function(ts) { var o = []; for(var i in ts) { o.push(i + "(" + ts[i] + ")"); } return o.join(" "); })(ts);
	elem.style.WebkitTransform = elem.style.MsTransform = elem.style.MozTransform = elem.style.transform = transformStr;
};

HTMLActuator.prototype.getTileLevel = function(tile) {
	return Math.max(0, Math.min(18, Math.floor(Math.log(tile.value) / Math.LN2)));
};

HTMLActuator.prototype.getTileClassSet = function(tile) {
	return ["tile", "tile-" + tile.value, "tile-level-" + this.getTileLevel(tile), "tile-rotate-" + tile.rotate, "tile-fontsize-" + Math.min(9, tile.value.toString().length), "tile-id-" + tile.id];
};

// you dont even get a level up stat bonus.
HTMLActuator.prototype.getPlayerLevel = function(player) {
	return Math.max(0, Math.min(27, Math.floor(Math.log(player.value) / Math.LN2)));
};

HTMLActuator.prototype.getPlayerClassSet = function(player) {
	return ["player", "player-level-" + this.getPlayerLevel(player), "player-fontsize-" + Math.min(9, player.value.toString().length), "player-" + (player.facing ? "left" : "right"), "player-status-" + player.status];
};

// render using add / update / remove to avoid removing and recreating everything each tick
HTMLActuator.prototype.addPlayer = function(player) {
	var scale = this.scale || function(_) { return _; };
	
	// wait, this is supposed to be the exact same object, why would it construct itself again?
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
			if(scale(player.lastJumpLength) < 320) {
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
  	}
  	else if(type == "abyss") {
  		classes.push("animation-abyss");
  	}
  	else {
  		classes.push("animation-update");
  	}
    self.applyClasses(wrapper, classes); // Update the position
  });
	
};

HTMLActuator.prototype.mergePlayer = function(player) {
	var container = this.playerContainer;
	var wrapper = container.querySelector(".player");
  var mid = wrapper.querySelector(".player-mid");
  this.applyClasses(mid, ["player-mid", "animation-mid-merged"]);
  var inner = wrapper.querySelector(".player-inner");
	inner.textContent = player.value;
};

HTMLActuator.prototype.chargePlayer = function(player, chargeTicks) {
	var container = this.playerContainer;
	var wrapper = container.querySelector(".player");
  var mid = wrapper.querySelector(".player-mid");
  this.applyClasses(mid, ["player-mid"]);
  this.setTransform(mid, {
  	"scaleX" : 1.0 + 0.01 * 0.3333 * Math.min(120, chargeTicks),
  	"scaleY" : 1.0 - 0.01 * 0.3333 * Math.min(120, chargeTicks)
  });
};

HTMLActuator.prototype.releasePlayerCharge = function(player, chargeTicks) {
	var container = this.playerContainer;
	var wrapper = container.querySelector(".player");
  var mid = wrapper.querySelector(".player-mid");
  this.applyClasses(mid, ["player-mid"]);
  this.setTransform(mid, {
  	"scaleX" : 1.0,
  	"scaleY" : 1.0
  });
};

HTMLActuator.prototype.resetPlayerAnimation = function(player) {
  var classes = this.getPlayerClassSet(player);
	var container = this.playerContainer;
	var wrapper = container.querySelector(".player");
  this.applyClasses(wrapper, classes);
};

HTMLActuator.prototype.removePlayer = function (player) {
  this.clearContainer(this.playerContainer);
};

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
	
	var wrapper = $C("div");
	var mid = $C("div");
	var innerTop = $C("div");
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
	this.setTransform(mid, "scale(" + (tile.size / 80) + ")");
	
	// the graphics is translated to its center point, so we have style.left == position.x
	wrapper.style.left = scale(position.x) + "px";
	wrapper.style.top = scale(position.y) + "px";
	
	wrapper.appendChild(mid);
	mid.appendChild(innerTop);
	this.tileContainer.appendChild(wrapper);
	
};

HTMLActuator.prototype.updateTile = function(tile) {
	var self = this;
	var scale = this.scale || function(_) { return _; };
	
	var container = this.tileContainer;
	var wrapper = container.querySelector(".tile-id-" + tile.id);
	
	// if tile does not exist, create a new tile
	if(!wrapper) {
		return this.addTile(tile);
	}
	
	var position  = { x: tile.x, y: tile.y };
  var classes = this.getTileClassSet(tile);
  
  // update the number in tile
	var innerTop = wrapper.querySelector(".tile-inner-top");
	if(tile.beenMerged) {
		innerTop.textContent = "";
	}
	else {
  	innerTop.textContent = tile.value;
  }
	
	// render in prev position first, then animate to current position
  if (tile.previousPosition) {
		wrapper.style.left = scale(tile.previousPosition.x) + "px";
		wrapper.style.top = scale(tile.previousPosition.y) + "px";
    this.applyClasses(wrapper, classes);
  	
    window.requestAnimationFrame(function (timeStamp) {
			wrapper.style.left = scale(position.x) + "px";
			wrapper.style.top = scale(position.y) + "px";
    	classes.push("animation-update");
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else {
		wrapper.style.left = scale(position.x) + "px";
		wrapper.style.top = scale(position.y) + "px";
    classes.push("animation-update");
    this.applyClasses(wrapper, classes);
  }
	
};

HTMLActuator.prototype.removeTile = function(tile) {
	var container = this.tileContainer;
	var wrapper = container.querySelector(".tile-id-" + tile.id);
	if(wrapper) {
		container.removeChild(wrapper);
	}
};

HTMLActuator.prototype.removeUnusedTiles = function(grid) {
	var container = this.tileContainer;
	var exit = [];
	[].slice.call(container.querySelectorAll(".tile")).forEach(function(elem) {
		if(!grid.tiles.some(function(tile) {
			return elem.className.toString().indexOf("id-" + tile.id) != -1;
		})) {
			exit.push(elem);
		}
	});
	exit.forEach(function(elem) {
		container.removeChild(elem);
	});
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continue = function () {
  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "restart");
  }

  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile_495 = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function (timeStamp) {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? $Q(".string-message-win").textContent : $Q(".string-message-over").textContent;

  if (typeof ga !== "undefined") {
    ga("send", "event", "game", "end", type, this.score);
  }

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;

  this.clearContainer(this.sharingContainer);
  this.sharingContainer.appendChild(this.scoreTweetButton());
  try { // in this version it's not always loaded
  	twttr.widgets.load();
  }
  catch(c){}
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.scoreTweetButton = function () {
	
  var text = $Q(".string-message-share-score").textContent.toString().replace(/#score#/, this.score);
  
  var tweet = document.createElement("a");
  tweet.classList.add("twitter-share-button");
  
  if(typeof isIndexCN == 'undefined' || !isIndexCN) {
  	tweet.setAttribute("href", "https://twitter.com/share");
  	tweet.textContent = "Tweet";
  }
  else {
  	tweet.setAttribute("href", "http://service.weibo.com/share/share.php?url=https%3A%2F%2Fkotritrona.github.io%2fjump2048%2findex_cn.html&title=" + encodeURIComponent(text) + "#mdzz");
  	tweet.textContent = "\u5206\u4eab";
	}
	
  tweet.setAttribute("data-via", "kotritrona");
  tweet.setAttribute("data-url", "http://kotritrona.github.io/jump2048/");
  tweet.setAttribute("data-counturl", "http://kotritrona.github.io/jump2048/");

  tweet.setAttribute("data-text", text);
  return tweet;
};

exports.HTMLActuator = HTMLActuator;

})(window);
