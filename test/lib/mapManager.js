function MapManager() {
  this._models = new Map();
}

MapManager.type = 'mapping';

MapManager.prototype.getConnection = function () {
  return;
};

MapManager.prototype.closeConnection = function () {
  return;
};

MapManager.prototype.getModel = function (name) {
  if (!this._models.has(name)) {
    this._models.set(name, new Map());
  }
  return this._models.get(name);
};

module.exports = MapManager;
