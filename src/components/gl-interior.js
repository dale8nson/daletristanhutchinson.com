import { useMemo } from 'react';
import { useThree, useLoader, useFrame } from '@react-three/fiber';
import whiteWall from '../assets/white-wall.png';
import tatami from '../assets/TexturesCom_Wicker0046_12_seamless_S.jpg';
import tatamiTrim from '../assets/TexturesCom_Wicker0046_15_S.jpg';
import roughWood from '../assets/TexturesCom_WoodRough0003_M.jpg';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import glass from '../assets/TCom_WindowsOther0024_S.jpeg';
import paper from '../assets/TCom_PaperDecorative0032_1_seamless_M.jpeg';
import plaster from '../assets/TCom_PlasterBare0143_1_seamless_M.jpeg'
import ryouanji from '../assets/victor-lu-1EJX-rotoeg-unsplash.jpg';
import hikite from '../assets/hikite.png';
import gotama from '../assets/Gotama-edited.png';
// import woodPanel1 from '../assets/TCom_WoodFine0082_3_seamless_M.jpeg'

const Vec2 = (n1 = null, n2 = null) => new THREE.Vector2 (n1, n2);
const Vec3 = (n1 = null, n2 = null, n3 = null) => new THREE.Vector3(n1, n2, n3);

const ZERO_VEC_2 = Vec2(0,0);
const ONE_VEC_3 = Vec3(1,1,1);

const vertexPass = `
    
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const Shader = ({
  map,
  map2,
  useMap2,
  map2UVScale,
  map2Scale,
  useBackMap,
  backMap,
  antialias, 
  UVScale, 
  UVOffset, 
  RGBScale, 
  RGBOffset,
  alphaRange,
  alphaMinCutoff,
  alphaMaxCutoff,
  greyOffset, 
  greyScale, 
  greyMinCutoff,
  greyMaxCutoff,
  negative,
  redRange,
  greenRange,
  blueRange,
  greyRange
 }) => {
  const mat = {
    uniforms: {
      map: {value: map || null},
      map2: {value: map2 || null},
      useMap2: { value: useMap2 || false},
      map2Scale: {value: map2Scale || 1.0},
      map2UVScale: {value: map2UVScale || Vec2(1,1)},
      useBackMap: {value: useBackMap || false},
      backMap: {value: backMap || null},
      antialias: {value: antialias || false},  
      UVScale: {value: UVScale || Vec2(1,1)}, 
      UVOffset: {value: UVOffset || Vec2(0,0)},
      RGBScale: {value: RGBScale || Vec3(1,1,1)},
      RGBOffset: {value: RGBOffset || Vec3(0,0,0)},
      alphaRange: { value: alphaRange || Vec2(0.0,1.0)},
      alphaMinCutoff: {value: alphaMinCutoff || 0.0},
      alphaMaxCutoff: {value: alphaMaxCutoff || 1.0},
      greyOffset: {value: greyOffset || 0.0},
      greyScale: {value: greyScale || false},
      greyMinCutoff: { value: greyMinCutoff || 0},
      greyMaxCutoff: { value: greyMaxCutoff || 1},
      negative: { value: negative || 0.0 },
      redRange: { value: redRange || Vec2(0,1) },
      greenRange: { value: greenRange || Vec2(0,1) },
      blueRange: { value: blueRange || Vec2(0,1) },
      greyRange: { value: greyRange || Vec2(0,1) }
    },
    vertexShader: vertexPass,
    fragmentShader: `

      uniform sampler2D map, map2, backMap;
      uniform vec3 RGBScale, RGBOffset;
      uniform vec2 UVScale, UVOffset, map2UVScale, redRange, greenRange, blueRange, greyRange, alphaRange;
      uniform bool useMap2, useBackMap, antialias, greyScale;
      uniform float alphaMinCutoff, alphaMaxCutoff, map2Scale, greyOffset, greyMinCutoff, greyMaxCutoff, negative;

      varying vec2 vUv;

      void main() {

        vec2 scaledUV = vec2(vUv.x * UVScale.x + UVOffset.x, 
          vUv.y * UVScale.y + UVOffset.y);
        vec4 mapCol = texture2D(map, scaledUV);

        vec4 col = mapCol;


        float contrastThreshold = 0.4;

        float red, green, blue, grey, alpha;

        grey = (col.r + col.g + col.b) / 3.0;
        alpha = clamp(col.a, alphaRange.x, alphaRange.y);

        if(greyScale) {

          float scale = (RGBScale.r + RGBScale.g + RGBScale.b) / 3.0;
          float offset = (RGBOffset.r + RGBOffset.g + RGBOffset.b) / 3.0;
          grey = clamp(grey, greyRange.x, greyRange.y);

          red = green = blue = grey * scale + offset + greyOffset;

        } else {

          red = clamp(col.r * alpha * RGBScale.r + RGBOffset.r + greyOffset, redRange.x, redRange.y);
          green = clamp(col.g * alpha * RGBScale.g + RGBOffset.g + greyOffset, greenRange.x + greyOffset, greenRange.y);
          blue = clamp(col.b * alpha * RGBScale.b + RGBOffset.b + greyOffset, blueRange.x, blueRange.y);

          if(col.r < greyMinCutoff || col.r > greyMaxCutoff ||
            col.g < greyMinCutoff || col.g > greyMaxCutoff ||
            col.b < greyMinCutoff || col.b > greyMaxCutoff
            ) { red = green = blue = 0.0; }
        }

        if(grey < greyMinCutoff || grey > greyMaxCutoff ||
          col.a < alphaMinCutoff || col.a > alphaMaxCutoff) { discard; }

        if(useMap2) {
          vec2 map2Scaled = vec2((vUv.x * 1.0) * map2UVScale.x, vUv.y * map2UVScale.y );
          vec4 map2Col = texture2D(map2, map2Scaled);
          if (map2Col.r > 0.6) {
            red -= map2Col.r * map2Scale;
            green -=  map2Col.g * map2Scale;
            blue -= map2Col.b * map2Scale;
            // alpha -= map2Col.r * 0.1;
            // discard;
          }

        }

        gl_FragColor = vec4(red, green, blue, 1.0);
      }
      `,
      transparent: true
  };
  Object.defineProperties(mat, {
    map: {
      get() { return this.uniforms.map.value;},
      set(val) { this.uniforms.map.value = val; }
    },
    
    UVScale: {
      get() { return this.uniforms.UVScale.value;},
      set(val) { this.uniforms.UVScale.value = val; }
    },
    UVOffset: {
      get() { return this.uniforms.UVOffset.value;},
      set(val) { this.uniforms.UVOffset.value = val; }
    },
    RGBScale: {
      get() { return this.uniforms.RGBScale.value;},
      set(val) { this.uniforms.RGBScale.value = val; }
    },
    RGBOffset: {
      get() { return this.uniforms.RGBOffset.value;},
      set(val) { this.uniforms.RGBOffset.value = val; }
    },
    greyScale: {
      get() { return this.uniforms.greyScale.value;},
      set(val) { this.uniforms.greyScale.value = val; }
    },
    greyMinCutoff: {
      get() { return this.uniforms.greyMinCutoff.value;},
      set(val) { this.uniforms.greyMinCutoff.value = val; }
    },
    greyMaxCutoff: {
      get() { return this.uniforms.greyMaxCutoff.value;},
      set(val) { this.uniforms.greyMaxCutoff.value = val; }
    },
    negative: {
      get() { return this.uniforms.negative.value;},
      set(val) { this.uniforms.negative.value = val; }
    },
    redRange: {
      get() { return this.uniforms.redRange.value;},
      set(val) { this.uniforms.redRange.value = val; }
    },
    greenRange: {
      get() { return this.uniforms.greenRange.value;},
      set(val) { this.uniforms.greenRange.value = val; }
    },
    blueRange: {
      get() { return this.uniforms.blueRange.value;},
      set(val) { this.uniforms.blueRange.value = val; }
    },
    greyRange: {
      get() { return this.uniforms.greyRange.value;},
      set(val) { this.uniforms.greyRange.value = val; }
    }

  });
  return mat;

}


const woodMaterial = (color = new THREE.Vector4(1.0, 1.0, 1.0, 1.0)) => {
  return {
    uniforms: {
      color: {value: color}
    },
    vertexShader: `
      
      varying vec2 vUv;

      void main() {

        vUv = uv;
      
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `

      varying vec2 vUv;
      

      void main() {

        float xy = vUv.x * vUv.y;
        float modulus = 60.0;
        float maxColorValue = 255.0;
        float offset = mod(xy, modulus) / maxColorValue;
        gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
      }
    `
  }
}

const brightnessMaterial = (map, factor=1.0, viewPort=ZERO_VEC_2, texSize=ZERO_VEC_2) => { 
  return {
    uniforms: {
      map: { value: map },
      factor: {value: factor},
      viewPort: {value: viewPort},
      texSize: {value: texSize}
    },
    vertexShader: `
      
      varying vec2 vUv;
      
      void main() {

        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

      }
    `,
    fragmentShader: `

      uniform sampler2D map;
      uniform float factor;
      uniform vec2 texSize;
      uniform vec2 viewPort;

      in vec2 vUv;

      void main()
      {

        float normalX = (viewPort.x - fragCoord.x) / texSize.x;
        float normalY = (viewPort.y - fragCoord.y) / texSize.y;

        vec2 normalUv = vec2(normalX, normalY); 

        vec4 color = texture2D(map, normalUv);

        float red = color.r * color.a * factor;
        float green = color.g * color.a * factor;
        float blue = color.b * color.a * factor;

        
        
        gl_FragColor = vec4(red, green, blue, 1.0);
      }
    `
  }
}

const Mat = ({position, scale=Vec3(1,1,1), rotation=Vec3(-90,0,90), sizeX=3, sizeY=2, trimColorOffset= 0.0, rightTrim=false, greyOffset=0}) => {

  const {gl, scene, camera} = useThree();
  const dpr = gl.getPixelRatio();

  // console.log(`world position:`, position);

  const localPosition = scene.worldToLocal(position);
  // const localPosition = scene.localToWorld(position);


  // console.log(`local position:`, position);


  const tatamiTex = useLoader(THREE.TextureLoader, tatami);
  tatamiTex.WrapS = THREE.RepeatWrapping;
  tatamiTex.WrapT = THREE.RepeatWrapping;

  const texSz = Vec2(tatamiTex.image.width * dpr, tatamiTex.image.height * dpr);
  const texWidth = texSz.y * scale.y;
  const texHeight = texSz.x * scale.x;
  
  const tatamiTrimTex = useLoader(THREE.TextureLoader, tatamiTrim);
  tatamiTrimTex.WrapT = THREE.RepeatWrapping;
  tatamiTrimTex.wrapS = THREE.RepeatWrapping;

  const trimSz = Vec2(tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr);
  const trimWidth = trimSz.y * scale.y;
  const trimHeight = trimSz.x * scale.x;
  const trimScaleY = (texHeight / trimSz.x);

  const eulerAngles = new THREE.Euler(MathUtils.degToRad(rotation.x), MathUtils.degToRad(rotation.y), MathUtils.degToRad(rotation.z));

  return (
    <group>
      <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x, localPosition.y, localPosition.z]} >
        <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
        <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
      </mesh>
      {sizeX >= 1 && (
        <>
          <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth, localPosition.y, localPosition.z]} >
            <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
            <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
          </mesh>
          {sizeX >= 2 && (
            <>
              <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 2, localPosition.y, localPosition.z]} >
                <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
              </mesh>
              {sizeX >= 3 && (
                <>
                  <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 3 , localPosition.y, localPosition.z]} >
                    <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                    <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
                  </mesh>
                </>
              )}
            </>
          )}
        </>
      )}
      {sizeY >= 1 && (
        <>
          <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x, localPosition.y, localPosition.z - texHeight]} >
            <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
            <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
          </mesh>
          {sizeX >= 1 && (
            <>
              <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth, localPosition.y, localPosition.z - texHeight]} >
                <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
              </mesh>
              {sizeX >= 2 && (
                <>
                  <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 2, localPosition.y, localPosition.z - texHeight]} >
                    <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                    <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
                  </mesh>
                  {sizeX >= 3 && (
                    <>
                  
                      <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 3, localPosition.y, localPosition.z - texHeight]} >
                        <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                        <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
                      </mesh>
                    </>
                  )}
                </>
              )}
            </>
          )}
          {sizeY >= 2 && (
            <>
              <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x, localPosition.y, localPosition.z - texHeight * 2]} >
                <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 +  greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
              </mesh>
              {sizeX >= 1 && (
                <>
                  <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth, localPosition.y, localPosition.z - texHeight * 2]} >
                    <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                    <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
                  </mesh>

                  {sizeX >= 2 && (
                    <>
                      <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 2, localPosition.y, localPosition.z - texHeight * 2]} >
                        <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                        <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
                      </mesh>
                      {sizeX >= 3 && (
                        <>
                          <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 3, localPosition.y, localPosition.z - texHeight * 2]} >
                            <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                            <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: Vec2(0.5, 0.6) })]} />
                          </mesh>
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      <mesh rotation={eulerAngles} position={Vec3(rightTrim ? localPosition.x + texWidth - trimWidth / 2 - 0.08 : localPosition.x - (texWidth * (sizeX + 1)) + trimWidth / 2, localPosition.y + 0.00008, localPosition.z - 0.0275 )} scale={Vec3(trimScaleY * 1.04, 0.000225, 0.01)} >
        <planeGeometry args={[tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr]} />
        <shaderMaterial args={[Shader({ map: tatamiTrimTex, UVScale: Vec2(1, 0.9 / (scale.x / scale.y)), UVOffset:Vec2(0,0.14) ,greyScale: true, greyOffset: -0.2 + trimColorOffset})]} />
      </mesh>
      {sizeY >= 1 && (
        <>
        <mesh rotation={eulerAngles} position={Vec3(rightTrim ? localPosition.x + texWidth - trimWidth / 2 - 0.08 :localPosition.x - texWidth * (sizeX + 1) + trimWidth / 2, localPosition.y + 0.00008, localPosition.z - (trimHeight * (sizeY - 1)) - 0.0275 )} scale={Vec3(trimScaleY * 1.04, 0.000225, 0.01)} >
        <planeGeometry args={[tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr]} />
        <shaderMaterial args={[Shader({ map: tatamiTrimTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), UVOffset:Vec2(0,0.14), greyScale: true, greyOffset: -0.2 + trimColorOffset })]} />
      </mesh>
        {sizeY >= 2 && (
          <mesh rotation={eulerAngles} position={Vec3(rightTrim ? localPosition.x + texWidth - trimWidth / 2 - 0.08 : localPosition.x - texWidth * (sizeX + 1) + trimWidth / 2, localPosition.y + 0.00008, localPosition.z - (trimHeight * sizeY) - 0.0275 )} scale={Vec3(trimScaleY * 1.04, 0.000225, 0.01)} >
            <planeGeometry args={[tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr]} />
            <shaderMaterial args={[Shader({ map: tatamiTrimTex, UVScale: Vec2(1, 1 / (scale.x / scale.y)), UVOffset:Vec2(0,0.14), greyScale: true, greyOffset: -0.2 + trimColorOffset })]} />
          </mesh>
        )}
      </>

      )}

    </group>
  );
}


const Post = ({scale, position, greyOffset=0.0, rotation=new THREE.Euler(0,0,-(2 * Math.PI / 4))}) => {

  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = THREE.MirroredRepeatWrapping;
  tex.WrapT = THREE.MirroredRepeatWrapping;

  return (
    <instancedMesh count={13} rotation={new THREE.Euler(rotation.x,rotation.y,rotation.z)} scale={[scale.x, scale.y, scale.z]} position={[position.x, position.y, position.z]} >
      <planeGeometry args={[tex.image.width, tex.image.height]} />
      <shaderMaterial args={[Shader({map:tex, UVScale:Vec2(1,  1 / (scale.x / scale.y)), UVOffset:Vec2(0,0.3) , greyOffset: -0.2 + greyOffset, greyScale: true, greyMinCutoff:0.0, greyRange:Vec2(0.0, 0.4)})]} />
    </instancedMesh>
  )
}

const Brace = ({scale, position, rotation=new THREE.Euler(0,0,0), UVScale=Vec2(1,1), greyScale=true, greyOffset=0}) => {
  const { gl } = useThree();
  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = tex.WrapT = THREE.MirroredRepeatWrapping;
  const sz = Vec3();
  gl.getSize(sz);
  const eulerAngles = new THREE.Euler(MathUtils.degToRad(rotation.x), MathUtils.degToRad(rotation.y), MathUtils.degToRad(rotation.z));

  return (
    <instancedMesh count={26} scale={[scale.x, scale.y, scale.z]}  position={[position.x, position.y, position.z]} rotation={rotation}>
      <planeGeometry args={[tex.image.width, tex.image.height]} />
      <shaderMaterial args={[Shader({map:tex, UVScale: Vec2(UVScale.x, UVScale.y / (scale.x / scale.y)), UVOffset:Vec2(0,0.6), greyOffset:-0.2 + greyOffset, greyMinCutoff:0.0, greyMaxCutoff:1, greyRange: Vec2(0.0, 0.4), greyScale})]}   wireframe={false} />
    </instancedMesh>
  );
}

const Osaranma = ({position=Vec2(0,0,0)}) => {
  const {gl} = useThree();
  const size = Vec3();
  gl.getSize(size);

  const Struts = ({position}) => {

    const Strut = ({position}) => {
      const scale = Vec3(0.000423, 0.0001, 1);
      const tex = useLoader(THREE.TextureLoader, roughWood);
      tex.WrapS = THREE.MirroredRepeatWrapping;
      tex.WrapT = THREE.MirroredRepeatWrapping;
      
      return (
        <instancedMesh count={52} position={position} scale={scale} rotation={new THREE.Euler(0,0,MathUtils.degToRad(-90))}>
          <planeGeometry args={[tex.image.width, tex.image.height]} />
          <shaderMaterial args={[Shader({map:tex, UVScale:Vec2(1,  1 / (scale.x / scale.y)), UVOffset:Vec2(0,Math.random() * 0.3) , greyOffset: -0.3, greyScale: true, greyMinCutoff:0.0, greyRange:Vec2(0.0, 0.4)})]} />
        </instancedMesh>
      );
    }
    const strutArray = Array(52).fill(<></>).map((strut, index) => {
      return (
        <Strut key={index} position={Vec3(position.x - (index * 0.1395), position.y + 0, position.z +  0)} />
      );
    })

    return (
      <>
        {strutArray}
      </>
    )
  }

  return (
    <>
      <Brace position={Vec3(position.x, position.y, position.z)} scale={Vec3(0.0044, 0.000725, 1)} UVScale={Vec2(1,0.5)} />
      <Brace position={Vec3(position.x, position.y + 0.32499999999999996, position.z - 0.1)} scale={Vec3(-0.0062475, -0.0001, 1)} UVScale={Vec2(0.02,0.5)} greyScale={true} greyOffset={-0.075} />
      <Brace position={Vec3(position.x - 1.2500000000000004, position.y + 0.16999999999999993, position.z - 0.1)} scale={Vec3(-0.0062475, -0.00044167, 1)} UVScale={Vec2(1,0.5)} greyScale={true} greyOffset={-0.075} />
      <Struts position={Vec3(position.x + 3.2944999999999998, position.y + 0.577, position.z - 0.1)} />
      <Post position={Vec3(position.x + 3.37, position.y + 0.55, position.z)} scale={Vec3(0.0005, 0.0004, 1)} greyOffset={-0.075} />
    </>
  );
}

const Strut = ({scale, position, greyOffset=0.0, rotation=new THREE.Euler(0,0,0)}) => {
  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = THREE.MirroredRepeatWrapping;
  tex.WrapT = THREE.MirroredRepeatWrapping;
  return (
    <instancedMesh count={16} position={position} scale={scale} rotation={rotation}>
      <planeGeometry args={[tex.image.width, tex.image.height]} />
      <shaderMaterial args={[Shader({map:tex, UVScale:Vec2(1,  1 / (scale.x / scale.y)), UVOffset:Vec2(Math.random() * 0.3, 0) , greyOffset: -0.3, greyScale: true, greyMinCutoff:0.0, greyRange:Vec2(0.0, 0.4)})]} wireframe={false} />
    </instancedMesh>
  );
}

const Strut2 = ({scale=Vec3(1,1,1), position=Vec3(0,0,0), greyOffset=0.0, rotation=new THREE.Euler(0,0,0)}) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = THREE.MirroredRepeatWrapping;
  tex.WrapT = THREE.MirroredRepeatWrapping;

  const texHalfWidth = tex.image.width * dpr *  (Math.abs(rotation.z) > 0 ? scale.x : scale.y) * 0.5;
  const texHalfHeight = tex.image.height * dpr * (Math.abs(rotation.z) > 0 ? scale.y : scale.x) * 0.5;

  return (
    <instancedMesh count={20} position={Vec3(position.x, position.y, position.z)} scale={scale} rotation={rotation}>
      <planeGeometry args={[tex.image.width * dpr, tex.image.height * dpr]} />
      <shaderMaterial args={[Shader({map:tex, UVScale:Vec2(1,  1 / (scale.x / scale.y)), UVOffset:Vec2(Math.random() * 0.3, 0) , greyOffset: -0.3, greyScale: true, greyMinCutoff:0.0, greyRange:Vec2(0.0, 0.4)})]} wireframe={false} />
    </instancedMesh>
  );
}

const Shoji = ({scale=Vec3(0,0,0), position, greyOffset=0.0, rotation=new THREE.Euler(0,0,0)}) => {
  
  const Lattice = ({position}) => {
    const hLatticeArray = Array(13).fill(null).map((_, index) => {
      return (
        <Strut key={index} position={Vec3(position.x, position.y - 0.35 -  (index + 1) * 0.4, position.z)} scale={Vec3(0.001875, 0.000075, 1)}  />
      );
    })

    const vLatticeArray = Array(4).fill(null).map((_, index) => {
      return (
        <Strut key={index} position={Vec3(position.x + 1.5 - (index + 1) * 0.6, position.y - 3.125, position.z)} scale={Vec3(0.003475, 0.00015, 1)} rotation={new THREE.Euler(0,0,-(Math.PI / 2))} />
      );
    })

    // position={Vec3(-5.75, 2, -5.5)}

    return (
      <>
      {hLatticeArray}
      {vLatticeArray}
      <Strut position={Vec3(position.x - 1.555, position.y - 3.125, position.z)} scale={Vec3(0.0035, 0.0005, 1)} rotation={new THREE.Euler(0,0,-(Math.PI / 2))} />
      <Strut position={Vec3(position.x, position.y - 0.375, position.z - 0)} scale={Vec3(0.0019, 0.000325, 1)} />
      <Strut position={Vec3(position.x, position.y - 5.9, position.z - 0)} scale={Vec3(0.0019, 0.000325, 1)} />
      {/* <Brace scale={Vec3(0.0065,0.00075,1)} position={Vec3(-9,-3.95,-5.625)} rotation={new THREE.Euler(-(Math.PI / 2), 0, 0)} greyScale={true} greyOffset={-0.075} /> */}
      </>
    )
  }

  return (
    <>
      <Lattice position={Vec3(position.x - 0.0475, position.y, position.z)} />
      <WallPaper map={plaster} scale={Vec3(0.00095, 0.00178, 1)} position={Vec3(position.x - 0.1, position.y - 3.175, position.z - 0.125)} />
    </>
  );
}

// const Shoji = ({scale=Vec3(0,0,0), position, greyOffset=0.0, rotation=new THREE.Euler(0,0,0)}) => {
  
//   const Lattice = ({position}) => {
//     const hLatticeArray = Array(13).fill(null).map((_, index) => {
//       return (
//         <Strut key={index} position={Vec3(position.x, position.y - 0.35 - (index + 1) * 0.4, position.z)} scale={Vec3(0.001875, 0.000075, 1)}  />
//       );
//     })

//     const vLatticeArray = Array(4).fill(null).map((_, index) => {
//       return (
//         <Strut key={index} position={Vec3(position.x - 1.5 + (index + 1) * 0.6, position.y - 3.125, position.z)} scale={Vec3(0.003475, 0.00015, 1)} rotation={new THREE.Euler(0,0,-(Math.PI / 2))} />
//       );
//     })

//     // position={Vec3(-5.75, 2, -5.5)}

//     return (
//       <>
//       {hLatticeArray}
//       {vLatticeArray}
//       <Strut position={Vec3(position.x, position.y - 3.125, position.z)} scale={Vec3(0.0035, 0.0005, 1)} rotation={new THREE.Euler(0,0,-(Math.PI / 2))} />
//       <Strut position={Vec3(position.x, position.y - 0.375, position.z - 0)} scale={Vec3(0.0019, 0.000325, 1)} />
//       <Strut position={Vec3(position.x, position.y - 5.9, position.z - 0)} scale={Vec3(0.0019, 0.000325, 1)} />
//       {/* <Brace scale={Vec3(0.0065,0.00075,1)} position={Vec3(-9,-3.95,-5.625)} rotation={new THREE.Euler(-(Math.PI / 2), 0, 0)} greyScale={true} greyOffset={-0.075} /> */}
//       </>
//     )
//   }

//   return (
//     <>
//       <Lattice position={Vec3(position.x, position.y, position.z)} />
//       <WallPaper map={plaster} scale={Vec3(0.00095, 0.00178, 1)} position={Vec3(position.x, position.y, position.z - 0.125)} />
//     </>
//   );
// }

const Fusuma = ({map=null, position=Vec3(0,0,0), scale=Vec3(1,1,1), useMap2=false, map2=null}) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, plaster);
  const texHalfWidth = Math.abs(tex.image.width * dpr * scale.x * 0.5);
  const texHalfHeight = Math.abs(tex.image.height * dpr * scale.y * 0.5);

  
  return (
    <>
      <Strut2 position={Vec3(position.x, position.y + texHalfHeight, position.z + 0.000000001)} scale={Vec3(scale.x * 1.045, 0.00025, 1)} />
      <Strut2 position={Vec3(position.x - texHalfWidth + 0.015, position.y, position.z + 0.000000001)} scale={Vec3(scale.y * 0.96, 0.00025, 1)} rotation={new THREE.Euler(0,0,-(Math.PI / 2))} />
      <WallPaper map={plaster} scale={Vec3(scale.x * 0.945, scale.y * 0.96, scale.z)} position={Vec3(position.x, position.y, position.z - 0.000000001)} />
      <Backdrop map={hikite} position={Vec3(position.x + tex.image.width * dpr * scale.x * 0.4, position.y, 0.006)} scale={Vec3(0.000125, 0.000125, 1)} UVScale={Vec2(0.88,1)} greyScale={true} greyOffset={-0.2} useBackMap={false} backMap={plaster}  alphaMinCutoff={0.1} />
      <Strut2 position={Vec3(position.x + texHalfWidth - 0.015, position.y, position.z + 0.000000001)} scale={Vec3(scale.y * 0.96, 0.00025, 1)} rotation={new THREE.Euler(0,0,-(Math.PI / 2))} />
      <Strut2 position={Vec3(position.x, position.y - texHalfHeight, position.z + 0.000000001)} scale={Vec3(scale.x * 1.045, 0.00025, 1)} />
    </>
  )
}

const SvgMesh = ({svg, position = ZERO_VEC_2, scale=ONE_VEC_3, color=ONE_VEC_3}) => {
  const svgData = useLoader(SVGLoader, svg);
  
  let meshes = useMemo(() => svgData.paths.map((shapePath, i) => {
    if (i % 5 === 0 || i % 5 === 2 | i % 2 === 3) return null;
    const shapes = shapePath.toShapes();

    const geometry = new THREE.ShapeGeometry(shapes, 16);
    geometry.scale(scale.x, scale.y, scale.z);
    geometry.translate(position.x, position.y, position.z);
    const material = new THREE.ShaderMaterial(woodMaterial(new THREE.Vector4(color[0], color[1], color[2], color[3])));
    return <line {...{key:i, geometry, material}} />
    
  }), [color, position.x, position.y, position.z, scale.x, scale.y, scale.z, svgData.paths]); // 'color', 'position.x', 'position.y', 'position.z', 'scale.x', 'scale.y', 'scale.z', and 'svgData.paths'

  return <>{meshes}</>;
};

const WallPaper = ({map=null, position=Vec3(0,0,0), scale=Vec3(1,1,1), renderOrder, UVScale=Vec2(1,1), UVOffset=Vec2(1,1), useMap2=false, map2=null, map2UVScale=Vec2(1,1), map2Scale=0.0}) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, map || whiteWall);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.format = THREE.RGBAFormat;
  const texSize = Vec2(tex.image.width, tex.image.height);

  const map2Tex = useLoader(THREE.TextureLoader, map2 || glass);
  map2Tex.wrapS = map2Tex.wrapT = THREE.MirroredRepeatWrapping;

  return (
    <mesh scale={[scale.x,scale.y,scale.z]} position={[position.x, position.y, position.z]} renderOrder={renderOrder} >
      <planeGeometry args={[texSize.x * dpr, texSize.y * dpr]} />
      <shaderMaterial args={[Shader({map:tex, UVScale:Vec2(UVScale.x, UVScale.y / (scale.x / scale.y)), UVOffset, RGBOffset:Vec3(0.3, 0.3, 0.3), greyScale: false, alphaRange:Vec2(0.1, 0.35), alphaMinCutoff:0.0, alphaMaxCutoff:1, greyOffset:-0.1, useMap2, map2: map2Tex, map2UVScale, map2Scale})]} wireframe={false} />
    </mesh>
  );
}

// const WallPaper = ({map=null, position, scale, renderOrder, UVScale=Vec2(1,1), useMap2=false, map2=null, map2UVScale=Vec2(1,1), map2Scale=0.0}) => {
//   const { gl } = useThree();
//   const dpr = gl.getPixelRatio();

//   const tex = useLoader(THREE.TextureLoader, map || whiteWall);
//   tex.wrapS = THREE.RepeatWrapping;
//   tex.wrapT = THREE.RepeatWrapping;
//   tex.format = THREE.RGBAFormat;
//   const texSize = Vec2(tex.image.width, tex.image.height);

//   const texHalfWidth = tex.image.width * scale.x * 0.5;
//   const texHalfHeight = tex.image.height * scale.y * 0.5;

//   const map2Tex = useLoader(THREE.TextureLoader, map2 || glass);
//   map2Tex.wrapS = map2Tex.wrapT = THREE.MirroredRepeatWrapping;

//   return (
//     <mesh scale={[scale.x,scale.y,scale.z]} position={[position.x - texHalfWidth, position.y + texHalfHeight, position.z]} renderOrder={renderOrder} >
//       <planeGeometry args={[texSize.x * dpr, texSize.y * dpr]} />
//       <shaderMaterial args={[Shader({map:tex, UVScale:Vec2(UVScale.x, UVScale.y / (scale.x / scale.y)), UVOffset:Vec2(0.2,0.01), RGBOffset:Vec3(0.3, 0.3, 0.3), greyScale: false, alphaRange:Vec2(0.1, 0.35), alphaMinCutoff:0.0, alphaMaxCutoff:1, greyOffset:-0.1, useMap2, map2: map2Tex, map2UVScale, map2Scale})]} wireframe={false} />
//     </mesh>
//   );
// }

const Backdrop = ({map=null, position=Vec3(0,0,0), scale=Vec3(1,1,1), UVScale=Vec2(1, 1), UVOffset=Vec2(0,0), RGBOffset=Vec3(0,0,0), greyScale=false, greyOffset=0, greyRange=Vec2(0, 1.0), greyMinCutoff=0.0, greyMaxCutoff=1.0, alphaMinCutoff=0.0, alphaMaxCutoff=1.0, useBackMap=false, backMap=null, antialias=false, alphaRange=Vec2(0,1), redRange=Vec2(0,1), greenRange=Vec2(0,1), blueRange=Vec2(0,1),  renderOrder=0}) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, map)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  console.log(`tex:`, tex);


  const backMapTex = useLoader(THREE.TextureLoader, backMap);
  backMapTex.wrapS = tex.wrapT = THREE.RepeatWrapping;

  console.log(`backMapTex:`, backMapTex);

  return (
    <mesh position={position} scale={scale} renderOrder={renderOrder} >
      <planeGeometry args={[tex.image.width * dpr, tex.image.height * dpr]} />
      <shaderMaterial args={[Shader({map: tex, UVScale:Vec2(UVScale.x, UVScale.y / (scale.x / scale.y)), UVOffset, RGBOffset, greyScale, greyRange, greyOffset, greyMinCutoff, greyMaxCutoff, alphaMinCutoff, alphaMaxCutoff, alphaRange, useBackMap, backMap:backMapTex, antialias, redRange, greenRange, blueRange})]} wireframe={false} />
    </mesh>
  )

}

const GLInterior = (props) => {
  const { camera } = useThree();
  // console.log(`camera:`, camera);

  camera.position.z = 5;
  camera.position.y = 0;
  camera.rotation.x = 0;
  

  let camAnimMixer, camPanXTrack, camPanYTrack, camPanZTrack, camRotXTrack, camZoomTrack, camAnimClip, camAnimAction;
  camPanXTrack = new THREE.NumberKeyframeTrack('.position[x]',[0,16,20], [-15,5,0],THREE.InterpolateLinear);
  camPanYTrack = new THREE.NumberKeyframeTrack('.position[y]',[0,16,23, 27], [2.95, 2.95, -0.4, 0],THREE.InterpolateLinear);
  camPanZTrack = new THREE.NumberKeyframeTrack('.position[z]',[0,16,20, 27 ], [1.125, 1.125, 4, 5],THREE.InterpolateLinear);
  camRotXTrack = new THREE.NumberKeyframeTrack('.rotation[x]',[0,16,20, 27 ], [0, 0, (Math.PI / 180 * 10), 0],THREE.InterpolateLinear);

  // camZoomTrack = new THREE.NumberKeyframeTrack('.zoom',[0,10,11], [64,64,1], THREE.InterpolateSmooth);
  camAnimClip = new THREE.AnimationClip('camAm',27,[camPanXTrack,camPanYTrack,camPanZTrack,camRotXTrack]);

  camAnimMixer = new THREE.AnimationMixer(camera);
  camAnimAction = camAnimMixer.clipAction(camAnimClip);
  camAnimAction.setLoop(THREE.LoopOnce);
  camAnimAction.play();

  useFrame((state, delta) => {
    camAnimMixer?.update(delta);
  })

  return (
  <>
    <Post scale={Vec3(0.004,0.0015,1)} position={Vec3(0.0,-0.8,0)} renderOrder={35} />
    <WallPaper scale={Vec3(0.004205,0.0009,1)} position={Vec3(3.6, 1.65,0)} UVScale={Vec2(1, 1)} UVOffset={Vec2(0.2,0.01)} useMap2={true} map2UVScale={Vec2(2,0.25)} map2Scale={0.05} />
    <Brace scale={Vec3(0.0021, -0.0012, 0.0001)} position={Vec3(1.6, -2.655, -5)} UVScale={Vec2(0.5,0.5)} greyOffset={-0.1} />
    <Post scale={Vec3(0.004,0.0013,1)} position={Vec3(3.8,-0.8,-6)} greyOffset={-0.12} />
    <Mat position={Vec3(3.1, -2.7, -7)} scale={Vec3(0.000925, 0.000925, 0.01)} rotation={Vec3(-90,0,-90)} rightTrim={false} greyOffset={-0.3} />
    <Shoji position={Vec3(2.3, 1.8, -12.5)} scale={Vec3(1,0.65,1)} />
    {/* <Backdrop map={gotama} position={Vec3(4.5,-0.2,-4)} scale={Vec3(0.00035, 0.00035, 1)} UVOffset={Vec2(0,0)} greyScale={false} greyRange={Vec2(0.7, 1.0)} alphaRange={Vec2(0.0,1)} UVScale={Vec2(1,1)} redRange={Vec2(0.0, 0.1)} greenRange={Vec2(0.0, 0.1)} blueRange={Vec2(0,0)} alphaMinCutoff={0.3} alphaMaxCutoff={1} RGBOffset={Vec3(0.0,0.0,0)} backMap={gotama} /> */}
    <Backdrop map={gotama} position={Vec3(1.95,-2,-11)} scale={Vec3(0.0008, 0.0008, 1)} UVOffset={Vec2(0,0)} greyScale={true} greyOffset={-0.8} greyMinCutoff={0.0} greyMaxCuttoff={1.0} greyRange={Vec2(0.0, 1)} alphaRange={Vec2(0.0,1)} UVScale={Vec2(1,1)} alphaMinCutoff={0.4} alphaMaxCutoff={1} RGBOffset={Vec3(0.0,0.0,0)} backMap={gotama} />
    {/* <Backdrop map={woodPanel1} position={Vec3(3, -0.2, 0)} scale={Vec3(0.0075, 0.00075, 1)} UVScale={Vec2(1, 1)} backMap={woodPanel1}/> */}

    <Brace scale={Vec3(0.0042, -0.0005, 1)} position={Vec3(3.59225,1.05,0)} renderOrder={45} />
    <Mat position={Vec3(3.56, -3.1, -1.176)} scale={Vec3(0.000925, 0.000925, 0.01)} rotation={Vec3(-90,0,-90)} rightTrim={true} />
    <Mat position={Vec3(7.1065, -3.1, -1.176)} scale={Vec3(0.000925, 0.000925, 0.01)} rotation={Vec3(-90,0,-90)} rightTrim={true} />
    <Mat position={Vec3(10.653, -3.1, -1.176)} scale={Vec3(0.000925, 0.000925, 0.01)} rotation={Vec3(-90,0,-90)} rightTrim={true} />
    <Mat position={Vec3(14.1995, -3.1, -1.176)} scale={Vec3(0.000925, 0.000925, 0.01)} rotation={Vec3(-90,0,-90)} rightTrim={true} />

    <Fusuma map={plaster} position={Vec3(5.2, -1, 0)} scale={Vec3(0.000975, 0.001185, 1)} />

    <Brace scale={Vec3(-0.0042, 0.00025, 1)} position={Vec3(3.59223,-3.1,-0.175)} rotation={new THREE.Euler(-(Math.PI / 2), 0, 0)} greyOffset={-0.1} />
    <Brace scale={Vec3(0.0042, -0.0005, 1)} position={Vec3(3.59225,-3.1,0)} renderOrder={45} />
    <WallPaper map={plaster} scale={Vec3(0.0021, 0.0001975, 1)} position={Vec3(3.59225,-3.5,0)} UVOffset={Vec2(0.2,0.01)}  />

    <WallPaper map={paper} position={Vec3(-9.3,3.38,-5.775)} scale={Vec3(0.00325,0.0009,1)} UVOffset={Vec2(0.2,0.01)} renderOrder={5} />
    <Backdrop map={ryouanji} position={Vec3(-10.5,-1,-5.9)} scale={Vec3(0.0010,0.0012,1)} UVScale={Vec2(0.8, 0.8)} UVOffset={Vec2(0.33, 0)} greyScale={true} greyRange={Vec2(0.0, 0.7)} backMap={ryouanji} />
    <Brace scale={Vec3(0.0065,0.00075,1)} position={Vec3(-9.3,1.8,-5.63)} rotation={new THREE.Euler(0, 0, 0)} greyScale={true} greyOffset={-0.075} />
    
    <Shoji position={Vec3(-5.75, 2, -5.5)} />
    
    <Osaranma position={Vec3(-3.65, 1.4, -0.3)} />
    
    <Brace scale={Vec3(0.0021, -0.0019, 0.0001)} position={Vec3(-1.925, -3.655, -3.85)} UVScale={Vec2(0.5,0.5)} />
    <Post scale={Vec3(0.005,0.0012,.0001)} position={Vec3(-3.459,-0.2,-3.85)} />
    <WallPaper scale={Vec3(0.0021025,0.006575,1)} position={Vec3(-1.6, 0.58,-3.85)} UVScale={Vec2(1,1)} UVOffset={Vec2(0.2,0.01)} useMap2={true} map2UVScale={Vec2(1,1)} map2Scale={0.05} />
    <Mat position={Vec3(-0.5, -3.12, -2.075)} scale={Vec3(0.000975, 0.0006975, 0.01)} sizeX={3} sizeY={0} trimColorOffset={0.15} />
    <Brace scale={Vec3(0.002075,0.000375,1)} position={Vec3(-1.88,-0.09,-1.651)} rotation={new THREE.Euler(0, 0, 0)} greyScale={true} greyOffset={-0.075} />
    <WallPaper map={plaster} scale={Vec3(0.00105125,0.00095,1)} position={Vec3(-1.9, 1.4,-1.652)} UVScale={Vec2(1,1)} UVOffset={Vec2(0.2,0.01)} useMap2={false} map2UVScale={Vec2(1,1)} map2Scale={0.05} />
    <Brace scale={Vec3(0.0021, -0.0019, 0.0001)} position={Vec3(-1.925, -3.655, -1.65)} UVScale={Vec2(0.5,0.5)} />
    
    <Mat position={Vec3(-0.566, -3.95, -0.78)} scale={Vec3(0.000925, 0.000925, 0.01)} rotation={Vec3(-90,0,-90)}/>
    <Mat position={Vec3(-4.1125, -3.95, -0.78)} scale={Vec3(0.000925, 0.000925, 0.01)} />
    <Mat position={Vec3(-7.659, -3.95, -0.78)} scale={Vec3(0.000925, 0.000925, 0.01)} />
    <Mat position={Vec3(-11.2055, -3.95, -0.78)} scale={Vec3(0.000925, 0.000925, 0.01)} />
    
    <Post scale={Vec3(0.005,0.0012,.0001)} position={Vec3(-3.725,-0.675,-1.65)} />
    <Post scale={Vec3(0.0055,0.0017,1)} position={Vec3(-11.075,0.15,-5.55)}  />
    <Post scale={Vec3(0.0055,0.0015,1)} position={Vec3(-10.975,0.27,-5.8)} rotation={new THREE.Euler(0, Math.PI / 2, (Math.PI / 2))} greyScale={true} greyOffset={-0.075} />
    <Brace scale={Vec3(0.0065,0.00075,1)} position={Vec3(-9,-3.95,-5.625)} rotation={new THREE.Euler(-(Math.PI / 2), 0, 0)} greyScale={true} greyOffset={-0.075} />

  </>
  );
};

export default GLInterior;