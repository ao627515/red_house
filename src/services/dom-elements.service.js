
class DomElementService {

  static _instance = null;
  tooltip = null;
  canvas = null;

  constructor() {
    if (DomElementService._instance) {
      return DomElementService._instance;
    }

    DomElementService._instance = this;
    // this.init();

  }

  /**
   * Initializes the service by fetching the canvas and tooltip elements.
   **/

  init() {
    this._fetchCanvas();
    this._fetchTooltip();
  }

  static getInstance() {
    if (!DomElementService._instance) {
      DomElementService._instance = new DomElementService();
      // DomElementService._instance.init();
    }
    return DomElementService._instance;
  }

  _fetchCanvas() {
    if (!this.canvas) {
      this.canvas = document.querySelector('canvas');
      if (!DomElementService.CANVAS) {
        console.error('Canvas element not found');
      }
    }
  }

  _fetchTooltip() {
    if (!this.tooltip) {
      this.tooltip = document.querySelector('.tooltip');
      if (!this.tooltip) {
        console.error('Tooltip element not found');
      }
    }
  }
}