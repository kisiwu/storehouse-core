export class MapManager {

  #models = new Map()

  constructor() {
    /**
     * 
     */
    this.#models = new Map();
  }
  getConnection() {
    return;
  }
  closeConnection() {
    return;
  }
  getModel(name) {
    if (!this.#models.has(name)) {
      this.#models.set(name, new Map());
    }
    return this.#models.get(name);
  }
}

MapManager.type = 'mapping';
