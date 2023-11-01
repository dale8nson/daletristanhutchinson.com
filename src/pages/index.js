
import { useEffect, useRef, useState, Suspense } from 'react';
import  { WebGLCanvas, Enso } from '../components';
import { Seo,Layout, GLHeader, GLInterior, MainMenu } from '../components';
import './scss/_index.scss';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Slider, Label } from '@fluentui/react';
import { NextUIProvider, Spinner } from '@nextui-org/react';
import { useFrame } from '@react-three/fiber';

const vec3 = (n1, n2, n3) => new THREE.Vector3(n1, n2, n3);

const IndexPage = () => {

  const houseAspect = useRef(null);
  let windowWidth = useRef(null);
  // useEffect(() => { 
  //   houseAspect.current = window.outerWidth / window.outerHeight;
  //   const el = document.getElementById('canvas');
  //   el.width = window.outerWidth;
  //   el.height = window.outerWidth / houseAspect.current;
  //   windowWidth.current = window.outerWidth;
  // });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  },[])
  
  return (
    <>
      <Canvas id='canvas' >
      {/* <ambientLight /> */} 
        {/* <Enso scale={vec3(1,1,1)} /> */}
        <Suspense fallback={<Enso position={vec3(3.5,-.7,0)} scale={vec3(1.5, 1.5, 1)} />} >
          <directionalLight position={new THREE.Vector3(-40,0,10)} args={[0xffffff, 1.2]} castShadow={false} />
          <directionalLight position={new THREE.Vector3(40,0,10)} args={[0xffffff, 1.2]} castShadow={false} />
          <GLHeader />
          <GLInterior />
        </Suspense>
      </Canvas>
    {/* {isMounted && <WebGLCanvas /> } */}
      <div id='ui' >
        {/* <MainMenu /> */}
      </div>
    </>
  )
};

export default IndexPage;

// export const Head = () => <Seo title='Home'/>;