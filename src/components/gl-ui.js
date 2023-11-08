import * as THREE from 'three';
import { useLoader, mesh, planeGeometry, shaderMaterial } from '@react-three/fiber';
import { Shader } from "./shaders/shader";
import { Html, Text } from "@react-three/drei";

import parchment from '../assets/Texturelabs_Glass_151L.jpg';
import sumiE from '../assets/david-emrich-VCM99u6HltA-unsplash copy.jpg';
import ink from '../assets/Texturelabs_InkPaint_369L.jpg';

import font from '../assets/fonts/KouzanBrushFontSousyo.ttf';

const vec2 = (n1, n2) => new THREE.Vector2(n1, n2);
const vec3 = (n1, n2, n3) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1, n2, n3, n4) => new THREE.Vector4(n1, n2, n3, n4);


const MainMenuBg = () => {
  const parchmentTex = useLoader(THREE.TextureLoader, parchment);
  parchmentTex.wrapS = parchmentTex.wrapT =  THREE.RepeatWrapping;
  const sumiETex = useLoader(THREE.TextureLoader, sumiE);
  sumiETex.wrapS = parchmentTex.wrapT =  THREE.RepeatWrapping;
  const inkTex = useLoader(THREE.TextureLoader, ink);
  inkTex.wrapS = inkTex.wrapT =  THREE.RepeatWrapping;

  return (
    <mesh scale={[0.00159, 0.00145, 1]} position={[1.8426, -1, 0]}>
      <planeGeometry args={[sumiETex.image.width, sumiETex.image.height]} />
      <shaderMaterial args={[Shader({map:sumiETex, map2:inkTex, useMap2:true, UVScale:vec2(1,1), UVOffset:vec2(0, 0), map2Scale:1, map2Color:vec3(-0.8,-0.8,-0.8), map2UVScale:vec2(0.4,0.4), map2UVOffset:vec2(0, 0.0), greyScale:true, greyOffset:0.2, greyRange:vec2(0.3, 0.5), greyMinCutoff:0.0 , greyMaxCutoff:2, map2MaxCutoff:-1, RGBOffset:vec3(-0.0, -0.0, -0.0), redRange:vec2(0.63,0.95), greenRange:vec2(0,0.6), blueRange:vec2(0,0.6), alpha:1, useColorSelect:false, negative:0}  )]} transparent={true} opacity={0.5} />
    </mesh>
  );
}

const GLUI = () => {
  const parchmentTex = useLoader(THREE.TextureLoader, parchment);
  parchmentTex.wrapS = parchmentTex.wrapT =  THREE.RepeatWrapping;
  const sumiETex = useLoader(THREE.TextureLoader, sumiE);
  sumiETex.wrapS = parchmentTex.wrapT =  THREE.RepeatWrapping;
  const inkTex = useLoader(THREE.TextureLoader, ink);
  inkTex.wrapS = inkTex.wrapT =  THREE.RepeatWrapping;
  return (
    <>
    <mesh position={[2.4,-1,1]} scale={[0.625, 0.625, 1]}>
      {/* <planeGeometry args={[parchmentTex.image.width, parchmentTex.image.height]} /> */}
      {/* <shaderMaterial args={[Shader({
        map:parchmentTex, 
        map2:inkTex, 
        useMap2:false, 
        UVScale:vec2(1,1 / (parchmentTex.image.width / parchmentTex.image.height)), 
        UVOffset:vec2(0, 0), 
        map2Scale:1, 
        map2Color:vec3(-0.93,-0.8,-0.8), 
        map2UVScale:vec2(1,1), 
        map2UVOffset:vec2(0, 0.0), 
        greyScale:true, 
        greyOffset:0.2, 
        greyRange:vec2(0.0, 1.0), 
        greyMinCutoff:0.0, 
        greyMaxCutoff:2, 
        map2MaxCutoff:-1, 
        RGBOffset:vec3(-0.0, -0.0, -0.0), 
        redRange:vec2(0.63,0.95), 
        greenRange:vec2(0,0.6), 
        blueRange:vec2(0,0.6), 
        alpha:1, 
        useColorSelect:false, 
        negative:0}  )]} 
        transparent={true} 
        opacity={1.0}  
      /> */}
      <Html wrapperClass='block absolute top-4 inset-x-0' transform distanceFactor={10}
        geometry=<planeGeometry args={[parchmentTex.image.width, parchmentTex.image.height]} />
        material=<shaderMaterial args={[Shader({
        map:parchmentTex, 
        map2:inkTex, 
        useMap2:false, 
        UVScale:vec2(1,1 / (parchmentTex.image.width / parchmentTex.image.height)), 
        UVOffset:vec2(0, 0), 
        map2Scale:1, 
        map2Color:vec3(-0.93,-0.8,-0.8), 
        map2UVScale:vec2(1,1), 
        map2UVOffset:vec2(0, 0.0), 
        greyScale:true, 
        greyOffset:0.2, 
        greyRange:vec2(0.0, 1.0), 
        greyMinCutoff:0.0, 
        greyMaxCutoff:2, 
        map2MaxCutoff:-1, 
        RGBOffset:vec3(-0.0, -0.0, -0.0), 
        redRange:vec2(0.63,0.95), 
        greenRange:vec2(0,0.6), 
        blueRange:vec2(0,0.6), 
        alpha:1, 
        useColorSelect:false, 
        negative:0}  )]} 
        transparent={true} 
        opacity={1.0}  
      />
       >
        <menu>
          <li><button><h1 className='text-md grayscale-0 font-bold text-japan-red hover:text-red-400'>About Me</h1></button></li>
          <li><button><h1 className='text-md font-bold text-japan-red hover:text-red-400' >About This Site</h1></button></li>
          <li><button><h1 className='text-md font-bold text-japan-red hover:text-red-400'>My Resume</h1></button></li>
          <li><button><h1 className='text-md font-bold text-japan-red hover:text-red-400'>Contact</h1></button></li>
        </menu>
      </Html>
    </mesh>
    </>
  );
}

export default GLUI;