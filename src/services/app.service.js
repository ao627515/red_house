import { DomElementService } from './dom-element.service.js';

class AppService {

  init() {
    DomElementService.getInstance().init();
    this.initEventListeners();
  }



  initEventListeners() {

  }

  execute() {

  }
}