import * as THREE from 'three';
import { useLoader, useThree, mesh, planeGeometry  } from '@react-three/fiber';
import { Shader } from "./shaders/shader";
import { Html, useVideoTexture } from "@react-three/drei";
import { Jitsuin } from '../components';
import parchment from '../assets/Texturelabs_Glass_151L.jpg';
import sumiE from '../assets/david-emrich-VCM99u6HltA-unsplash copy.jpg';
import ink from '../assets/Texturelabs_InkPaint_369L.jpg';
import natureScene from '../assets/165071 (720p).mp4';
import washi1 from '../assets/washi-edge-1.webp';
import washi2 from '../assets/washi-edge-2.webp';
import washi3 from '../assets/washi-edge-3.webp';
import washi4 from '../assets/washi-edge-4.webp';
import washi5 from '../assets/washi-edge-5.webp';
import washi6 from '../assets/washi-edge-6.webp';
import kakejiku from '../assets/kakejiku.png';


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

const GlUi = () => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const natureSceneTex = useVideoTexture(natureScene);
  natureSceneTex.wrapS = natureSceneTex.wrapT = THREE.RepeatWrapping;
  const parchmentTex = useLoader(THREE.TextureLoader, parchment);
  parchmentTex.wrapS = parchmentTex.wrapT =  THREE.RepeatWrapping;
  const sumiETex = useLoader(THREE.TextureLoader, sumiE);
  sumiETex.wrapS = parchmentTex.wrapT =  THREE.RepeatWrapping;
  const inkTex = useLoader(THREE.TextureLoader, ink);
  inkTex.wrapS = inkTex.wrapT =  THREE.RepeatWrapping;
  const washiTex1 = useLoader(THREE.TextureLoader, washi1);
  washiTex1.wrapS = washiTex1.wrapT = THREE.MirroredRepeatWrapping;
  const washiTex2 = useLoader(THREE.TextureLoader, washi2);
  washiTex2.wrapS = washiTex2.wrapT = THREE.MirroredRepeatWrapping;
  const washiTex3 = useLoader(THREE.TextureLoader, washi6);
  washiTex3.wrapS = washiTex2.wrapT = THREE.MirroredRepeatWrapping;
  const washiTex4 = useLoader(THREE.TextureLoader, washi5);
  washiTex4.wrapS = washiTex4.wrapT = THREE.MirroredRepeatWrapping;
  const kjTex = useLoader(THREE.TextureLoader, kakejiku);


  const scaleFactor = 0.00175;
  const topScale = vec3(0.415, 0.55, 1.0).multiplyScalar(scaleFactor);
  const leftScale = vec3(0.725, 0.6, 1.0).multiplyScalar(scaleFactor);
  const rightScale = vec3(.706, -0.6, 1.0).multiplyScalar(scaleFactor);
  const bottomScale = vec3(0.395, -0.55, 1.0).multiplyScalar(scaleFactor);

  const position = vec3(1.84, -1.15, -0.4);
  return (
    <>
    <mesh position={[position.x - 0.025, position.y + 0.3, position.z]} scale={[0.805 * scaleFactor, 0.8 * scaleFactor, 1]} rotation={new THREE.Euler(0, 0, 0)} >
      <planeGeometry args={[kjTex.image.width * dpr, kjTex.image.height * dpr]} />
      <shaderMaterial args={[Shader({
          map:kjTex, 
          map2:inkTex, 
          useMap2:true, 
          UVScale:vec2(1, 1), 
          UVOffset:vec2(0, 0.0), 
          map2Scale:1, 
          map2Color:vec3(-0.93,-0.8,-0.8), 
          map2UVScale:vec2(0.7, 0.7 / (inkTex.image.width / inkTex.image.height)), 
          map2UVOffset:vec2(0, 0.0),
          alphaMinCutoff:0.1, 
          greyScale:true, 
          greyOffset:0.0, 
          greyRange:vec2(0.0, 1.0),
          greyMinCutoff:0.0, 
          greyMaxCutoff:2, 
          map2MaxCutoff:-1, 
          RGBOffset:vec3(-0.0, -0.0, -0.0), 
          redRange:vec2(0.0,1.0), 
          greenRange:vec2(0,0.6), 
          blueRange:vec2(0,0.6), 
          alpha:1, 
          useColorSelect:false, 
          negative:0})]} 
          transparent={true} 
          opacity={1.0}
          wireframe={false}  
        />
    </mesh>
    <mesh position={[position.x - 0.015, position.y + 0.05, position.z + 0.1]} scale={[scaleFactor, scaleFactor, 1]} rotation={new THREE.Euler(0,0, 0)} renderOrder={7} >
      <planeGeometry args={[405 * dpr, 720 * dpr]} />
      <shaderMaterial args={[Shader({
        map:natureSceneTex, 
        map2:inkTex, 
        useMap2:true, 
        UVScale:vec2(1, 1), 
        UVOffset:vec2(0, 0.0), 
        map2Scale:1, 
        map2Color:vec3(-0.93,-0.8,-0.8), 
        map2UVScale:vec2(0.7, 0.7 / (inkTex.image.width / inkTex.image.height)), 
        map2UVOffset:vec2(0, 0.0), 
        greyScale:true, 
        greyOffset:0.5, 
        greyRange:vec2(0.0, 1.0),
        greyMinCutoff:0.0, 
        greyMaxCutoff:2, 
        map2MaxCutoff:-1, 
        RGBOffset:vec3(-0.0, -0.0, -0.0), 
        redRange:vec2(0.0,1.0), 
        greenRange:vec2(0,0.6), 
        blueRange:vec2(0,0.6), 
        alpha:0.7, 
        useColorSelect:false, 
        negative:0})]} 
        transparent={true} 
        opacity={1.0}
        wireframe={false}  
      />
      <Html position={[0,250,position.z + 0.45]} scale={[275,275,1]} occlude wrapperClass='block absolute top-4 inset-x-0' transform distanceFactor={10} >
        <menu>
          <li><button><h1 className='text-sm font-[lemon-tuesday] grayscale-0 font-bold text-japan-red hover:text-red-900'>About Me</h1></button></li>
          <li><button><h1 className='text-sm font-[lemon-tuesday] font-bold text-japan-red hover:text-red-900' >About This Site</h1></button></li>
          <li><button><h1 className='text-sm font-[lemon-tuesday] font-bold text-japan-red hover:text-red-900'>My Resume</h1></button></li>
          <li><button><h1 className='text-sm font-[lemon-tuesday] font-bold text-japan-red hover:text-red-900'>Contact</h1></button></li>
        </menu>
      </Html>
       <Html position={[position.x - 275,position.y - 600,position.z + 0.40000001]} scale={[150,150,1]} transform occlude>
        <Jitsuin />
      </Html>
    </mesh>
    </>
  );
}

export default GlUi;