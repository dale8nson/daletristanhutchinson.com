import * as React from 'react';
import { useRef, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useLoader, useThree, planeGeometry, useFrame } from '@react-three/fiber';
import { StdShader, HtmlShader } from "./shaders/shader";
import { Html, useVideoTexture, Text, OrbitControls, CameraControls } from "@react-three/drei";
import { Jitsuin } from '../components';
import Dispatcher from '../dispatcher';
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
import glass from '../assets/TCom_WindowsOther0024_S.jpeg';
import autumnLeaves from '../assets/pexels_videos_1777892 (720p).mp4'


const vec2 = (n1, n2) => new THREE.Vector2(n1, n2);
const vec3 = (n1, n2, n3) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1, n2, n3, n4) => new THREE.Vector4(n1, n2, n3, n4);

const GlUi = ({dispatch, registerEventListener}) => {
  // console.log(`dispatch:`, dispatch);
  const { gl, camera, scene } = useThree();
  // console.log(`gl:`, gl);
  const dpr = gl.getPixelRatio();
  const size = vec2(0,0);
  gl.getSize(size);

  const natureSceneTex = useVideoTexture(natureScene);
  natureSceneTex.wrapS = natureSceneTex.wrapT = THREE.RepeatWrapping;
  const parchmentTex = useLoader(THREE.TextureLoader, parchment);
  parchmentTex.wrapS = parchmentTex.wrapT = THREE.RepeatWrapping;
  const sumiETex = useLoader(THREE.TextureLoader, sumiE);
  sumiETex.wrapS = parchmentTex.wrapT = THREE.RepeatWrapping;
  const inkTex = useLoader(THREE.TextureLoader, ink);
  inkTex.wrapS = inkTex.wrapT = THREE.RepeatWrapping;
  const washiTex1 = useLoader(THREE.TextureLoader, washi1);
  washiTex1.wrapS = washiTex1.wrapT = THREE.MirroredRepeatWrapping;
  const washiTex2 = useLoader(THREE.TextureLoader, washi2);
  washiTex2.wrapS = washiTex2.wrapT = THREE.MirroredRepeatWrapping;
  const washiTex3 = useLoader(THREE.TextureLoader, washi6);
  washiTex3.wrapS = washiTex2.wrapT = THREE.MirroredRepeatWrapping;
  const washiTex4 = useLoader(THREE.TextureLoader, washi5);
  washiTex4.wrapS = washiTex4.wrapT = THREE.MirroredRepeatWrapping;
  const kjTex = useLoader(THREE.TextureLoader, kakejiku);
  const glassTex = useLoader(THREE.TextureLoader, glass);
  glassTex.wrapS = glassTex.wrapT = THREE.RepeatWrapping;
  const akiTex = useVideoTexture(autumnLeaves);
  akiTex.format = THREE.RGBAFormat;
  akiTex.wrapS = akiTex.wrapT = THREE.RepeatWrapping;

  const mmRef = useRef(null);
  const pictureRef = useRef(null);
  const htmlRef = useRef(null);
  const htmlMaterialRef = useRef(null);
  const htmlMainMenuRef = useRef(null);

  let mmMixer = null, mmAlphaTrack, mmClip, mmFadeIn;

  mmAlphaTrack = new THREE.NumberKeyframeTrack('.opacity', [0, 14, 15], [0, 0, 1]);
  mmClip = new THREE.AnimationClip('', 15, [mmAlphaTrack]);

  const htmlFrameBuffer = new THREE.FramebufferTexture(size.x * dpr, size.y * dpr);
  htmlFrameBuffer.wrapS = htmlFrameBuffer.wrapT = THREE.RepeatWrapping;
  htmlFrameBuffer.format = THREE.RGBAFormat;
  // const htmlFrameBufferOffset = vec2(size.width / 2 - htmlFrameBuffer.image.width / 2, size.height / 2 - htmlFrameBuffer.image.height / 2);
  const htmlFrameBufferOffset = vec2(0, 0);
  // console.log(`htmlFrameBuffer:`, htmlFrameBuffer);
  const htmlRenderTarget = new THREE.WebGLRenderTarget();
  const htmlScene = new THREE.Scene();
  const htmlRenderer = gl;
  const htmlCamera = camera.clone();
  const ambientLight = new THREE.AmbientLight(0xee0000, 1.0);
  
  const renderHtml = (renderer, html) => {
    renderer.copyFrameBufferToTexture(htmlFrameBufferOffset, htmlFrameBuffer);
  }
  
  const initUI = useCallback(node => {
    if (!node) return;

    mmRef.current = node;
    const nodeRef = mmRef.current;

    if (!Object.hasOwn(nodeRef, 'opacity')) {
      Object.defineProperties(nodeRef, {
        _opacity: {
          value: 1.0,
          writable: true
        },
        opacity: {
          get() { return this._opacity; },
          set(val) {
            this.traverse(node => {
              if (node.material) {
                // console.log(`node.material:`, node.material);
                if (node.isMesh && node.material.uniforms?.opacity?.value) {
                  node.material.uniforms.opacity.value = val;
                  node.material.uniformsNeedUpdate = true;
                }
                if (!node.isMesh && node.style) {
                  node.style.opacity = val;
                }
              }
            });
            this._opacity = val;
            // console.log(`opacity: ${val}`);
          }
        }
      })
    }

    // console.log(`mmRef.current:`, nodeRef);

    mmMixer = new THREE.AnimationMixer(nodeRef);
    mmFadeIn = mmMixer.clipAction(mmClip);
    mmFadeIn.clampWhenFinished = true;
    mmFadeIn.loop = THREE.LoopOnce;
    // mmFadeIn.play();
  }, []);

  const initHtml = node => {
    if(!node) return;
    htmlRef.current = node;
    // console.log(`htmlRef.current:`, htmlRef.current);
    gl.copyFramebufferToTexture(htmlFrameBufferOffset, htmlFrameBuffer);
  };

  const htmlOnOcclude = visible => {
    // console.log(`visible:`, visible);
    // if(visible) {
    //   htmlRef.current.classList.add('opacity-0');
    // }
    if(!visible) {
      htmlRef.current.classList.remove('opacity-0');
    }
  }

  const htmlBeforeRender = (renderer, scene, camera, geometry, material, group) => {
    if (htmlRef.current) {
      renderer.copyFramebufferToTexture(htmlFrameBufferOffset, htmlFrameBuffer);
    }
  }

  let camMixer, m2gCamXTrack, m2gCamYTrack, m2gCamZTrack, m2gCamYRotTrack, m2gCamClip, moveToGarden;
  m2gCamXTrack = new THREE.NumberKeyframeTrack('.position[x]',[0,2,4],[2,-13,-13]);
  m2gCamZTrack = new THREE.NumberKeyframeTrack('.position[z]',[0,2,4],[2,2,-3.4]);
  m2gCamClip = new THREE.AnimationClip('', 4, [m2gCamXTrack, m2gCamZTrack]);
  camMixer = new THREE.AnimationMixer(camera);
  moveToGarden = camMixer.clipAction(m2gCamClip);
  moveToGarden.setLoop(THREE.LoopOnce);
  moveToGarden.clampWhenFinished = true;

  const aboutMeRef = useRef(null);

  const initAboutMe = node => {
    if(!node) return;
    aboutMeRef.current = node;
    // console.log(`aboutMeRef.current:`, aboutMeRef.current)
    registerEventListener('show-about-me', () => {
      aboutMeRef.current.classList.remove('hidden');
      aboutMeRef.current.classList.remove('blur');
      aboutMeRef.current.classList.add('opacity-100');
    })
  }

  const onAboutMeClick = e => {
    moveToGarden.play();
    dispatch('open-left-shoji');
  };


  useFrame((_, delta) => {
    mmRef.current && mmMixer?.update(delta);
    camMixer?.update(delta);
  }
  );

  // const scaleFactor = 0.00175;
  const scaleFactor = 1;

  const topScale = vec3(0.415, 0.55, 1.0).multiplyScalar(scaleFactor);
  const leftScale = vec3(0.725, 0.6, 1.0).multiplyScalar(scaleFactor);
  const rightScale = vec3(.706, -0.6, 1.0).multiplyScalar(scaleFactor);
  const bottomScale = vec3(0.395, -0.55, 1.0).multiplyScalar(scaleFactor);

  const position = vec3(1.84, -1.15, -0.4);

  return (
    <group  position={[position.x, position.y, position.z]}>
      <mesh position={[0,0.4, 0]} scale={[.0015, .0015, 1]} rotation={new THREE.Euler(0, 0, 0)} >
        <planeGeometry args={[kjTex.image.width * dpr, kjTex.image.height * dpr]} />
        <shaderMaterial args={[StdShader({
          map: kjTex,
          map2: inkTex,
          useMap2: true,
          UVScale: vec2(1, 1),
          UVOffset: vec2(0, 0.0),
          map2Scale: 0.4,
          map2Color: vec3(-0.93, -0.8, -0.8),
          map2UVScale: vec2(1, 1 / (inkTex.image.width / inkTex.image.height)),
          map2UVOffset: vec2(0, 0.0),
          alphaMinCutoff: 0.1,
          greyScale: true,
          greyOffset: 0.0,
          greyRange: vec2(0.3, 0.8),
          greyMinCutoff: 0.0,
          greyMaxCutoff: 2,
          map2MaxCutoff: -1,
          RGBOffset: vec3(-0.0, -0.0, -0.0),
          redRange: vec2(0.0, 1.0),
          greenRange: vec2(0, 0.6),
          blueRange: vec2(0, 0.6),
          alpha: 1,
          opacity: 1,
          useColorSelect: false,
          negative: 0
        })]}
          transparent={true}
          wireframe={false}
        />
      </mesh>
      <mesh position={[-0,0.2,0.001]} scale={[.0018, .0018, 1]} rotation={new THREE.Euler(0, 0, 0)} renderOrder={7}  >
        <planeGeometry args={[405 * dpr, 720 * dpr]} />
        <shaderMaterial args={[HtmlShader({
          map:htmlFrameBuffer, 
          map2:inkTex, 
          useMap2:true, 
          UVScale:vec2(1, 1), 
          UVOffset:vec2(0, 0.0), 
          map2Scale:0.3, 
          map2UVScale:vec2(1,1 / (inkTex.image.width / inkTex.image.height)), 
          map2UVOffset:vec2(0,0),
          useMap3:true,
          map3:natureSceneTex,
          map3UVScale: vec2(1,1),
          greyScale:true,
          greyOffset:0.4, 
          greyRange:vec2(0.0, 1.0),
          greyMinCutoff:0.0, 
          greyMaxCutoff:2, 
          map2MaxCutoff:-1, 
          RGBOffset:vec3(-0.0, -0.0, -0.0), 
          redRange:vec2(0.0,1), 
          greenRange:vec2(0,1), 
          blueRange:vec2(0.0,1), 
          alpha:1,
          opacity: 1,  
          negative:0})]} 
          transparent={true} 
          wireframe={false}
          side={THREE.DoubleSide}
          
        /> 
        <Html className='transition-opacity [transition-duration:3s] [transition-delay:2s] opacity-0' position={[-15, 200, 0.00001]} scale={[275, 275, 1]} onOcclude={htmlOnOcclude} occlude transform distanceFactor={10} ref={initHtml}>         
            <menu style={{ zIndex: 100 }}>
              <li><button onClick={onAboutMeClick}><span className='text-sm font-[lemon-tuesday] grayscale-0 font-bold text-japan-red hover:text-red-900'>About Me</span></button></li>
              <li><button><span className='text-sm font-[lemon-tuesday] font-bold text-japan-red hover:text-red-900' >About This Site</span></button></li>
              <li><button><span className='text-sm font-[lemon-tuesday] font-bold text-japan-red hover:text-red-900'>My Resume</span></button></li>
              <li><button><span className='text-sm font-[lemon-tuesday] font-bold text-japan-red hover:text-red-900'>Contact</span></button></li>
            </menu>   
        </Html>
        <Html position={[-380, -300, .00001]} scale={[150, 150, 1]} transform side={THREE.DoubleSide} renderOrder={10}>
          <Jitsuin />
        </Html>
      </mesh>
      <mesh >
        {/* <planeGeometry args={[2,2]} /> */}
        {/* <shaderMaterial args={[StdShader({map:, UVScale:vec2(2,2), bokeh:true, greyScale:true, opacity:0.3})]} /> */}
        {/* <Html position={[-16.43, 1.75, -5.15]} scale={[3.25, 3.75, 1]} className='w-[53vw] h-[100vh] text-left text-[7em] p-3 text-white [text-shadow:_2px_2px_rgb(237.15_0_0_/_100%)] bg-opacity-60  [tansition-property: visibility, --tw-backdrop-blur] duration-[1500ms] blur delay-[5s] overflow-y-auto' ref={initAboutMe} transform occlude >
        <div className='[writing-mode:vertical-rl] m-auto font-[kouzan-brush]' >
        <p className='p-4' >
          この道や
          <br />
          &nbsp;行く人なしに
          <br />
          &nbsp;&nbsp;&nbsp;秋の暮
        </p>
        </div>
        </Html> */}
      </mesh>
    </group>
  );
}

export default GlUi;