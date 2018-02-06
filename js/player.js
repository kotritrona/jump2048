function Player(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 0;
  
  this.merged           = false;
  
  this.chargeJump       = null;
  this.lastJumpFacing   = 0;
  this.lastJumpLength   = 0;
  this.facing           = 0;
  this.status           = 0;
  this.source           = null;
  this.target           = null;

  this.mergedFrom       = null; // Tracks players that merged together!
}

Player.jumpLeft = 1;
Player.jumpRight = 0;

Player.prototype.savePosition = function () {
  this.source = { x: this.x, y: this.y };
};

Player.prototype.updatePosition = function (position) {
	position = position || this.target;
  this.x = position.x;
  this.y = position.y;
};

Player.prototype.nextPosition = function (position) {
	this.target = position;
	this.savePosition();
	this.updatePosition(position);
};