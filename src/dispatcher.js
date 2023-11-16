import * as THREE from 'three';
import { EventDispatcher } from "three";

 class Dispatcher extends EventDispatcher {
  dispatch(eventName) {
    this.dispatchEvent({type: eventName});
  }
}

export default Dispatcher