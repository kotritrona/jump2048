function Tile(position, value, rotate, size) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;
  this.id								= this.newID();
  this.rotate 					= rotate || 0;
  this.size							= size || 80;
  this.beenMerged 			= false;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.RotateRight = 0;
Tile.RotateLeft = 1;

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.n = 1;
Tile.prototype.newID = function() {
	return (Tile.n++).toString(32);
};