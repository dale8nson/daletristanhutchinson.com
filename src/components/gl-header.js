import { useRef, useMemo, Suspense } from 'react';
import { Spinner } from '@nextui-org/react';

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import bg from '../assets/zen-panorama-bg-cropped.webp';
import mask from '../assets/dth-mask.png';
import filmGrain from '../assets/01156_old_film_look_with_border.webm';
// import './scss/_gl-header.scss';
import SVG from '../assets/dth-union2.svg';
import glass from '../assets/Texturelabs_Glass_154L.jpg';
import { useLoader, useThree, useFrame } from '@react-three/fiber';
import { useVideoTexture } from '@react-three/drei';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils';
// import { Slider, Label } from '@fluentui/react';

const vec2 = (n1 = null, n2 = null) => new THREE.Vector2(n1, n2);
const vec3 = (n1 = null, n2 = null, n3 = null) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1 = null, n2 = null, n3 = null, n4 = null) => new THREE.Vector4(n1, n2, n3, n4);

const headerHeightScale = 0.1;

const screenToWorld = (sX, sY) => {

}



const GLHeader = () => {
  const { gl, camera, scene } = useThree();
  // console.log(`camera:`, camera);
  const dpr = gl.getPixelRatio();
  const mgRef = useRef(null);
  const bgRef = useRef(null);
  const txtRef = useRef(null);
  const maskRef = useRef(null);
  const oX = useRef(0.0);

  // // console.log(`gl: `, gl);
  const size = new THREE.Vector2();
  gl.getSize(size);
  // console.log(`size:`, size);
  const viewPort = vec4();
  gl.getViewport(viewPort);
  // console.log(`viewPort:`, viewPort);
  // console.log(`dpr: ${dpr}`);

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
  // console.log(`size.width: ${size.width}\nsize.width * headerHeightScale: ${size.width * headerHeightScale}\nbgTexture.image.height: ${bgTexture.image.height}\nbgTexHtSc: ${bgTexHtSc}`);

  const maskTex = useLoader(THREE.TextureLoader, mask);
  maskTex.wrapS = maskTex.wrapT = THREE.RepeatWrapping;
  // maskTex.flipY = false;

  const filmGrainTex = useVideoTexture(filmGrain);
  filmGrainTex.wrapS = filmGrainTex.wrapT = THREE.RepeatWrapping;

  const mgHeightUnit = (bgTexture.image.width / bgTexture.image.height);
  // console.log(`mgHeightUnit: ${mgHeightUnit}`);
  const mgPosY = mgHeightUnit;
  // console.log(`mgPosY: ${mgPosY}`);

  const planeShader = ({bgTex, glassMap=glassTex, glassUVScale=vec2(1,1), glassUVOffset=vec2(0,0), maskMap=null, maskUVScale=vec2(1,1), maskUVOffset=vec2(0,0)}) => {
    return {
      uniforms: {
        bgTex: { value: bgTex },
        glassMap: { value: glassMap },
        glassUVScale: { value: glassUVScale},
        glassUVOffset: {value: glassUVOffset},
        maskMap: { value: maskMap},
        maskUVScale: { value: maskUVScale },
        maskUVOffset: {  value: maskUVOffset },
        alpha: { value: 1.0 },
        x: { value: 0.0 },
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
    
    uniform sampler2D bgTex, maskMap, glassMap;
    uniform vec2 maskUVScale, maskUVOffset, glassUVScale, glassUVOffset;
    uniform float sX, sY;
    uniform float oX, oY;
    uniform float x, neg;
    uniform float coR, coG, coB, alpha;
  
    varying vec2 vUv;
    varying vec4 pos;
    varying vec3 norm;
  
    void main()

    {
      // float alpha = 1.0;
      ivec2 texSz = textureSize(bgTex, 0);
      float texScale = intBitsToFloat(texSz.x) / intBitsToFloat(texSz.y);
      ivec2 glassTexSz = textureSize(glassMap, 0);
      float glassScale = intBitsToFloat(glassTexSz.x) / intBitsToFloat(glassTexSz.y);

      vec2 vScaled = vec2(vUv.x * sX + oX, vUv.y * sY + oY);
      vec4 bgCol = texture2D(bgTex, vScaled);

      vec2 maskScale = vUv * maskUVScale + maskUVOffset;
      vec4 maskCol = texture2D(maskMap, maskScale);

      // vec2 glassScaled = vec2((vUv.x) * 8.0 + (mod(oX, 5.0) == 0.0 ? .2 : 0.5) , vUv.y * 1.0);
      vec2 glassScaled = vUv * glassUVScale + glassUVOffset;

      vec4 glassCol = texture2D(glassMap, glassScaled);

      float red = bgCol.r - neg * (bgCol.r - (1.0 - bgCol.r));
      float green = bgCol.g - neg * (bgCol.g - (1.0 - bgCol.g)) + coG;
      float blue = bgCol.b - neg * (bgCol.b - (1.0 - bgCol.b)) + coB;

      if(maskCol.r < 0.99) {
        // discard;
        red = 1.0 - red;
        green = 1.0 - green;
        blue = 1.0 - blue;
        // red = 0.93;
        // green = 0.0;
        // blue = 0.0;
      }

      if (glassCol.r < 1.0) {
        
        // red = glassCol.r;
        // green = glassCol.g;
        // blue = glassCol.b;
        red -= glassCol.r * 0.3;
        green -= glassCol.r * 0.3;
        blue -= glassCol.r * 0.3;

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

  const maskShader = ({ bgMap = null, mask = null, uvScale = vec2(1, 1), uvOffset = vec2(0, 0), maskUVScale=vec2(1,1), maskUVOffset=vec2(0,0)}) => {
    return {
      uniforms: {
        bgMap: { value: bgMap },
        mask: { value: mask },
        uvScale: { value: uvScale },
        uvOffset: { value: uvOffset },
        maskUVScale: { value: maskUVScale},
        maskUVOffset: { value: maskUVOffset }
      },
      vertexShader: `
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
      fragmentShader: `
          uniform sampler2D bgMap, mask;
          uniform vec2 uvScale, uvOffset, maskUVScale, maskUVOffset;

          varying vec2 vUv;

          void main() {
            vec2 scaledUV = vUv * uvScale + uvOffset;
            vec2 maskScaledUV = vUv * maskUVScale + maskUVOffset;

            vec4 maskCol = texture2D(mask, maskScaledUV);

            if(maskCol.r > 0.99) discard;

            vec4 bgCol = texture2D(bgMap, scaledUV);

            float red, green, blue;
            red = 1.0 - bgCol.r;
            green = 1.0 - bgCol.g;
            blue = 1.0 - bgCol.b;

            // red = bgCol.r;
            // green = bgCol.g;
            // blue = bgCol.b;

            gl_FragColor = vec4(red, green, blue, 1.0);
            // gl_FragColor = vec4(0.93, 0.0, 0.0, 0.3);
            // gl_FragColor = bgCol;

            
          }
        `,
        transparent:true
    }
  }

  const textShader = (bgTex, map) => {
    return {
      uniforms: {
        bgTex: { value: bgTex },
        map: { value: map },
        glassMap: { value: glassTex },
        size: { value: null },
        alpha: { value: 1.0 },
        coR: { value: 0.0 },
        coG: { value: 0.0 },
        coB: { value: 0.0 },
        isNegative: { values: true },
        neg: { value: 0.0 },
        sX: { value: 1.0 },
        sY: { value: 1.0 },
        oX: { value: 0.0 },
        oY: { value: 0.0 }

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
    uniform float coR, coG, coB, alpha;
    uniform vec2 size;
  
    varying vec2 vUv;
    varying vec4 pos;
    
    void main()
    {
      ivec2 texSz = textureSize(glassMap, 0);
      float glassScaleVec = intBitsToFloat(texSz.x) / intBitsToFloat(texSz.y);
    
      vec2 vScaled = vec2((vUv.x / size.x) * sX + oX, (vUv.y / size.y) * sY + oY);
      float redC, greenC, blueC;
      
      // vec4 bgCol = texture2D(bgTex, vUv);
      // vec4 fgCol = texture2D(map, vScaled);

      vec2 scaled = vec2(vUv.x * sX + oX, vUv.y * sY + oY);

      vec4 bgCol = texture2D(bgTex, scaled );
      vec4 fgCol = texture2D(map, scaled );

      vec2 glassScaled = vec2((vUv.x / intBitsToFloat(texSz.x)) * 1.0, (vUv.y / intBitsToFloat(texSz.y)) * (1.0 / glassScaleVec));
      // vec2 glassScaled = vec2(vUv.x * 8.0 , vUv.y * 1.0);

      vec4 glassCol = texture2D(glassMap, glassScaled);
  
      float red, green, blue;
  
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
      blue = 1.0 -  bgCol.b  0.0 * (bgCol.b > 0.5 ? -0.1 : 0.2) - redOffset;
      
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
      red = 1.0 - bgCol.r;
      green = 1.0 - bgCol.g;
      blue = 1.0 - bgCol.b;

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

  const bgFramebufferTex = new THREE.FramebufferTexture(size.width * dpr, size.width * dpr);
  bgFramebufferTex.wrapS = THREE.RepeatWrapping;
  bgFramebufferTex.wrapT = THREE.RepeatWrapping;
  // bgFramebufferTex.flipY = false;
  bgFramebufferTex.format = THREE.RGBAFormat;



  // let bgFramebufferOffset = useMemo(() => new THREE.Vector2(0,(size.height * dpr - bgFramebufferTex.image.height * headerHeightScale / (camera.position.z / (5 - 1.25))), [bgFramebufferTex.image.height, size.height]));
  // let bgFramebufferOffset = Vec2(0, size.y * dpr - size.x * dpr / (bgFramebufferTex.image.width / bgFramebufferTex.image.width * headerHeightScale)  / (camera.position.y / 2.95));
  let bgFramebufferOffset = vec2(0, 0);

  // gl.copyFramebufferToTexture(bgFramebufferOffset, bgFramebufferTex);
  // const bgFramebufferTex = useMemo(() => {

  // const tex = new THREE.FramebufferTexture(size.width, size.height);
  // console.log(`bgFramebufferTex.image:`, tex.image);
  // // const tex = new THREE.FramebufferTexture(bgTexture.image.width * 0.0014, bgTexture.image.height * 0.000336 / (bgTexture.image.width / bgTexture.image.height));
  // // tex.format = THREE.RGBAFormat;
  // tex.wrapS = THREE.RepeatWrapping;
  // tex.wrapT = THREE.RepeatWrapping;
  // tex.flipY = false;

  // return tex;
  // }, [size.x]);

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
  const getScreenCoords = (position, object) => {
    gl.getSize(size);
    const posVec = position.clone();
    // posVec.setFromMatrixPosition(object.matrixWorld).add(position);
    posVec.applyMatrix4(object.matrixWorld);
    posVec.project(camera);
    // console.log(`posVec.setFromMatrixPosition(object.matrixWorld):`, posVec);

    // console.log(`posVec.project(camera):`, posVec);

    const widthHalf = size.width / 2;
    const heightHalf = size.height / 2;
    // posVec.x = (posVec.x / size.width) + size.width;
    // posVec.y = -(posVec.y / size.height) + size.height;
    posVec.setX(-(posVec.x / widthHalf) + widthHalf);
    posVec.setY(-(posVec.y / heightHalf) + heightHalf);

    return posVec;

  }

  const setupBg = (node) => {
    if (!node) return;
    bgRef.current = node;

    bgRef.current.geometry.computeBoundingBox();
    // console.log(`bgRef.current:`, bgRef.current);
    let bgSz = vec3(0, 0, 0);
    bgRef.current.geometry.boundingBox.getSize(bgSz);
    // console.log(`bgSz:`, bgSz);

    const nodeRef = bgRef.current;

    if (!Object.hasOwn(nodeRef, 'oX')) {
      Object.defineProperty(nodeRef, 'oX', {
        get() { return this.material.uniforms.oX.value; },
        set(value) { this.material.uniforms.oX.value = value; }
      });

      Object.defineProperty(nodeRef, 'neg', {
        get() { return this.material.uniforms.neg.value; },
        set(value) { this.material.uniforms.neg.value = value; }
      });

      Object.defineProperty(nodeRef, 'coR', {
        get() { return this.material.uniforms.coR.value; },
        set(value) { this.material.uniforms.coR.value = value; }
      });

      Object.defineProperty(nodeRef, 'coG', {
        get() { return this.material.uniforms.coG.value; },
        set(value) { this.material.uniforms.coG.value = value; }
      });

      Object.defineProperty(nodeRef, 'coB', {
        get() { return this.material.uniforms.coB.value; },
        set(value) { this.material.uniforms.coB.value = value; }
      });

      Object.defineProperty(nodeRef, 'alpha', {
        get() { return this.material.uniforms.alpha.value; },
        set(value) { this.material.uniforms.alpha.value = value; }
      });
    }

    // console.log(`bgRef.current:`, bgRef.current)
    bgAnimMixer = new THREE.AnimationMixer(bgRef.current);
    bgPanAction = bgAnimMixer.clipAction(bgAnimClip);
    // textPanAction = bgAnimMixer.clipAction(bgAnimClip);
    bgPanAction.play();
    // setupMg(bgRef.current);
    // console.log(`bgPanAction:`, bgPanAction);

  }

    

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
    // renderer.clear();

  }


  const textGeoSz = vec3(0, 0, 0);
  let textGeoScreenSz, textWorldSz, canvasWorldSz;
  const diff = vec2(0, 0);

  let txtAnimMixer, txtRangeTrack, txtAnimClip, txtAnimAction;

  const setupTxt = node => {
    if (node) {
      txtRef.current = node;
      // txtRef.current.geometry = BufferGeometryUtils.mergeGroups(txtRef.current.geometry);
      const nodeRef = txtRef.current;

      const sz = vec2(bgFramebufferTex.image.width, bgFramebufferTex.image.height);
      // console.log(sz);
      // console.log(`txtRef.current:`, txtRef.current);
      txtRef.current.material[0].uniforms.size.value = sz;
      const uvAttr = nodeRef.geometry.attributes.uv;
      const uvArray = uvAttr.array;
      // console.log(`uvArray:`, uvArray);
      let normalArray = [];
      const originalCamPos = camera.position.clone();
      camera.position.set(0, 0, 5);
      camera.updateMatrix();
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();
      gl.getSize(size);
      // console.log(`size:`, size);
      nodeRef.geometry.computeBoundingBox();
      // console.log(`bgFramebufferTex.image:`, bgFramebufferTex.image)
      nodeRef.geometry.boundingBox.getSize(textGeoSz);
      // console.log(`textGeoSz`, textGeoSz);
      for (let i = 0; i < uvArray.length; i += 2) {
        // console.log(`uv: x:${uvArray[i]}, y: ${uvArray[i + 1]}`);
        const coords = getScreenCoords(vec3(uvArray[i], uvArray[i + 1], 0), nodeRef);
        // console.log(`coords:`, coords);
        normalArray.push(uvArray[i] / textGeoSz.x, uvArray[i + 1] / textGeoSz.y);
      }
      nodeRef.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(normalArray), 2));

      // console.log(`normalArray:`, normalArray);

      // console.log(`bgRef.current.position.applyMatrix4(bgRef.current.matrixWorld): `, bgRef.current.position.clone().applyMatrix4(bgRef.current.matrixWorld))
      bgRef.current.geometry.computeBoundingBox();
      const bgBBSz = vec3(0, 0, 0);
      bgRef.current.geometry.boundingBox.getSize(bgBBSz);
      bgBBSz.applyMatrix4(bgRef.current.matrixWorld);
      // console.log(`bgBBSz:`, bgBBSz);
      // console.log(`textGeoProjSz.applyMatrix4(nodeRef.matrixWorld):`, textGeoSz.clone().applyMatrix4(nodeRef.matrixWorld));
      // console.log(`textGeoSz.applyMatrix4(nodeRef.matrixWorld).project(camera):`, textGeoSz.clone().applyMatrix4(nodeRef.matrixWorld).project(camera));
      // textGeoSz.applyMatrix4(nodeRef.matrixWorld).project(camera);
      // console.log(`textGeoSz.x * size.x: ${textGeoSz.x * size.x}`);
      // console.log(`textGeoSz.y * size.y: ${textGeoSz.y * size.y}`);
      // console.log(`textGeoScreenSz:`, textGeoSz.clone().applyMatrix4(nodeRef.matrixWorld).project(camera));

      textGeoScreenSz = getScreenCoords(textGeoSz, nodeRef);
      // console.log(`textGeoScreenSz`, textGeoScreenSz);
      textWorldSz = textGeoSz.clone().applyMatrix4(nodeRef.matrixWorld);
      // console.log(`textWorldSz:`, textWorldSz);
      canvasWorldSz = vec3(size.x, size.y, 0).unproject(camera);
      // console.log(`canvasWorldSz:`, canvasWorldSz);

      // console.log(`textWorldSz / canvasWorldSz:`, textWorldSz.divide(canvasWorldSz));
      // console.log(`textWorldSz.y / (canvasWorldSz.y * headerHeightScale):`, textWorldSz.y / (canvasWorldSz.y * headerHeightScale));

      diff.setX(textWorldSz.x / canvasWorldSz.x);
      diff.setY(textWorldSz.y / (canvasWorldSz.x * headerHeightScale));
      // console.log(`diff:`, diff);

      const txtPos = getScreenCoords(nodeRef.position, nodeRef);
      // console.log(`nodeRef.position:`, txtPos);

      // console.log(`scene local pos:`, scene.position);
      // console.log(`scene world pos`, scene.position.clone().applyMatrix4(scene.matrixWorld));
      // console.log(`Vec3(-11,0,0)`)
      // console.log(`Vec3(0.00582,0.0015,1).project(camera).x / (size.x / 2) + (size.x / 2):`, Vec3(0.00582,0.0015,1).project(camera).x / (size.x / 2) + size.x / 2 );


      camera.position.set(originalCamPos.x, originalCamPos.y, originalCamPos.z);
      camera.updateMatrix();
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();

      if (!Object.hasOwn(nodeRef, 'range')) {
        Object.defineProperty(nodeRef, 'range', {
          get() { return this.geometry.drawRange.count; },
          set(val) { this.geometry.drawRange.count = val; }
        });
      }
      if (!Object.hasOwn(nodeRef, 'alpha')) {
        Object.defineProperty(nodeRef, 'alpha', {
          get() { return this.material[0].uniforms.alpha.value; },
          set(value) { this.material[0].uniforms.alpha.value = value; }
        });
      }
      const txtPosLn = nodeRef.geometry.attributes.position.array.length;
      const txtRangeTm = Array(27).fill(0).map((tm, i) => {
        return i;
      });

      const txtRangeVals = Array(27).fill(0).map((val, i) => {
        if (i > 2) {
          return Math.floor((i - 2) * (1 / 24) * txtPosLn);

        } else return null;
      });

      txtRangeTrack = new THREE.NumberKeyframeTrack('.range', txtRangeTm, txtRangeVals, THREE.InterpolateSmooth);
      txtAnimClip = new THREE.AnimationClip('', 8, [alphaTrack]);
      txtAnimMixer = new THREE.AnimationMixer(nodeRef);
      txtAnimAction = txtAnimMixer.clipAction(txtAnimClip);
      txtAnimAction.setLoop(THREE.LoopOnce);
      txtAnimAction.play();

      // console.log(`txtRef.current:`, txtRef.current);
    }
  
  }
  const txtBeforeRender = (renderer, scene, camera, geometry, material, group) => {
    if (!material.isShaderMaterial) return;

    const coords = getScreenCoords(vec3(camera.position.x, camera.position.y, camera.position.z), camera);
    // console.log(`camera screen coordinates:`, coords)
    bgFramebufferOffset = vec2(0, 0);
    renderer.copyFramebufferToTexture(bgFramebufferOffset, bgFramebufferTex);
    material.uniforms.bgTex.value = bgFramebufferTex;
    // material.uniforms.sX.value = 1;
    // material.uniforms.sY.value = 1;
    // material.uniforms.oY.value = 1 * (coords.y / size.height);
    // material.uniforms.oX.value = 1 * (coords.x / size.width);
    // diff.setY(textGeoScreenSz.y / size.width * headerHeightScale / (camera.position.z / 1.125));
    let bbSz = vec3(0, 0, 0);
    geometry.boundingBox.getSize(bbSz);
    textGeoScreenSz = getScreenCoords(bbSz, txtRef.current);
    diff.setX(textWorldSz.x / size.x);
    diff.setY(textWorldSz.y / canvasWorldSz.x * headerHeightScale);

    material.uniforms.sY.value = diff.y;
    material.uniforms.sX.value = diff.x;
    // material.uniforms.oY.value = -(1 - camera.position.y / 2.95);
    const camCoords = getScreenCoords(camera.position, camera);
    // console.log(`camCoords`,camCoords);
    // console.log(`txtRef.current.position:`, txtRef.current.position);
    const nodePos = getScreenCoords(txtRef.current.position, txtRef.current);
    // console.log(`nodePos:`, nodePos);
    material.uniforms.oX.value = -((camCoords.x / size.x) - nodePos.x / size.x);
    material.uniforms.oY.value = ((camCoords.y / size.y) - nodePos.y / size.y);

    material.uniformsNeedUpdate = true;
    // console.log(`txtRef.current:`, txtRef.current);
  }

  let bgAnimMixer, bgPanAction, panKeyframeTrack, alphaTrack, bgAnimClip;
  panKeyframeTrack = useMemo(() => new THREE.NumberKeyframeTrack('.oX', [0, 30, 40, 70], [0, 0.5, 0.5, 0], THREE.InterpolateSmooth), []);
  // panKeyframeTrack = new THREE.NumberKeyframeTrack('.oX',[0,35,70], [0,1.5,0], THREE.InterpolateSmooth);
  const textNegKeyframeTrack = useMemo(() => new THREE.NumberKeyframeTrack('.neg', [0, 17.5, 35, 52.5, 70], [0.0, 1.0, 0.0, 1.0, 0.0], THREE.InterpolateSmooth), []);
  const textCoRTrack = useMemo(() => new THREE.NumberKeyframeTrack('.coR', [0, 17.5, 35, 52.5, 70], [0.0, 0.5, 0.0, 0.5, 0.0]), []);
  alphaTrack = useMemo(() => new THREE.NumberKeyframeTrack('.alpha', [0, 8], [0.0, 1]), []);

  bgAnimClip = useMemo(() => new THREE.AnimationClip('BgPan', 70, [panKeyframeTrack, textNegKeyframeTrack, textCoRTrack, alphaTrack]), [panKeyframeTrack]);
  // bgAnimClip = new THREE.AnimationClip('BgPan', 70, [panKeyframeTrack]);

  let textAnimMixer, textAnimClip, textPanAction;

  const textCoGTrack = useMemo(() => new THREE.NumberKeyframeTrack('.coG', [0, 17.5, 35, 52.5, 70], [1, 0.8, 1.0, 0.8, 1.0]), []);
  const textCoBTrack = useMemo(() => new THREE.NumberKeyframeTrack('.coB', [0, 17.5, 35, 52.5, 70], [0.4, 1.0, 1.0, 0.4, 0.4]), []);
  const textPanKeyframeTrack = useMemo(() => new THREE.NumberKeyframeTrack('.oX', [0, 30, 60], [1, 0, 1]), []);


  textAnimClip = useMemo(() => new THREE.AnimationClip('TextPan', 70, [textNegKeyframeTrack, textCoRTrack, alphaTrack]), [textNegKeyframeTrack, textCoRTrack, alphaTrack]);


  const setupMg = (node) => {

    if (!node) return;
    // console.log(`setupMidPlane node: `, node);
    if (node && mgRef.current === null) mgRef.current = node;
    mgRef.current && mgRef.current.geometry.center();

    const refNode = mgRef.current;

    if (!Object.hasOwn(refNode, 'neg')) {

    }

    // console.log(`setpMg node.oX:`, refNode.oX);
    //      console.log(`textRef.current:`, textRef.current);

    if (mgRef.current) {
      textAnimMixer = new THREE.AnimationMixer(mgRef.current);
      textPanAction = textAnimMixer.clipAction(textAnimClip);
      // textPanAction.play();
    }
  };

  const bgAfterRender = (renderer, scene, camera, geometry, material, group) => {
    renderer.copyFramebufferToTexture(bgFramebufferOffset, bgFramebufferTex);
    maskRef.current.material.uniforms.bgMap.value = bgFramebufferTex;
    maskRef.current.material.uniformsNeedUpdate = true;
  }

  const UVOffset = vec2(0, -headerHeightScale - (camera.position.y / 2.95) * 0.35);
  const UVScale = vec2(1, (1 - (camera.rotation.x / (Math.PI / 180 * 10)) * 0.225) / (maskTex.image.width / maskTex.image.height));

  const maskBeforeRender = (renderer, scene, camera, geometry, material, group) => {
    // if(!material.isShaderMaterial) return;
    // console.log(`mask material:`, material);
    // bgFramebufferOffset = Vec2(0,0);
    // bgFramebufferOffset.setY(size.y * dpr - size.x * dpr * headerHeightScale + ((camera.position.y / 2.95) - headerHeightScale) * (size.y))
    // bgFramebufferOffset = Vec2(0, size.y * dpr - size.x * dpr / (bgFramebufferTex.image.width / bgFramebufferTex.image.width * headerHeightScale)  / (camera.position.y / 2.95));
    renderer.copyFramebufferToTexture(bgFramebufferOffset, bgFramebufferTex);
    material.uniforms.bgMap.value = bgFramebufferTex;
    UVOffset.setX(1 - (camera.position.z + 2.5 / 3.75) * 0.2);
    UVOffset.setY(0.485 - ((camera.position.y - (-0.925)) / 3.875) * 0.27 - (camera.rotation.x / (Math.PI / 180 * 10) * 0.075) + 0.06);
    material.uniforms.uvOffset.value = UVOffset;
    UVScale.setX((camera.position.z + 2.5 / 3.75) * 1);
    UVScale.setY((1 - (camera.rotation.x / (Math.PI / 180 * 10)) * 0.21  + 2) / (maskTex.image.width / maskTex.image.height));
    material.uniforms.uvScale.value = UVScale;
    material.uniformsNeedUpdate = true;
  }
    
  useFrame((state, delta) => {
    bgAnimMixer?.update(delta);
    textAnimMixer?.update(delta);
    txtAnimMixer?.update(delta);
    // gl.copyFramebufferToTexture(bgFramebufferOffset, bgFramebufferTex);
    // if(maskRef.current) {
    //   maskRef.current.material.uniforms.bgMap.value = bgFramebufferOffset;
    //   maskRef.current.material.uniformsNeedUpdate = true;
    // }
  });

  const txtScale = vec3(.0055, .055 / (maskTex.image.width / (maskTex.image.height)), 1);
  // const txtScale = Vec3(0.00973625, 0.0018, 1);


  return (
    <>
      <mesh scale={[0.002075, 0.002 / (bgTexture.image.width / bgTexture.image.height), 1]} position={[0,4.6125,0.001]} renderOrder={8} >
        <planeGeometry args={[bgTexture.image.width * dpr, bgTexture.image.height * dpr]} />
        <meshBasicMaterial args={[{color:0x000000}]} />
      </mesh>
      <mesh position={vec3(0,3.5,-3)} scale={vec3(.08,.015,1)} rotation={new THREE.Euler(Math.PI / 2, 0, 0)} renderOrder={5}>
        <planeGeometry  />
        <meshBasicMaterial args={[{color:0x000000}]} />
      </mesh>
      <mesh scale={[0.0125, 0.06 / (maskTex.image.width / maskTex.image.height), 1]} position={[0, 3.3, 0.006]} renderOrder={1} name='bg' ref={(node) => setupBg(node)} onBeforeRender={bgBeforeRenderHandler} >
        <planeGeometry args={[size.x * dpr, size.x * dpr * headerHeightScale]} />
        <shaderMaterial args={[planeShader({bgTex:bgTexture, glassMap: filmGrainTex, glassUVScale:vec2(1, 2 / (maskTex.image.width / maskTex.image.height)), glassUVOffset:vec2(0, 0), maskMap:maskTex, maskUVScale:vec2(2.3, 9 / (maskTex.image.width / maskTex.image.height)), maskUVOffset:vec2(0.4,-0.1)})]} uniforms-sX-value={2.125} uniforms-sY-value={2.125 / (bgTexture.image.width / bgTexture.image.height)} uniforms-oX-value={-0.4} uniforms-oY-value={0.17} />
      </mesh>
      {/* <mesh position={[0, 3, 0.2]} scale={[txtScale.x, txtScale.y, txtScale.z]} onBeforeRender={maskBeforeRender} ref={maskRef} renderOrder={2}>
        {/* <planeGeometry args={[bgFramebufferTex.image.width, bgFramebufferTex.image.height]} attributes-uv={new THREE.Float32BufferAttribute([0,1,1,1,0,0,1,0], 2)} /> */}
        {/* <planeGeometry args={[maskTex.image.width, maskTex.image.height]} attributes-uv={new THREE.Float32BufferAttribute([0,1,1,1,0,0,1,0], 2)} /> */}
        {/* <shaderMaterial attach='material' args={[maskShader({ bgMap: bgFramebufferTex, mask: maskTex, uvScale: Vec2(1, 0.1 ), uvOffset: Vec2(0, -headerHeightScale - ((camera.position.y / 2.95))), maskUVScale:Vec2(1, 8.3 / (maskTex.image.width / maskTex.image.height)), maskUVOffset:Vec2(0,0)})]} /> */}
        {/* <shaderMaterial attach='material' args={[maskShader({ bgMap: bgFramebufferTex, mask: maskTex, uvScale: Vec2(1, 1 / (maskTex.image.width / maskTex.image.height) ), uvOffset: UVOffset, maskUVScale:Vec2(1, 8.65 / (maskTex.image.width / maskTex.image.height)), maskUVOffset:Vec2(0,0.)})]} wireframe={false} /> */}
        {/* <shaderMaterial attach='material' args={[maskShader({ bgMap: bgFramebufferTex, mask: maskTex, uvScale: Vec2(1, (1 - (camera.rotation.x / (Math.PI / 180 * 10)) * 0.225) / (maskTex.image.width / maskTex.image.height) ), uvOffset: Vec2(UVOffset.x, UVOffset.y + (camera.rotation.x / (Math.PI / 180 * 10)) * 0.4), maskUVScale:Vec2(1, 8.65 / (maskTex.image.width / maskTex.image.height)), maskUVOffset:Vec2(0,0.)})]} wireframe={false} /> */} */}

        {/* <shaderMaterial attach='material' args={[maskShader({ bgMap: bgFramebufferTex, mask: maskTex, uvScale: Vec2(1, 1 / (maskTex.image.width / maskTex.image.height) ), uvOffset: Vec2(0,0.215), maskUVScale:Vec2(1, 8.3 / (maskTex.image.width / maskTex.image.height)), maskUVOffset:Vec2(0,0)})]} /> */}

        {/* <shaderMaterial attach='material' args={[{...maskShader({bgMap:bgFramebufferTex, mask: maskTex, uvScale:Vec2(1,1 / (txtScale.x / txtScale.y)), uvOffset:Vec2(0.0,0)})}]} /> */}
      {/* </mesh> */}
      {/* <mesh scale={[txtScale.x, txtScale.y, txtScale.z]} position={[-6.25,3.5,0.24]} onBeforeRender={txtBeforeRender} renderOrder={25}   oX={0} oY={0} rotation={[THREE.MathUtils.degToRad(9), 0, 0]} ref={setupTxt}> */}
      {/* <extrudeGeometry args={[shapes, {
        curveSegments:20,
        steps: 50,
        depth:0.01,
        bevelThickness:0.005,
        bevelSegments: 3,
        bevelEnabled: false
      }]} /> */}
      {/* <shaderMaterial args={[{...textShader(bgTexture, bgFramebufferTex), transparent: true, wireframe:false}]} uniforms-sX-value={0.125} uniforms-sY-value={0.002 / (bgFramebufferTex.image.width / bgFramebufferTex.image.height * headerHeightScale)} uniforms-oX-value={oX.current + 0.5} uniforms-oY-value={0}  /> */}
      {/* <shaderMaterial args={[{...textShader(bgTexture, bgFramebufferTex), transparent: true, wireframe:false}]} uniforms-sX-value={1 * (camera.position.z / 1.25)} uniforms-sY-value={1 * (camera.position.z / 1.25)} uniforms-oX-value={  Vec4(camera.position.x, camera.position.y, camera.position.z,1).applyMatrix4(camera.modelViewMatrix.clone().multiply(camera.projectionMatrix)).x / size.width} uniforms-oY-value={Vec4(camera.position.x, camera.position.y, camera.position.z,1).applyMatrix4(camera.modelViewMatrix.clone().multiply(camera.projectionMatrix)).y / size.width * headerHeightScale} /> */}
      {/* <shaderMaterial attach="material-0" args={[{...textShader(bgTexture, bgFramebufferTex), transparent: true, wireframe:false}]} uniforms-sX-value={1 / diff.x }  uniforms-oX-value={0} /> */}
      {/* <meshBasicMaterial attach="material-1" args={[{color: 0xcccccc, transparent:true, opacity:0.7}]} /> */}

      {/* </mesh> */}
    </>
  );
    };
  
  

    

export default GLHeader;