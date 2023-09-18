import * as React from 'react';
import { Shape, ShapePath } from 'three';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { DepthTexture } from 'three/src/textures/DepthTexture';
import {Container } from 'theme-ui';
import zenStones from  '../images/zen-image(1470x980).jpg';
import zenStonesDepthMap from '../images/zen-image-depth-map(1470x980).jpg';
import zenPaths from '../assets/zen-path.svg';
const Mesh = (props) => {

  const zenTexture = useLoader(TextureLoader, zenStones);
  const depthMapTexture = useLoader(TextureLoader, zenStonesDepthMap);
  const paths = useLoader(SVGLoader, zenPaths).paths[0];
  console.log(paths);
  const meshRef = React.useRef();
  // path.currentPath = 
  useFrame(({clock}) => {
    meshRef.current.rotation.y = clock.getElapsedTime();
  })
  return (
    <>
      <directionalLight args={['#f8f8f8', 0.5]} position={[0,1,3]} castShadow={true} />
      <mesh scale={[1,1,20]} ref={meshRef}>
        <planeGeometry args={[15,9,4096,4096]}/>
        <meshStandardMaterial map={zenTexture}  displacementMap={depthMapTexture} displacementScale={0.3} displacementBias={0.3} roughness={0.5} />
      </mesh>
    </>
  );
}

const Zen3D = (props) => {
  return (
    <div style={{width:'1470px', height:'980px'}}>
      <Canvas camera={{aspect:1.79, far:3000, fov:60, near:0.05, position:[0, 1, 20]}}>
        <Mesh />
      </Canvas>
    </div>
  );
}

export default Zen3D;