
import { useEffect, useCallback, useRef, useState, Suspense, preventDefault } from 'react';
import { WebGLCanvas, Enso } from '../components';
import { Seo, Layout, GLHeader, GLInterior, MainMenu, GlUi } from '../components';
import './scss/_index.scss';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, FirstPersonControls, TrackballControls, PresentationControls, CameraControls, FlyControls } from '@react-three/drei';
import * as THREE from 'three';
import { Slider, Label } from '@fluentui/react';
import { NextUIProvider, Spinner } from '@nextui-org/react';
import { useFrame } from '@react-three/fiber';
import Dispatcher from '../dispatcher';

const vec3 = (n1, n2, n3) => new THREE.Vector3(n1, n2, n3);

const IndexPage = () => {

  const dispatch = useCallback(e => {
    // console.log(`event received:`, e);
    eventListeners[e] && eventListeners[e]();
  }, []);

  const canvasRef = useRef(null);
  const openLeftShoji = new Event('open-left-shoji');


  const eventListeners = {};
  const registerEventListener = useCallback((type, listener) => {
    eventListeners[type] = listener;
  }, []);


  const initCanvas = useCallback(node => {
    if (!node) return;
    canvasRef.current = node;
  }, []);

  

  // useEffect(() => {
  //   document.addEventListener('open-left-shoji', () => {
  //     console.log(`'open-left-shoji' dispatched`);
  //     eventListeners['open-left-shoji']();
  //   })
  // },[]);

  return (
    <Canvas id='canvas' ref={initCanvas} >
      {/* <ambientLight />  */}
      <directionalLight position={new THREE.Vector3(-40, 0, 10)} args={[0xffffff, 1.2]} castShadow={false} />
      <directionalLight position={new THREE.Vector3(40, 0, 10)} args={[0xffffff, 1.2]} castShadow={false} />
      <Suspense fallback={<Enso position={vec3(-8, -0.95, 0)} scale={vec3(.0125, .006, 1)} rotation={[0,0,0]} />} >
        <GLHeader />
        <GLInterior registerEventListener={registerEventListener} dispatch={dispatch} />
        <GlUi dispatch={dispatch}  registerEventListener={registerEventListener} />
      </Suspense>
      <CameraControls enabled={false} />
    </Canvas>
  )
};

export default IndexPage;

// export const Head = () => <Seo title='Home'/>;