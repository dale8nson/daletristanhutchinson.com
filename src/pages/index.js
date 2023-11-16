
import { useEffect, useRef, useState, Suspense, preventDefault } from 'react';
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



  const dispatcher = new EventTarget();
  const dispatch = e => {
    console.log(`event received:`, e);
    eventListeners[e]();
  }

  const canvasRef = useRef(null);
  const openLeftShoji = new Event('open-left-shoji');


  const eventListeners = {};
  const registerEventListener = (type, listener) => {
    eventListeners[type] = listener;
  };


  const initCanvas = node => {
    if (!node) return;
    canvasRef.current = node;

  }

  

  // useEffect(() => {
  //   document.addEventListener('open-left-shoji', () => {
  //     console.log(`'open-left-shoji' dispatched`);
  //     eventListeners['open-left-shoji']();
  //   })
  // },[]);

  return (
    <Canvas id='canvas' onScroll={() => null} ref={initCanvas} >
      {/* <ambientLight />  */}
      {/* <Enso position={vec3(3.5,-0.95,0)} scale={vec3(.004125, .0015, 1)} /> */}
      <directionalLight position={new THREE.Vector3(-40, 0, 10)} args={[0xffffff, 1.2]} castShadow={false} />
      <directionalLight position={new THREE.Vector3(40, 0, 10)} args={[0xffffff, 1.2]} castShadow={false} />
      {/* <Suspense fallback={<Enso position={vec3(3.5,-.7,0)} scale={vec3(1.5, 1.5, 1)} />} > */}
      <Suspense fallback={<Enso position={vec3(3.5, -0.95, 0)} scale={vec3(.004125, .002, 1)} />} >
        <GLHeader />
        <GLInterior registerEventListener={registerEventListener} />
        <GlUi dispatch={dispatch} />
      </Suspense>
      <CameraControls enabled={false} />
      {/* <FirstPersonControls enabled={false} /> */}
      {/* <FlyControls enabled={false} /> */}
      {/* <PresentationControls enabled={false} /> */}
    </Canvas>
  )
};

export default IndexPage;

// export const Head = () => <Seo title='Home'/>;