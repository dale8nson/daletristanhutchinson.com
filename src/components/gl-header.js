import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js';
import {BasicShader} from 'three/examples/jsm/shaders/BasicShader';
import { ACESFilmicToneMappingShader } from 'three/examples/jsm/shaders/ACESFilmicToneMappingShader';
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader';
import { FilmShader } from 'three/examples/jsm/shaders/FilmShader';
import { Lensflare } from 'three/examples/jsm/objects/Lensflare';
import paintMask from '../images/paint-mask.png';
import bg from '../assets/zen-panorama-bg.webp';
import stones from '../assets/stones-2065410.webp';
import stoneBump from '../assets/stones-2065410-depth-map.webp'
import glass from '../images/frosted-glass-displacement.webp'
import wood from '../assets/wood-grain-ttb.png'
import washi from '../assets/washi.png';
import filmGrain from '../assets/Film Grain Vector-02.svg';
import woodMask from '../assets/wood-masked.png'
import woodAo from '../assets/wood-ao.png'
import paper from '../assets/white-wall.png'
import luminence from '../assets/paint-luminance.webp';
import dthMask from '../assets/dth-mask.png'
import metal from '../assets/everytexture.com-stock-metal-texture-00139-bump-2048.jpg'

import './scss/_gl-header.scss';
import SVG from '../assets/dth-union2.svg';
import {Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';


const GLHeader = (props) => {
  const { gl } = useThree();
  const size = new THREE.Vector2();
  gl.getSize(size);
  console.log(`gl size:`, size)

  const stoneBumpTex = useLoader(THREE.TextureLoader, filmGrain);
  stoneBumpTex.wrapS = THREE.RepeatWrapping;
  stoneBumpTex.wrapT = THREE.RepeatWrapping;
  const woodAoTex = useLoader(THREE.TextureLoader, woodAo);
  const bgTexture = useLoader(THREE.TextureLoader, bg);
  console.log(`bg:`, bg);

  const canvasRef  = useRef(null);


  const shader = (bgTex, mask, size) => {
    return {
    uniforms: {
      bgTex: { value: bgTex},
      size: {value: size }
    },
    vertexShader: `
    
    in vec4 aTexCoord0;
    out vec2 vST;
    varying vec2 vUv;

    void main(void) {
      vST = aTexCoord0.xy;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  }`,
  fragmentShader: `
    
    uniform sampler2D bgTex;
    uniform vec2 size;

    in vec2 vST;

    varying vec2 vUv;
    
    void main()
    {
      
      vec2 fragCoord = gl_FragCoord.xy;

      float normalX = fragCoord.x / size.x;
      float normalY = fragCoord.y / size.y;

      vec2 normalVUv = vec2(normalX, normalY);
      
      vec3 bgCol = texture2D( bgTex, normalVUv ).rgb;

      float red = 1.0 - bgCol.r;
      float green = 1.0 - bgCol.g;
      float blue = 1.0 - bgCol.b;

      gl_FragColor = vec4(red, green, blue, 1.0);
      
    }`

  }
}

  const SVGData = useLoader(SVGLoader, SVG);
  console.log(`SVGData: `, SVGData);
  const strokePaths = SVGData.paths.filter(path => path.userData.node.id.match(/p-\d+/));
  console.log(`strokePaths:`,strokePaths);
  const shapes = SVGData.paths.flatMap(shapePath => SVGLoader.createShapes(shapePath));

  console.log(`shapes:`, shapes);
    gl.getSize(size);
    console.log(`DTHExtrude gl width: ${size.width}, height: ${size.height}`);
    
    let extrudeGeometry = new THREE.ExtrudeGeometry(shapes, {
      // curveSegments:40,
      steps: 50,
      depth:0.01,
      bevelThickness:0.03,
      bevelSegments: 2,
      bevelEnabled: true
    });
    
    extrudeGeometry = BufferGeometryUtils.mergeGroups(extrudeGeometry);
    // extrudeGeometry.scale(0.15, -0.15, 1);
    extrudeGeometry.scale(0.24, -0.24, 0.24);
    extrudeGeometry.center();
    extrudeGeometry.translate(0,0,1);

    console.log(`extrudeGeometry:`, extrudeGeometry);

    const bgFramebufferTex = new THREE.FramebufferTexture(size.width, size.height);

    gl.copyFramebufferToTexture(new THREE.Vector2(0,0), bgFramebufferTex)
    console.log(`bgFrameBufferTex:`, bgFramebufferTex);

    const filmNegativeMaterial =  new THREE.ShaderMaterial(shader(bgFramebufferTex, null, size));
    filmNegativeMaterial.uniformsNeedUpdate = true;

    // console.log(`JPRed: `, JPRed);

    const bevelMaterial = new THREE.MeshBasicMaterial({color:0x555555, transparent: true, opacity: 0.8});
    gl.getSize(size);
    console.log(`bg Plane Geometry size: `, size);
    const bgGeometry = new THREE.PlaneGeometry(size.width, size.height, 1, 1);
    console.log(`bgGeometry:`, bgGeometry);
    bgGeometry.scale(0.05, 0.05, 1);
    bgGeometry.computeBoundingBox();
    bgGeometry.center();

    const bgMaterial = new THREE.MeshStandardMaterial({ map:bgTexture, transparent: false, opacity:1.0 });
    const bgBumpMaterial = new THREE.MeshStandardMaterial({map: bgFramebufferTex, bumpMap: stoneBumpTex, bumpScale:10, transparent: true, opacity: 0.6});
    console.log(`bgBumpMaterial:`, bgBumpMaterial);

    const fgBeforeRenderHandler = (renderer, scene, camera, geometry, material, group) => {
      if(!material.isShaderMaterial) return;
      renderer.copyFramebufferToTexture(new THREE.Vector2(0,0), bgFramebufferTex);
      material.uniforms.bgTex.value = bgFramebufferTex;
      material.uniformsNeedUpdate = true;
      bgBumpMaterial.map = bgFramebufferTex;
      bgBumpMaterial.uniformsNeedUpdate = true;
    }

    const bgRef = useRef(null);

    let bgAnimMixer, panKeyframeTrack, bgAnimClip, bgPanAction;
    
    const setupBgAnim = (node) => {   
        bgRef.current = node;
        bgAnimMixer = new THREE.AnimationMixer(node);
        panKeyframeTrack = new THREE.NumberKeyframeTrack('.position[x]',[0,30,60], [0,5,0]);
        bgAnimClip = new THREE.AnimationClip('BgPan', 60, [panKeyframeTrack]);
        bgPanAction = bgAnimMixer.clipAction(bgAnimClip);
        bgPanAction.play();
        console.log(`bgPanAction:`, bgPanAction);
        animate();
    }

    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);
      bgAnimMixer.update(clock.getDelta());
    }

  return (
    <>
        <ambientLight  intensity={0.6} />
        <directionalLight position={new THREE.Vector3(-40,0,-5)} args={[0x777777, 1]} castShadow={false} target={new THREE.Object3D()}/>
        <directionalLight position={new THREE.Vector3(40,0,-5)} args={[0x777777, 1]} castShadow={false} />

        <mesh geometry={bgGeometry} material={bgMaterial} renderOrder={1} name='bg' ref={setupBgAnim}/>
        <mesh geometry={extrudeGeometry} material={[filmNegativeMaterial, bevelMaterial]} onBeforeRender={fgBeforeRenderHandler} renderOrder={15} castShadow={true} ref={(node) => console.log(`fg Node:` , node)} />
    </>
    
  )
}

export default GLHeader;