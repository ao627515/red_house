class SceneManagerService {
  constructor() {
    this.scenes = [];
    this.currentSceneIndex = -1;
  }

  addScene(scene) {
    this.scenes.push(scene);
    if (this.currentSceneIndex === -1) {
      this.currentSceneIndex = 0; // Set the first scene as current
    }
  }

  removeScene(scene) {
    const index = this.scenes.indexOf(scene);
    if (index !== -1) {
      this.scenes.splice(index, 1);
      if (this.currentSceneIndex >= index) {
        this.currentSceneIndex = Math.max(0, this.currentSceneIndex - 1);
      }
    }
  }

  getCurrentScene() {
    return this.scenes[this.currentSceneIndex];
  }
  setCurrentScene(index) {
    if (index >= 0 && index < this.scenes.length) {
      this.currentSceneIndex = index;
    } else {
      console.error('Index de scène invalide');
    }
  }
  nextScene() {
    if (this.scenes.length > 0) {
      this.currentSceneIndex = (this.currentSceneIndex + 1) % this.scenes.length;
    }
  }
  previousScene() {
    if (this.scenes.length > 0) {
      this.currentSceneIndex = (this.currentSceneIndex - 1 + this.scenes.length) % this.scenes.length;
    }
  }
  getSceneCount() {
    return this.scenes.length;
  }
  clearScenes() {
    this.scenes = [];
    this.currentSceneIndex = -1; // Reset current scene index
  }
  getCurrentSceneIndex() {
    return this.currentSceneIndex;
  }
  setCurrentSceneIndex(index) {
    if (index >= 0 && index < this.scenes.length) {
      this.currentSceneIndex = index;
    } else {
      console.error('Index de scène invalide');
    }
  }
  getScenes() {
    return this.scenes;
  }
}