import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import bg from '../assets/zen-panorama-bg-cropped.webp';
import './scss/_gl-header.scss';
import SVG from '../assets/dth-union2.svg';
import glass from '../assets/Texturelabs_Glass_154L.jpg';
import {useLoader, useThree, useFrame } from '@react-three/fiber';
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
// import { Slider, Label } from '@fluentui/react';

const Vec2 = (n1 = null, n2 = null) => new THREE.Vector2 (n1, n2);
const Vec3 = (n1 = null, n2 = null, n3 = null) => new THREE.Vector3(n1, n2, n3);
const Vec4 = (n1 = null, n2 = null, n3 = null, n4 = null) => new THREE.Vector4(n1, n2, n3, n4);

const headerHeightScale = 0.1;

const screenToWorld = (sX, sY) => {

}


const GLHeader = () => {
  const { gl, camera } = useThree();
  const dpr = gl.getPixelRatio();
  const mgRef = useRef(null);
  const bgRef = useRef(null);
  const txtRef = useRef(null);
  const oX = useRef(0.0);
  
  // // console.log(`gl: `, gl);
  const size = new THREE.Vector2();
  gl.getSize(size);
  console.log(`size:`, size);
  const viewPort = Vec4();
  gl.getViewport(viewPort);
  console.log(`viewPort:`, viewPort);
  console.log(`dpr: ${dpr}`);

  const txtScale = Vec3(0.0775, -0.055,1.7);
// let txtScale;

  const glassTex = useLoader(THREE.TextureLoader, glass);
  glassTex.wrapS = glassTex.wrapT = THREE.MirroredRepeatWrapping;

  // // console.log(`gl size:`, size)

  const bgTexture = useLoader(THREE.TextureLoader, bg);
  // const bgTexture = useLoader(THREE.TextureLoader, '../assets/zen-panorama-bg.webp#xywh=percent:10,0,90,100');

  bgTexture.wrapS = THREE.MirroredRepeatWrapping;
  bgTexture.wrapT = THREE.MirroredRepeatWrapping;
  //  console.log(`bgTexture:`, bgTexture);
  const bgTexHtSc = (size.width * headerHeightScale) / bgTexture.image.height;
  const szHtSc = bgTexture.image.height / (size.width * headerHeightScale);
  console.log(`size.width: ${size.width}\nsize.width * headerHeightScale: ${size.width * headerHeightScale}\nbgTexture.image.height: ${bgTexture.image.height}\nbgTexHtSc: ${bgTexHtSc}`);

  const mgHeightUnit = (bgTexture.image.width / bgTexture.image.height);
  console.log(`mgHeightUnit: ${mgHeightUnit}`);
  const mgPosY = mgHeightUnit;
  console.log(`mgPosY: ${mgPosY}`);

  const planeShader = (bgTex) => {
    return {
      uniforms: {
        bgTex: { value: bgTex },
        glassMap: {value: glassTex},
        x: {value: 0.0},
        sX: { value: 1.0 },
        sY: { value: 1.0 },
        oX: { value: 0.0 },
        oY: { value: 0.0 },
        neg: { value: 0.0 },
        coR: { value: 0.0 },
        coG: { value: 0.0 },
        coB: { value: 0.0 }
      },

      vertexShader: `
    
    uniform sampler2D bgTex;
    uniform sampler2D staticBg;
  
    varying vec2 vUv;
    varying vec4 pos;
    varying vec3 norm;
  
    void main(void) {
      
      vUv = uv;
      
      pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  
      gl_Position = pos;
  
  }`,
  
      fragmentShader: `
    
    uniform sampler2D bgTex, glassMap;
    uniform float sX, sY;
    uniform float oX, oY;
    uniform float x, neg;
    uniform float coR, coG, coB;
  
    varying vec2 vUv;
    varying vec4 pos;
    varying vec3 norm;
  
    void main()

    {
      float alpha = 1.0;
      ivec2 texSz = textureSize(bgTex, 0);
      float texScale = intBitsToFloat(texSz.x) / intBitsToFloat(texSz.y);
      ivec2 glassTexSz = textureSize(glassMap, 0);
      float glassScale = intBitsToFloat(glassTexSz.x) / intBitsToFloat(glassTexSz.y);

      vec2 vScaled = vec2((vUv.x) * sX + oX, vUv.y * sY + oY);
      vec4 bgCol = texture2D(bgTex, vScaled);

      vec2 glassScaled = vec2((vUv.x) * 8.0 + (mod(oX, 5.0) == 0.0 ? .2 : 0.5) , vUv.y * 1.0);
      vec4 glassCol = texture2D(glassMap, glassScaled);

      float red = bgCol.r - neg * (bgCol.r - (1.0 - bgCol.r));
      float green = bgCol.g - neg * (bgCol.g - (1.0 - bgCol.g)) + coG;
      float blue = bgCol.b - neg * (bgCol.b - (1.0 - bgCol.b)) + coB;

      if (glassCol.r > 0.2) {
        red -= glassCol.r * 0.2;
        green -= glassCol.g * 0.2;
        blue -= glassCol.b * 0.2;

        // alpha = glassCol.r * 0.8;
        // discard;
      }
  
      gl_FragColor = vec4(red, green, blue, alpha);
      // gl_FragColor = vec4(0.93, 0.0, 0.0, 0.5);
  
    }`,
      transparent: true,
      // opacity:1.0
    }
  }
  
  const textShader = (bgTex, map) => {
    return {
    uniforms: {
      bgTex: { value: bgTex},
      map: { value: map},
      glassMap: { value: glassTex},
      size: { value: null},
      coR: {value: 0.0 },
      coG: { value: 0.0},
      coB: { value: 0.0},
      isNegative: {values: true},
      neg: { value: 0.0},
      sX: {value: 1.0},
      sY: {value: 1.0},
      oX: { value: 0.0},
      oY: {value: 0.0}
  
    },
    vertexShader: `
  
    varying vec2 vUv;
    varying vec4 pos;
  
    void main(void) {
      
      vUv = uv;
      pos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  
      gl_Position = pos;
  
  }`,
  
  fragmentShader: `
    
    uniform sampler2D bgTex;
    uniform sampler2D map;
    uniform sampler2D glassMap;
    uniform float sX, sY, x;
    uniform float oX, oY;
    uniform float neg;
    uniform float coR, coG, coB;
    uniform vec2 size;
  
    varying vec2 vUv;
    varying vec4 pos;
    
    void main()
    {
      ivec2 texSz = textureSize(glassMap, 0);
      float glassScaleVec = intBitsToFloat(texSz.x) / intBitsToFloat(texSz.y);
    
      vec2 vScaled = vec2((vUv.x / size.x) * sX + oX, (vUv.y / size.y) * sY + oY);
      float redC, greenC, blueC;
      
      // vec4 bgCol = texture2D(bgTex, vScaled);
      // vec4 fgCol = texture2D(map, vScaled);

      vec2 scaled = vec2(vUv.x * sX + oX, vUv.y * sY + oY);

      vec4 bgCol = texture2D(bgTex, scaled );
      vec4 fgCol = texture2D(map, scaled );

      vec2 glassScaled = vec2((vUv.x / intBitsToFloat(texSz.x)) * 1.0, (vUv.y / intBitsToFloat(texSz.y)) * (1.0 / glassScaleVec));
      // vec2 glassScaled = vec2(vUv.x * 8.0 , vUv.y * 1.0);

      vec4 glassCol = texture2D(glassMap, glassScaled);
  
      float red, green, blue, alpha;

      alpha = 1.0;
  
      // if (fgCol.r < 0.01) {
      //   discard;
      // }
    
      float redOffset = 0.0; 
    //  if (fgCol.r < 0.6) {
    //     redOffset = .6;         
    //   }
       
    // + 0.0 * (0.5 - sqrt(exp2(0.5 - bgCol.r)))
    // + 0.0 * (0.5 - sqrt(exp2(0.5 - bgCol.g)))
    // + 0.0 * (0.5 - sqrt(exp2(0.5 - bgCol.b)))
      red = 1.0 - bgCol.r + 0.0 * (bgCol.r > 0.5 ? -0.1 : 0.2) + redOffset ;          // + 0.5 == sakura
      green = 1.0 - bgCol.g + 0.0 * (bgCol.g > 0.5 ? -0.1 : 0.2)  - redOffset;        // + 0.2 == matcha    r + g = orange
      blue = 1.0 -  bgCol.b + 0.0 * (bgCol.b > 0.5 ? -0.1 : 0.2) - redOffset;
      
      redC = 1.0 - bgCol.r;
      greenC = 1.0 - bgCol.g;
      blueC = 1.0 - bgCol.b;

      float redCDiff, greenCDiff, blueCDiff;

      redCDiff = fgCol.r - redC;
      greenCDiff = fgCol.g - greenC;
      blueCDiff = fgCol.b - blueC;

      float redIncr, greenIncr, blueIncr;

      redIncr = 0.1 * redCDiff;
      greenIncr = 0.1 * greenCDiff;
      blueIncr = 0.1 * blueCDiff;

      // red = fgCol.r + redIncr;
      // green = fgCol.g + greenIncr;
      // blue = fgCol.b + blueIncr;

      if (glassCol.r > 0.2) {
        red -= glassCol.r * 0.3;
        green -= glassCol.g * 0.3;
        blue -= glassCol.b * 0.3;
        // alpha -= 1.0 - glassCol.r;
        // discard;
      }
      red = 1.0 - fgCol.r + 0.025;
      green = 1.0 - fgCol.g + 0.025;
      blue = 1.0 - fgCol.b + 0.025;

      gl_FragColor = vec4(red, green, blue, alpha);
      // gl_FragColor = vec4(0.933, 0.0, 0.0, neg);
  
    }`
  
    }
  }

  const SVGData = useLoader(SVGLoader, SVG);
  //  console.log(`SVGData: `, SVGData);
  const shapes = SVGData.paths.flatMap(shapePath => SVGLoader.createShapes(shapePath).map(shape => {
    shape.autoClose = true;
    return shape;
  }));
  // console.log(`shapes:`, shapes);
    
    // const bgFramebufferTex = new THREE.FramebufferTexture(bgTexture.image.width, bgTexture.image.height);
    const bgFramebufferTex = useMemo(() => {
      
    const tex = new THREE.FramebufferTexture(size.width * dpr, size.width * dpr);
    // const tex = new THREE.FramebufferTexture(bgTexture.image.width * 0.0014, bgTexture.image.height * 0.000336 / (bgTexture.image.width / bgTexture.image.height));
    tex.format = THREE.RGBAFormat;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;

    return tex;
    }, [size.width]);
 
    // console.log(`bgFrameBufferTex:`, bgFramebufferTex);
    // let textGeometry = new THREE.ExtrudeGeometry(shapes,
    //   {
    //     curveSegments:20,
    //     steps: 50,
    //     depth:0.01,
    //     bevelThickness:0.01,
    //     bevelSegments: 3,
    //     bevelEnabled: true
    //   });

    // textGeometry = BufferGeometryUtils.mergeGroups(textGeometry);
    // textGeometry.scale(.06, -.25, 1);
    // textGeometry.center();
    // const textSize = Vec3();
    // textGeometry.translate(0,0,1);
    // textGeometry.computeBoundingBox();
    // textGeometry.boundingBox.getSize(textSize);
    
    // const textMaterial = new THREE.MeshBasicMaterial({transparent:true, opacity:1,  wireframe:false, color:0xffffff});
    // const bevelMaterial = new THREE.MeshBasicMaterial({color:0x777777, transparent: true, opacity: 1});

    // const textRenderTarget = new THREE.WebGLRenderTarget(size.x / 1.4, size.x * 0.15 / 1.4);
    // const textRenderTarget = new THREE.WebGLRenderTarget(size.width,size.width * 0.13);
    // textRenderTarget.texture.wrapS = textRenderTarget.texture.wrapT = THREE.MirroredRepeatWrapping;

    // const textCamera = camera.clone();
    // textCamera.lookAt(0,0,0); 
    // const textScene = new THREE.Scene();
    
    // gl.setRenderTarget(textRenderTarget,0);

    // const textMesh = useMemo(() => new THREE.Mesh(textGeometry, [textMaterial, bevelMaterial]), [textGeometry, textMaterial, bevelMaterial]);

    // const txtDirectLt1 = new THREE.DirectionalLight(0xffffff, 1.2);
    // txtDirectLt1.translateX(-40);
    // const txtDirectLt2 = new THREE.DirectionalLight(0xffffff, 1.2);
    // txtDirectLt2.translateX(40);

    // textScene.add(txtDirectLt1);
    // textScene.add(txtDirectLt2);
    // textScene.add(textMesh);
    // gl.render(textScene, textCamera);
    // gl.setRenderTarget(null);
    // console.log(`textRenderTarget.texture:`, textRenderTarget.texture);
    
    const bgFramebufferOffset = useMemo(() => new THREE.Vector2(0,(size.height * dpr - bgFramebufferTex.image.height * headerHeightScale / (camera.position.z / (5 - 1.25))), [bgFramebufferTex.image.height, size.height]));

    const bgBeforeRenderHandler = (renderer, scene, camera, geometry, material, group) => {
    //   if(!material || !material.isShaderMaterial) return;
    //   // console.log(`neg:`, textRef.current.neg);
    //   renderer.copyFramebufferToTexture(bgFramebufferOffset, bgFramebufferTex);
      oX.current = bgRef.current.oX;
      material.uniforms.oX.value = oX.current;
      // console.log(`material.uniforms.x:`, material.uniforms.x);
      material.uniformsNeedUpdate = true;
    //   material.uniforms.bgTex.value = bgFramebufferTex;
    //   material.uniformsNeedUpdate = true;

      // midPlaneRef.current.material.uniforms.bgTex.value = bgFramebufferTex;
      // midPlaneRef.current.uniformsNeedUpdate = true;

      // console.log(`mg geometry:`, geometry);
    }

    const txtBeforeRender = (renderer, scene, camera, geometry, material, group) => {
      if(!material.isShaderMaterial) return;
      renderer.copyFramebufferToTexture(bgFramebufferOffset, bgFramebufferTex);
      material.uniforms.bgTex.value = bgFramebufferTex;
      material.uniformsNeedUpdate = true;
      // console.log(`txtRef.current:`, txtRef.current);
    }

    let bgAnimMixer, bgPanAction, panKeyframeTrack, bgAnimClip;
    panKeyframeTrack = useMemo(() => new THREE.NumberKeyframeTrack('.oX',[0,30, 40, 70], [0,0.5,0.5,0], THREE.InterpolateSmooth), []);
    // panKeyframeTrack = new THREE.NumberKeyframeTrack('.oX',[0,35,70], [0,1.5,0], THREE.InterpolateSmooth);
    const textNegKeyframeTrack = useMemo(() => new THREE.NumberKeyframeTrack('.neg', [0, 17.5, 35, 52.5, 70], [0.0, 1.0, 0.0, 1.0, 0.0], THREE.InterpolateSmooth), []);
    const textCoRTrack = useMemo(() => new THREE.NumberKeyframeTrack('.coR', [0, 17.5, 35, 52.5, 70], [0.0, 0.5, 0.0, 0.5, 0.0]), []);
    bgAnimClip = useMemo(() => new THREE.AnimationClip('BgPan', 70, [panKeyframeTrack, textNegKeyframeTrack, textCoRTrack]), [panKeyframeTrack]);
    // bgAnimClip = new THREE.AnimationClip('BgPan', 70, [panKeyframeTrack]);

    const setupBg = (node) => {
      if(!node) return;
      bgRef.current = node;
      const refNode = bgRef.current;
      
        if (!Object.hasOwn(refNode, 'oX')) {
          Object.defineProperty(refNode, 'oX', {
            get() { return this.material.uniforms.oX.value; },
            set(value) { this.material.uniforms.oX.value = value; }
          });

          Object.defineProperty(refNode, 'neg', {
            get() { return this.material.uniforms.neg.value; },
            set(value) { this.material.uniforms.neg.value = value; }
          });
  
          Object.defineProperty(refNode, 'coR', {
            get() { return this.material.uniforms.coR.value; },
            set(value) { this.material.uniforms.coR.value = value; }
          });
  
          Object.defineProperty(refNode, 'coG', {
            get() { return this.material.uniforms.coG.value; },
            set(value) { this.material.uniforms.coG.value = value; }
          });
  
          Object.defineProperty(refNode, 'coB', {
            get() { return this.material.uniforms.coB.value; },
            set(value) { this.material.uniforms.coB.value = value; }
          });
        }
        
        console.log(`bgRef.current:`, bgRef.current)
        bgAnimMixer = new THREE.AnimationMixer(bgRef.current);
        bgPanAction = bgAnimMixer.clipAction(bgAnimClip);
        textPanAction = bgAnimMixer.clipAction(bgAnimClip);
        bgPanAction.play();
        // setupMg(bgRef.current);
        // console.log(`bgPanAction:`, bgPanAction);
      
  }

    let textAnimMixer, textAnimClip, textPanAction;

    const textCoGTrack = useMemo(() => new THREE.NumberKeyframeTrack('.coG', [0, 17.5, 35, 52.5, 70], [1, 0.8, 1.0, 0.8, 1.0]), []);
    const textCoBTrack = useMemo(() => new THREE.NumberKeyframeTrack('.coB', [0, 17.5, 35, 52.5, 70], [0.4, 1.0, 1.0, 0.4, 0.4]), []);
    const textPanKeyframeTrack = useMemo(() => new THREE.NumberKeyframeTrack('.oX',[0,30,60], [1,0,1]), []);

    textAnimClip = useMemo(() => new THREE.AnimationClip('TextPan', 70, [textNegKeyframeTrack, textCoRTrack]), [textNegKeyframeTrack, textCoRTrack]);
    

  const setupMg = (node) => {
    
    if (!node) return;
    console.log(`setupMidPlane node: `, node);
    if (node && mgRef.current === null) mgRef.current = node;
    mgRef.current && mgRef.current.geometry.center();

    const refNode = mgRef.current;

    if(!Object.hasOwn(refNode, 'neg')) {

    }

      console.log(`setpMg node.oX:`, refNode.oX);
      //      console.log(`textRef.current:`, textRef.current);

    if(mgRef.current) {
      textAnimMixer = new THREE.AnimationMixer(mgRef.current);
      textPanAction = textAnimMixer.clipAction(textAnimClip);
      textPanAction.play();
    }

    };
    let txtAnimMixer, txtAnimClip, depthKeyFrame, txtDepthAction;
    depthKeyFrame = new THREE.NumberKeyframeTrack('.depth', [0, 35, 70], [0.3, 0.0, 0.3], THREE.InterpolateSmooth);

    const txtSetup = (node) => {
      // textRef.current.geometry.computeBoundingBox();
      
      Object.defineProperties(node,{
        sX: {
          get() { return this.material.uniforms.sX.value;},
          set(val) {this.material.uniforms.sX.value = val;}
        },
        sY: {
          get() { return this.material.uniforms.sY.value;},
          set(val) {this.material.uniforms.sY.value = val;}
        }
      });
    }
 
  useFrame((state, delta) => {
    bgRef.current !== null && bgAnimMixer?.update(delta);
    mgRef.current !== null && textAnimMixer?.update(delta);
  });
    
  return (
    <>
      <mesh scale={[0.002075, 0.000675 / (bgTexture.image.width / bgTexture.image.height), 1]} position={[0,3,0.1]} renderOrder={1} name='bg' ref={(node) => setupBg(node)} onBeforeRender={bgBeforeRenderHandler} >
        <planeGeometry args={[bgTexture.image.width * dpr, bgTexture.image.height * dpr]} />
        <shaderMaterial args={[planeShader(bgTexture)]} uniforms-sX-value={2.125} uniforms-sY-value={2.125 / (bgTexture.image.width / bgTexture.image.height)} uniforms-oX-value={-0.4} uniforms-oY-value={0.17} />
      </mesh>

      <mesh scale={[txtScale.x, txtScale.y, txtScale.z]} position={[-6.25,3.5,0.24]} onBeforeRender={txtBeforeRender} renderOrder={25}   oX={0} oY={0} rotation={[THREE.MathUtils.degToRad(9), 0, 0]}
      ref={node => {
        if(node) {
          txtRef.current = node;
          const nodeRef = txtRef.current;
          const sz = Vec2(bgFramebufferTex.image.width, bgFramebufferTex.image.height);
          console.log(sz);
          txtRef.current.material.uniforms.size.value = sz;

          console.log(txtRef.current);
          }
        }} >

      <extrudeGeometry args={[shapes, {
        curveSegments:20,
        steps: 50,
        depth:0.01,
        bevelThickness:0.005,
        bevelSegments: 3,
        bevelEnabled: false
      }]} ref={console.log} />
        {/* <shaderMaterial args={[{...textShader(bgTexture, bgFramebufferTex), transparent: true, wireframe:false}]} uniforms-sX-value={0.125} uniforms-sY-value={0.002 / (bgFramebufferTex.image.width / bgFramebufferTex.image.height * headerHeightScale)} uniforms-oX-value={oX.current + 0.5} uniforms-oY-value={0}  /> */}
        <shaderMaterial args={[{...textShader(bgTexture, bgFramebufferTex), transparent: true, wireframe:false}]} uniforms-sX-value={.001625 / camera.position.z / 5} uniforms-sY-value={0.0037 / (bgFramebufferTex.image.width / bgFramebufferTex.image.height)} uniforms-oX-value={-bgRef.current?.oX * camera.position.z / 5 || 0} uniforms-oY-value={0}  />
      </mesh>
    </> 
  );} 
/* sx=0.274, sy=0.121 == misty */
export default GLHeader;