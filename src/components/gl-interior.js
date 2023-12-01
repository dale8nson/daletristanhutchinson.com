import { useMemo, useRef, forwardRef, useCallback, useEffect, useState, Suspense } from 'react';
import * as React from 'react';
import { useThree, useLoader, useFrame, Canvas, createPortal } from '@react-three/fiber';
import { useVideoTexture, useFont, Html, useFBO } from '@react-three/drei';
import whiteWall from '../assets/white-wall.png';
import tatami from '../assets/TexturesCom_Wicker0046_12_seamless_S.jpg';
import tatamiTrim from '../assets/TexturesCom_Wicker0046_15_S.jpg';
import roughWood from '../assets/TexturesCom_WoodRough0003_M.jpg';
import * as THREE from 'three';
import { MathUtils } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { StdShader } from './shaders/shader';
import kouzan from '../assets/fonts/KouzanBrushFontSousyo_Regular copy.json';
import glass from '../assets/Texturelabs_Glass_154L.jpg';
import paper from '../assets/TCom_PaperDecorative0032_1_seamless_M.jpeg';
import plaster from '../assets/TCom_PlasterBare0143_1_seamless_M.jpeg'
import ryouanji from '../assets/victor-lu-1EJX-rotoeg-unsplash.jpg';
import hikite from '../assets/hikite.png';
import gotama from '../assets/Gotama-edited.png';
import woodPanel1 from '../assets/TCom_WoodFine0082_3_seamless_M.jpeg';
import planks from '../assets/TCom_Wood_PlanksTemple2_2x2_512_albedo.png';
import autumnLeaves from '../assets/pexels_videos_1777892 (720p).mp4'
import { extend } from '@react-three/fiber';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextTex } from '.';
import lt from '../assets/fonts/Lemon Tuesday_Regular.json';
import rhb from '../assets/fonts/Roundhand_Bold.json';
import nanum from '../assets/fonts/Nanum Pen_Regular.json'


import estonia from '../assets/fonts/Estonia_Regular.json';

extend({ TextGeometry });
extend({ TextTex });
const ANIMATIONS = true;

const vec2 = (n1 = null, n2 = null) => new THREE.Vector2(n1, n2);
const vec3 = (n1 = null, n2 = null, n3 = null) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1, n2, n3, n4) => new THREE.Vector4(n1, n2, n3, n4);

const ZERO_VEC_2 = vec2(0, 0);
const ONE_VEC_3 = vec3(1, 1, 1);

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
      map: { value: map || null },
      map2: { value: map2 || null },
      useMap2: { value: useMap2 || false },
      map2Scale: { value: map2Scale || 1.0 },
      map2UVScale: { value: map2UVScale || vec2(1, 1) },
      useBackMap: { value: useBackMap || false },
      backMap: { value: backMap || null },
      antialias: { value: antialias || false },
      UVScale: { value: UVScale || vec2(1, 1) },
      UVOffset: { value: UVOffset || vec2(0, 0) },
      RGBScale: { value: RGBScale || vec3(1, 1, 1) },
      RGBOffset: { value: RGBOffset || vec3(0, 0, 0) },
      alphaRange: { value: alphaRange || vec2(0.0, 1.0) },
      alphaMinCutoff: { value: alphaMinCutoff || 0.0 },
      alphaMaxCutoff: { value: alphaMaxCutoff || 1.0 },
      greyOffset: { value: greyOffset || 0.0 },
      greyScale: { value: greyScale || false },
      greyMinCutoff: { value: greyMinCutoff || 0 },
      greyMaxCutoff: { value: greyMaxCutoff || 1 },
      negative: { value: negative || 0.0 },
      redRange: { value: redRange || vec2(0, 1) },
      greenRange: { value: greenRange || vec2(0, 1) },
      blueRange: { value: blueRange || vec2(0, 1) },
      greyRange: { value: greyRange || vec2(0, 1) }
    },
    vertexShader: vertexPass,
    fragmentShader: /* glsl */`

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

  return mat;

}

const woodMaterial = (color = new THREE.Vector4(1.0, 1.0, 1.0, 1.0)) => {
  return {
    uniforms: {
      color: { value: color }
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

const Mat = ({ position, scale = vec3(1, 1, 1), rotation = vec3(-90, 0, 90), sizeX = 3, sizeY = 2, trimColorOffset = 0.0, rightTrim = false, greyOffset = 0 }) => {

  const { gl, scene, camera } = useThree();
  const dpr = gl.getPixelRatio();

  // console.log(`world position:`, position);

  const localPosition = scene.worldToLocal(position);
  // const localPosition = scene.localToWorld(position);


  // console.log(`local position:`, position);


  const tatamiTex = useLoader(THREE.TextureLoader, tatami);
  tatamiTex.WrapS = THREE.RepeatWrapping;
  tatamiTex.WrapT = THREE.RepeatWrapping;

  const texSz = vec2(tatamiTex.image.width * dpr, tatamiTex.image.height * dpr);
  const texWidth = texSz.y * scale.y;
  const texHeight = texSz.x * scale.x;

  const tatamiTrimTex = useLoader(THREE.TextureLoader, tatamiTrim);
  tatamiTrimTex.WrapT = THREE.RepeatWrapping;
  tatamiTrimTex.wrapS = THREE.RepeatWrapping;

  const trimSz = vec2(tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr);
  const trimWidth = trimSz.y * scale.y;
  const trimHeight = trimSz.x * scale.x;
  const trimScaleY = (texHeight / trimSz.x);

  const eulerAngles = new THREE.Euler(MathUtils.degToRad(rotation.x), MathUtils.degToRad(rotation.y), MathUtils.degToRad(rotation.z));

  return (
    <group>
      <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x, localPosition.y, localPosition.z]} receiveShadow={true} >
        <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
        <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
      </mesh>
      {sizeX >= 1 && (
        <>
          <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth, localPosition.y, localPosition.z]} >
            <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
            <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
          </mesh>
          {sizeX >= 2 && (
            <>
              <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 2, localPosition.y, localPosition.z]} >
                <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
              </mesh>
              {sizeX >= 3 && (
                <>
                  <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 3, localPosition.y, localPosition.z]} >
                    <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                    <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
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
            <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
          </mesh>
          {sizeX >= 1 && (
            <>
              <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth, localPosition.y, localPosition.z - texHeight]} >
                <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
              </mesh>
              {sizeX >= 2 && (
                <>
                  <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 2, localPosition.y, localPosition.z - texHeight]} >
                    <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                    <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
                  </mesh>
                  {sizeX >= 3 && (
                    <>

                      <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 3, localPosition.y, localPosition.z - texHeight]} >
                        <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                        <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
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
                <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
              </mesh>
              {sizeX >= 1 && (
                <>
                  <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth, localPosition.y, localPosition.z - texHeight * 2]} >
                    <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                    <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
                  </mesh>

                  {sizeX >= 2 && (
                    <>
                      <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 2, localPosition.y, localPosition.z - texHeight * 2]} >
                        <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                        <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
                      </mesh>
                      {sizeX >= 3 && (
                        <>
                          <mesh rotation={eulerAngles} scale={[scale.x, scale.y, scale.z]} position={[localPosition.x - texWidth * 3, localPosition.y, localPosition.z - texHeight * 2]} >
                            <planeGeometry args={[tatamiTex.image.width * dpr, tatamiTex.image.height * dpr]} />
                            <shaderMaterial args={[Shader({ map: tatamiTex, UVScale: vec2(1, 1 / (scale.x / scale.y)), greyScale: true, greyOffset: -0.1 + greyOffset, greyRange: vec2(0.5, 0.6) })]} />
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
      <mesh rotation={eulerAngles} position={vec3(rightTrim ? localPosition.x + texWidth - trimWidth / 2 - 0.08 : localPosition.x - texWidth * (sizeX + 1) + trimWidth / 2, localPosition.y + 0.00008, localPosition.z - 0.0)} scale={vec3(trimScaleY * 1.01, 0.000225, 0.01)} >
        <planeGeometry args={[tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr]} />
        <shaderMaterial args={[Shader({ map: tatamiTrimTex, UVScale: vec2(1, 0.9 / (scale.x / scale.y)), UVOffset: vec2(0, 0.14), greyScale: true, greyOffset: -0.2 + trimColorOffset })]} />
      </mesh>
      {sizeY >= 1 && (
        <>
          <mesh rotation={eulerAngles} position={vec3(rightTrim ? localPosition.x + texWidth - trimWidth / 2 - 0.08 : localPosition.x - texWidth * (sizeX + 1) + trimWidth / 2, localPosition.y + 0.00008, localPosition.z - (trimHeight * (sizeY - 1)) - 0.0)} scale={vec3(trimScaleY * 1.01, 0.000225, 0.01)} >
            <planeGeometry args={[tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr]} />
            <shaderMaterial args={[Shader({ map: tatamiTrimTex, UVScale: vec2(1, 0.9 / (scale.x / scale.y)), UVOffset: vec2(0, 0.14), greyScale: true, greyOffset: -0.2 + trimColorOffset })]} />
          </mesh>
          {sizeY >= 2 && (
            <mesh rotation={eulerAngles} position={vec3(rightTrim ? localPosition.x + texWidth - trimWidth / 2 - 0.08 : localPosition.x - texWidth * (sizeX + 1) + trimWidth / 2, localPosition.y + 0.00008, localPosition.z - (trimHeight * sizeY) - 0.0)} scale={vec3(trimScaleY * 1.01, 0.000225, 0.01)} >
              <planeGeometry args={[tatamiTrimTex.image.width * dpr, tatamiTrimTex.image.height * dpr]} />
              <shaderMaterial args={[Shader({ map: tatamiTrimTex, UVScale: vec2(1, 0.9 / (scale.x / scale.y)), UVOffset: vec2(0, 0.14), greyScale: true, greyOffset: -0.2 + trimColorOffset })]} />
            </mesh>
          )}
        </>
      )}
    </group>
  );
}


const Post = ({ scale, position, greyOffset = 0.0, rotation = new THREE.Euler(0, 0, -(2 * Math.PI / 4)) }) => {

  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = THREE.MirroredRepeatWrapping;
  tex.WrapT = THREE.MirroredRepeatWrapping;

  return (
    <instancedMesh count={13} rotation={new THREE.Euler(rotation.x, rotation.y, rotation.z)} scale={[scale.x, scale.y, scale.z]} position={[position.x, position.y, position.z]} castShadow={true}  >
      <planeGeometry args={[tex.image.width, tex.image.height]} />
      <shaderMaterial args={[Shader({ map: tex, UVScale: vec2(1, 1 / (scale.x / scale.y)), UVOffset: vec2(0, 0.3), greyOffset: -0.2 + greyOffset, greyScale: true, greyMinCutoff: 0.0, greyRange: vec2(0.0, 0.4) })]} />
    </instancedMesh>
  )
}

const Brace = ({ scale = vec3(1, 1, 1), position = vec3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0), UVScale = vec2(1, 1), greyScale = true, greyOffset = 0 }) => {
  const { gl } = useThree();
  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = tex.WrapT = THREE.MirroredRepeatWrapping;
  const sz = vec3();
  gl.getSize(sz);
  const eulerAngles = new THREE.Euler(MathUtils.degToRad(rotation.x), MathUtils.degToRad(rotation.y), MathUtils.degToRad(rotation.z));

  return (
    <instancedMesh count={26} scale={[scale.x, scale.y, scale.z]} position={[position.x, position.y, position.z]} rotation={rotation} castShadow={true}>
      <planeGeometry args={[tex.image.width, tex.image.height]} />
      <shaderMaterial args={[Shader({ map: tex, UVScale: vec2(UVScale.x, UVScale.y / (scale.x / scale.y)), UVOffset: vec2(0, 0.6), greyOffset: -0.2 + greyOffset, greyMinCutoff: 0.0, greyMaxCutoff: 1, greyRange: vec2(0.0, 0.4), greyScale })]} wireframe={false} />
    </instancedMesh>
  );
}

const Osaranma = ({ position = vec2(0, 0, 0) }) => {
  const { gl } = useThree();
  const size = vec3();
  gl.getSize(size);

  const Struts = ({ position }) => {

    const Strut = ({ position }) => {
      const scale = vec3(0.000429, 0.0001, 1);
      const tex = useLoader(THREE.TextureLoader, roughWood);
      tex.WrapS = THREE.MirroredRepeatWrapping;
      tex.WrapT = THREE.MirroredRepeatWrapping;

      return (
        <instancedMesh count={52} position={position} scale={scale} rotation={new THREE.Euler(0, 0, MathUtils.degToRad(-90))} castShadow={true} >
          <planeGeometry args={[tex.image.width, tex.image.height]} />
          <shaderMaterial args={[Shader({ map: tex, UVScale: vec2(1, 1 / (scale.x / scale.y)), UVOffset: vec2(0, Math.random() * 0.3), greyOffset: -0.3, greyScale: true, greyMinCutoff: 0.0, greyRange: vec2(0.0, 0.4) })]} />
        </instancedMesh>
      );
    }
    const strutArray = Array(52).fill(<></>).map((strut, index) => {
      return (
        <Strut key={index} position={vec3(position.x - (index * 0.16), position.y + 0, position.z + 0)} />
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
      <Brace position={vec3(position.x, position.y + 0.05, position.z)} scale={vec3(0.006, 0.000725, 1)} UVScale={vec2(1, 0.5)} />
      <Brace position={vec3(position.x, position.y + 0.32499999999999996, position.z - 0.1)} scale={vec3(-0.0062475, -0.0001, 1)} UVScale={vec2(0.02, 0.5)} greyScale={true} greyOffset={-0.075} />
      <Brace position={vec3(position.x - 1.2500000000000004, position.y + 0.16999999999999993, position.z - 0.1)} scale={vec3(-0.0062475, -0.00044167, 1)} UVScale={vec2(1, 0.5)} greyScale={true} greyOffset={-0.075} />
      <Struts position={vec3(position.x + 3.2944999999999998, position.y + 0.577, position.z - 0.1)} />
      <Post position={vec3(position.x + 3.37, position.y + 0.55, position.z)} scale={vec3(0.0005, 0.0004, 1)} greyOffset={-0.075} />
    </>
  );
}

const Strut = ({ scale, position, greyOffset = 0.0, rotation = new THREE.Euler(0, 0, 0) }) => {
  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = THREE.MirroredRepeatWrapping;
  tex.WrapT = THREE.MirroredRepeatWrapping;
  return (
    <instancedMesh count={16} position={position} scale={scale} rotation={rotation} castShadow={true}>
      <planeGeometry args={[tex.image.width, tex.image.height]} />
      <shaderMaterial args={[Shader({ map: tex, UVScale: vec2(1, 1 / (scale.x / scale.y)), UVOffset: vec2(Math.random() * 0.2, 0), greyOffset: -0.3, greyScale: true, greyMinCutoff: 0.0, greyRange: vec2(0.0, 0.4) })]} wireframe={false} />
    </instancedMesh>
  );
}

const Strut2 = ({ scale = vec3(1, 1, 1), position = vec3(0, 0, 0), UVScale = vec2(1, 1), UVOffset = vec2(0, 0), greyOffset = 0.0, rotation = new THREE.Euler(0, 0, 0) }) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, roughWood);
  tex.WrapS = THREE.MirroredRepeatWrapping;
  tex.WrapT = THREE.MirroredRepeatWrapping;

  const texHalfWidth = tex.image.width * dpr * (Math.abs(rotation.z) > 0 ? scale.x : scale.y) * 0.5;
  const texHalfHeight = tex.image.height * dpr * (Math.abs(rotation.z) > 0 ? scale.y : scale.x) * 0.5;

  return (
    <instancedMesh count={20} position={vec3(position.x, position.y, position.z)} scale={scale} rotation={rotation} castShadow={true} >
      <planeGeometry args={[tex.image.width * dpr, tex.image.height * dpr]} />
      {/* <shaderMaterial args={[Shader({map:tex, UVScale:Vec2(1,  1 / (scale.x / scale.y)), UVOffset:Vec2(Math.random() * 0.3, 0) , greyOffset: -0.3, greyScale: true, greyMinCutoff:0.0, greyRange:Vec2(0.0, 0.4)})]} wireframe={false} /> */}
      <shaderMaterial args={[Shader({ map: tex, UVScale: vec2(UVScale.x, UVScale.y / (tex.image.width / tex.image.height)), UVOffset: UVOffset, greyOffset: -0.3, greyScale: true, greyMinCutoff: 0.0, greyRange: vec2(0.0, 0.4) })]} wireframe={false} />
    </instancedMesh>
  );
}

const Shoji = forwardRef(({ scale = vec3(1, 1, 1), position, greyOffset = 0.0, rotation = new THREE.Euler(0, 0, 0) }, ref) => {

  const Lattice = ({ position }) => {
    const hLatticeArray = Array(13).fill(null).map((_, index) => {
      return (
        <Strut key={index} position={vec3(position.x + 0.05 * scale.x, position.y - 0.35 - (index + 1) * 0.4 * scale.y, position.z * scale.z)} scale={vec3(0.00197 * scale.x, 0.000075 * scale.y, 1 * scale.z)} />
      );
    })

    const vLatticeArray = Array(4).fill(null).map((_, index) => {
      return (
        <Strut key={index} position={vec3(position.x + 1.5 * scale.x - (index + 1) * 0.6 * scale.x, position.y - 3.125 * scale.y, position.z * scale.z)} scale={vec3(scale.y * 0.003385, scale.x * 0.00015, 1)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} />
      );
    })

    return (
      <>
        {hLatticeArray}
        {vLatticeArray}
        <Strut position={vec3(position.x + 0 * scale.x, position.y - 0.375 * scale.y, position.z * scale.z)} scale={vec3(0.002025 * scale.x, 0.00037 * scale.y, 1 * scale.z)} />
        <Strut position={vec3(position.x - 1.53 * scale.x, position.y - 3.15 * scale.y, position.z * scale.z)} scale={vec3(0.0034 * scale.y, 0.0006 * scale.x, 1 * scale.z)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} />
        <Strut position={vec3(position.x + 1.53 * scale.x, position.y - 3.15 * scale.y, position.z * scale.z)} scale={vec3(0.0034 * scale.y, 0.0006 * scale.x, 1 * scale.z)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} />
        <Strut position={vec3(position.x + 0 * scale.x, position.y - 5.9 * scale.y, position.z * scale.z)} scale={vec3(0.002025 * scale.x, 0.00037 * scale.y, 1 * scale.z)} />
      </>
    )
  }

  return (
    <group ref={ref} position={[position.x, position.y, position.z]} scale={[scale.x, scale.y, scale.z]}
    >
      <Lattice position={vec3(position.x - 0.0475, position.y, position.z)} />
      <WallPaper map={plaster} scale={vec3(0.00097 * scale.x, 0.00178 * scale.y, 1 * scale.z)} position={vec3(position.x - 0.1 * scale.x, position.y - 3.175 * scale.y, position.z - 0.001)} />
    </group>
  );
});

const Fusuma = forwardRef(({ map = null, position = vec3(0, 0, 0), scale = vec3(1, 1, 1), useMap2 = false, map2 = null }, ref) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, plaster);
  const texHalfWidth = Math.abs(tex.image.width * dpr * scale.x * 0.5);
  const texHalfHeight = Math.abs(tex.image.height * dpr * scale.y * 0.5);


  return (
    <group ref={ref}>
      <Strut2 position={vec3(position.x, position.y + texHalfHeight, position.z + 0.000000001)} scale={vec3(scale.x * 1.04, 0.00025, 1)} />
      <Strut2 position={vec3(position.x - texHalfWidth + 0.015, position.y, position.z + 0.000000001)} scale={vec3(scale.y * 0.964, 0.00025, 1)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} UVScale={vec2(0.6, 0.6)} UVOffset={vec2(-0.01, -0.02)} />
      <WallPaper map={plaster} scale={vec3(scale.x * 0.945, scale.y * 0.96, scale.z)} position={vec3(position.x, position.y, position.z - 0.000000001)} />
      <Backdrop map={hikite} position={vec3(position.x + tex.image.width * dpr * scale.x * 0.4, position.y, position.z + 0.01)} scale={vec3(0.000125, 0.000125, 1)} UVScale={vec2(0.88, 1)} greyScale={true} greyOffset={-0.2} useBackMap={false} backMap={plaster} alphaMinCutoff={0.1} />
      <Strut2 position={vec3(position.x + texHalfWidth - 0.015, position.y, position.z + 0.000000001)} scale={vec3(scale.y * 0.964, 0.00025, 1)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} UVScale={vec2(0.6, 0.6)} UVOffset={vec2(0, 0)} />
      <Strut2 position={vec3(position.x, position.y - texHalfHeight, position.z + 0.000000001)} scale={vec3(scale.x * 1.04, 0.00025, 1)} />
    </group>
  )
});

const SvgMesh = ({ svg, position = ZERO_VEC_2, scale = ONE_VEC_3, color = ONE_VEC_3 }) => {
  const svgData = useLoader(SVGLoader, svg);

  let meshes = useMemo(() => svgData.paths.map((shapePath, i) => {
    if (i % 5 === 0 || i % 5 === 2 | i % 2 === 3) return null;
    const shapes = shapePath.toShapes();

    const geometry = new THREE.ShapeGeometry(shapes, 16);
    geometry.scale(scale.x, scale.y, scale.z);
    geometry.translate(position.x, position.y, position.z);
    const material = new THREE.ShaderMaterial(woodMaterial(new THREE.Vector4(color[0], color[1], color[2], color[3])));
    return <line {...{ key: i, geometry, material }} />

  }), [color, position.x, position.y, position.z, scale.x, scale.y, scale.z, svgData.paths]); // 'color', 'position.x', 'position.y', 'position.z', 'scale.x', 'scale.y', 'scale.z', and 'svgData.paths'

  return <>{meshes}</>;
};

const WallPaper = ({ map = null, position = vec3(0, 0, 0), scale = vec3(1, 1, 1), renderOrder, UVScale = vec2(1, 1), UVOffset = vec2(1, 1), useMap2 = false, map2 = null, map2UVScale = vec2(1, 1), map2Scale = 0.0, rotation = new THREE.Euler(0, 0, 0), greyScale = false, greyOffset = 0.0 }) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, map || whiteWall);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.format = THREE.RGBAFormat;
  const texSize = vec2(tex.image.width, tex.image.height);

  const map2Tex = useLoader(THREE.TextureLoader, map2 || glass);
  map2Tex.wrapS = map2Tex.wrapT = THREE.MirroredRepeatWrapping;

  return (
    <mesh scale={[scale.x, scale.y, scale.z]} position={[position.x, position.y, position.z]} rotation={rotation} renderOrder={renderOrder} >
      <planeGeometry args={[texSize.x * dpr, texSize.y * dpr]} />
      <shaderMaterial args={[Shader({ map: tex, UVScale: vec2(UVScale.x, UVScale.y / (scale.x / scale.y)), UVOffset, RGBOffset: vec3(0.3, 0.3, 0.3), greyScale: greyScale, alphaRange: vec2(0.1, 0.35), alphaMinCutoff: 0.0, alphaMaxCutoff: 1, greyOffset: greyOffset, useMap2, map2: map2Tex, map2UVScale, map2Scale })]} wireframe={false} side={THREE.DoubleSide} />
    </mesh>
  );
};



const Backdrop = ({ map = null, position = vec3(0, 0, 0), scale = vec3(1, 1, 1), rotation = new THREE.Euler(0, 0, 0), UVScale = vec2(1, 1), UVOffset = vec2(0, 0), RGBOffset = vec3(0, 0, 0), greyScale = false, greyOffset = 0, greyRange = vec2(0, 1.0), greyMinCutoff = 0.0, greyMaxCutoff = 1.0, alphaMinCutoff = 0.0, alphaMaxCutoff = 1.0, useBackMap = false, backMap = null, antialias = false, alphaRange = vec2(0, 1), redRange = vec2(0, 1), greenRange = vec2(0, 1), blueRange = vec2(0, 1), renderOrder = 0 }) => {
  const { gl } = useThree();
  const dpr = gl.getPixelRatio();

  const tex = useLoader(THREE.TextureLoader, map)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  // console.log(`tex:`, tex);

  const backMapTex = useLoader(THREE.TextureLoader, backMap);
  backMapTex.wrapS = tex.wrapT = THREE.RepeatWrapping;

  // console.log(`backMapTex:`, backMapTex);

  return (
    <mesh position={position} scale={scale} rotation={rotation} renderOrder={renderOrder} >
      <planeGeometry args={[tex.image.width * dpr, tex.image.height * dpr]} />
      <shaderMaterial args={[Shader({ map: tex, UVScale: vec2(UVScale.x, UVScale.y / (scale.x / scale.y)), UVOffset, RGBOffset, greyScale, greyRange, greyOffset, greyMinCutoff, greyMaxCutoff, alphaMinCutoff, alphaMaxCutoff, alphaRange, useBackMap, backMap: backMapTex, antialias, redRange, greenRange, blueRange })]} wireframe={false} />
    </mesh>
  )
};

const GLInterior = ({ registerEventListener, dispatch }) => {
  console.log(`const { gl, scene, camera } = useThree();`)
  const { gl, scene, camera } = useThree();
  const sz = vec2();
  gl.getSize(sz);
  console.log(`gl:`, gl);
  const dpr = gl.getPixelRatio();

  const akiTex = useVideoTexture(autumnLeaves);
  const paperTex = useLoader(THREE.TextureLoader, paper);

  akiTex.wrapS = akiTex.wrapT = THREE.RepeatWrapping;
  // console.log(`akiTex:`, akiTex);
  const glassTex = useLoader(THREE.TextureLoader, glass);
  glassTex.wrapS = glassTex.wrapT = THREE.RepeatWrapping;
  console.log(`glassTex`, glassTex);
  const plasterTex = useLoader(THREE.TextureLoader, plaster);
  plasterTex.wrapS = plasterTex.wrapT = THREE.RepeatWrapping;

  const lemonTuesday = new FontLoader().parse(lt);
  const roundHandBold = new FontLoader().parse(rhb);
  const nanumRegular = new FontLoader().parse(nanum);



  console.log(`const kouzanFont = useLoader(FontLoader, kouzan);`);

  // const kouzanFont = useLoader(FontLoader,kouzan);

  // const kouzanFont = useFont(kouzan);



  // console.log(`camera:`, camera);
  const leftShojiRef = useRef(null);

  let camAnimMixer, camPanXTrack, camPanYTrack, camPanZTrack, camRotXTrack, camAnimClip, camAnimAction;

  // camera.position.x = -8;
  // camera.position.y = 3.1;
  // camera.position.z = 1.2;
  // camera.rotation.y = 0; 

  // camera.position.z = 5;

  // camera.rotation.x = -13;
  // camera.rotation.y = -3.4;
  // camera.rotation.z = 0;

  camera.position.x = -8;
  camera.position.y = 3.1;
  camera.position.z = 1.2;
  // camera.rotation.y = 0;
  // camera.rotation.x = (Math.PI / 180 * 10);

  useEffect(() => {

    camera.position.x = 2;
    camera.position.y = -1.05;
    camera.position.z = 2;
    camera.rotation.x = 0;
    camera.rotation.y = 0;
    camera.rotation.z = 0;

    camPanXTrack = new THREE.NumberKeyframeTrack('.position[x]', [0, 6.5, 9, 12, 14], [-8, 3, 3, 0, 2], THREE.InterpolateLinear);
    camPanYTrack = new THREE.NumberKeyframeTrack('.position[y]', [0, 6.5, 9, 12, 14], [3.1, 3.1, -0.4, -1.05, -1.05], THREE.InterpolateLinear);
    camPanZTrack = new THREE.NumberKeyframeTrack('.position[z]', [0, 6.5, 9, 11, 14], [1.2, 1.2, 4.5, 4.5, 2], THREE.InterpolateLinear);
    camRotXTrack = new THREE.NumberKeyframeTrack('.rotation[x]', [0, 6.5, 9, 12, 14, 16], [0, 0, (Math.PI / 180 * 10), (Math.PI / 180 * 10), -(Math.PI / 180 * 4), 0], THREE.InterpolateSmooth);

    camAnimClip = new THREE.AnimationClip('camAm', 16, [camPanXTrack, camPanYTrack, camPanZTrack, camRotXTrack]);
    camAnimMixer = new THREE.AnimationMixer(camera);
    camAnimAction = camAnimMixer.clipAction(camAnimClip);
    camAnimAction.setLoop(THREE.LoopOnce);
    ANIMATIONS && camAnimAction.play();

  }, []);

  const fusuRef = useRef(null);
  let fusuAnimMixer, fusuXTrack, fusuAnimClip, fusuAction;

  const setupFusuma = useCallback(node => {
    if (!node) return;
    fusuRef.current = node;
    const nodeRef = fusuRef.current;
    fusuAnimMixer = new THREE.AnimationMixer(nodeRef);
    fusuXTrack = new THREE.NumberKeyframeTrack('.position[x]', [0, 11, 15], [-3.9, -3.9, 0], THREE.InterpolateLinear);
    fusuAnimClip = new THREE.AnimationClip('', 16, [fusuXTrack]);
    fusuAction = fusuAnimMixer.clipAction(fusuAnimClip);
    fusuAction.setLoop(THREE.LoopOnce);
    ANIMATIONS && fusuAction.play();
  }, []);

  let leftShojiMixer, leftShojiXCloseTrack, leftShojiXOpenTrack, leftShojiCloseClip, leftShojiOpenClip, openLeftShoji, closeLeftShoji;
  leftShojiXOpenTrack = new THREE.NumberKeyframeTrack('.position[x]', [0, 4, 5], [-6.4, -6.4, -10.1]);
  leftShojiOpenClip = new THREE.AnimationClip('', 5, [leftShojiXOpenTrack]);

  console.log(`const initLeftShoji = useCallback(node => {`)

  const initLeftShoji = useCallback(node => {

    if (!node) return;
    leftShojiRef.current = node;
    const nodeRef = leftShojiRef.current;
    leftShojiMixer = new THREE.AnimationMixer(nodeRef);
    openLeftShoji = leftShojiMixer.clipAction(leftShojiOpenClip);
    openLeftShoji.clampWhenFinished = true;
    openLeftShoji.setLoop(THREE.LoopOnce);
    registerEventListener('open-left-shoji', () => {
      leftShojiRef.current.position.x = -10.1;
      ANIMATIONS && openLeftShoji.play();
      ANIMATIONS && akiBoke.play();
      
      // ANIMATIONS && unblurHaiku.play();
      dispatch('show-about-me');
    })
  }, []);


  const offset = vec2(0, 0);
 

  const akiRef = useRef(null);
  let akiMixer, akiBokeTrack, akiTextBoke, akiBrightnesstrack, map2ScaleTrack, akiClip, akiBoke, UVScaleTrack, map2UVScaleTrack, map2UVOffsetTrack;
  akiBokeTrack = new THREE.NumberKeyframeTrack('.bokehScale', [0, 5, 7], [-0.1, -0.1, 1.5]);
  akiTextBoke = new THREE.NumberKeyframeTrack('.map2BokehScale', [0, 5, 7], [1.0, 1.0, 0.03]);
  akiBrightnesstrack = new THREE.NumberKeyframeTrack('.greyOffset', [0, 5, 7], [0, 0, -0.2]);
  map2ScaleTrack = new THREE.NumberKeyframeTrack('.map2Scale', [0, 5, 7], [0.0, 0.0, 1.0]);
  UVScaleTrack = new THREE.VectorKeyframeTrack('.UVScale', [0,5,7], [0.3, 0.3, 0.3, 0.3, 0.8,0.8]);
  map2UVScaleTrack = new THREE.VectorKeyframeTrack('.map2UVScale', [0,5,7], [1.1,1.1, 1.1, 1.1, 0.85,1.0]);
  map2UVOffsetTrack = new THREE.VectorKeyframeTrack('.map2UVOffset', [0,5,7], [0.0,-0.1, 0.0, -0.1, 0.1,0.0]);

  akiClip = new THREE.AnimationClip('', 7, [akiBokeTrack, akiTextBoke, UVScaleTrack, map2UVScaleTrack, map2UVOffsetTrack, map2ScaleTrack]);

  const initAki = node => {
    if (!node) return;
    akiRef.current = node;
    const nodeRef = akiRef.current;
    if (!Object.hasOwn(nodeRef, 'bokehScale')) {
      Object.defineProperties(nodeRef, {
        UVScale: {
          get() { return this.material.uniforms.UVScale.value; },
          set(val) { this.material.uniforms.UVScale.value = val; }
        },
        bokehScale: {
          get() { return this.material.uniforms.bokehScale.value; },
          set(val) { this.material.uniforms.bokehScale.value = val; }
        },
        map2Scale: {
          get() { 
            return this.material.uniforms.map2Scale.value;
          },
          set(val){
            this.material.uniforms.map2Scale.value = val;
          }
        },
        map2UVScale: {
          get() { 
            return this.material.uniforms.map2UVScale.value;
          },
          set(val){
            this.material.uniforms.map2UVScale.value = val;
          }
        },
        map2UVOffset: {
          get() { 
            return this.material.uniforms.map2UVOffset.value;
          },
          set(val){
            this.material.uniforms.map2UVOffset.value = val;
          }
        },
        map2BokehScale: {
          get() { return this.material.uniforms.map2BokehScale.value; },
          set(val) { this.material.uniforms.map2BokehScale.value = val; }
        },
        greyOffset: {
          get() {
            return this.material.uniforms.greyOffset.value;
          },
          set(val) {
            this.material.uniforms.greyOffset.value = val;
          }
        }
      })
    }

    akiMixer = new THREE.AnimationMixer(akiRef.current);
    akiBoke = akiMixer.clipAction(akiClip);
    akiBoke.setLoop(THREE.LoopOnce);
    akiBoke.clampWhenFinished = true;

  }

  const AkiScene = ({ position, scale }) => {
    const cam = useRef(null);
    const [sc, rt] = useMemo(() => {
      const sc = new THREE.Scene();
      const rt = new THREE.WebGLRenderTarget(2048, 2048);

      return [sc, rt];
    }, []);

    const init = node => {
      if (!node) return;
      cam.current = node;
      gl.setRenderTarget(rt);
      gl.render(sc, cam.current);
      gl.setRenderTarget(null);
    }

  const kouzanFont = new FontLoader().parse(kouzan);

    return (
      <>
        
        {createPortal(
          <>
          <perspectiveCamera position={vec3(0, 0, 5)} ref={init} />
            <TextTex font={kouzanFont} position={vec3(1.5, 1.2, .1)} scale={vec3(0.3, 0.3, 0.1)}>こ</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.5, 0.8, .1)} scale={vec3(0.3, 0.3, 0.1)}>の</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.5, 0.4, .1)} scale={vec3(0.3, 0.3, 0.1)}>道</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.5, 0.0, .1)} scale={vec3(0.3, 0.3, 0.1)}>や</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.1, 0.8, .1)} scale={vec3(0.3, 0.3, 0.1)}>行</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.1, 0.4, .1)} scale={vec3(0.3, 0.3, 0.1)}>く</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.1, 0.0, .1)} scale={vec3(0.3, 0.3, 0.1)}>人</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.1, -0.4, .1)} scale={vec3(0.3, 0.3, 0.1)}>な</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.1, -0.8, .1)} scale={vec3(0.3, 0.3, 0.1)}>し</TextTex>
            <TextTex font={kouzanFont} position={vec3(1.1, -1.2, .1)} scale={vec3(0.3, 0.3, 0.1)}>に</TextTex>
            <TextTex font={kouzanFont} position={vec3(0.7, 0.4, .1)} scale={vec3(0.3, 0.3, 0.1)}>秋</TextTex>
            <TextTex font={kouzanFont} position={vec3(0.7, 0.0, .1)} scale={vec3(0.3, 0.3, 0.1)}>の</TextTex>
            <TextTex font={kouzanFont} position={vec3(0.7, -0.4, .1)} scale={vec3(0.3, 0.3, 0.1)}>暮</TextTex>
            <TextTex font={nanumRegular} position={vec3(-1.4, 0.2, .1)} scale={vec3(0.14, 0.19, 0.05)}>None is travelling</TextTex>
            <TextTex font={nanumRegular} position={vec3(-1.4, 0.0, .1)} scale={vec3(0.14, 0.19, 0.05)}>Here along this way, but I</TextTex>
            <TextTex font={nanumRegular} position={vec3(-1.4, -0.2, .1)} scale={vec3(0.14, 0.19, 0.05)}>This autumn evening.</TextTex>
          </>, sc)}
        <mesh position={[position.x, position.y, position.z]} scale={[scale.x, scale.y, scale.z]} ref={initAki} >
          <planeGeometry args={[1, 1 / (720 /405)]} />
          <shaderMaterial args={[StdShader({ map: akiTex, UVScale: vec2(0.8, 0.8), UVOffset: vec2(0, 0), greyScale: true, BnW: true, BnWThreshold: 0.5, bokeh: true, bokehScale: 1, useColorSelect: true, tolerance: 0.7, greyRange: vec2(0, 1), greyOffset: 0.0, redRange: vec2(0, 1), blueRange: vec2(0, 1), RGBOffset: vec3(0, 0, 0), greenRange: vec2(0, 1), selectColor: vec3(1, 0.050980392156862744, 0.043137254901960784), useMap2: true, map2Mask:true, map2: rt.texture, map2Scale: 0.0, map2UVScale: vec2(1, 1), map2MaxCutoff:0.0, map2GreyOffset:0.2, map2Bokeh:true, map2BokehScale: -1 })]} wireframe={false} />
        </mesh>
      </>
    )
  }

  extend({ AkiScene });

  useFrame((state, delta) => {
    camAnimMixer?.update(delta);
    fusuAnimMixer?.update(delta);
    leftShojiMixer?.update(delta);
    akiMixer?.update(delta);
    // haikuMixer?.update(delta);
    // console.log(`haikuRef.current.bokeh: ${haikuRef.current.bokeh}`);
  });

  return (
    <>
      <group >
        <Backdrop map={planks} position={vec3(-9, 3, -7.68)} scale={vec3(.08, .015, 1)} rotation={new THREE.Euler((Math.PI / 2), 0, 0)} UVScale={vec2(16, 16)} backMap={planks} greyScale={true} greyOffset={-0.2} />

        <Post scale={vec3(0.00582, 0.0015, 1)} position={vec3(0.0, -2.5, 0)} renderOrder={35} />
        <WallPaper scale={vec3(0.006205, 0.0006779, 1)} position={vec3(5.2, 1.74, 0)} UVScale={vec2(1, 1)} UVOffset={vec2(0.2, 0.01)} useMap2={true} map2UVScale={vec2(2, 0.25)} map2Scale={0.05} />
        <Brace scale={vec3(0.0066, -0.0005, 1)} position={vec3(5.5105, 1.25, 0)} renderOrder={45} />
        <Brace scale={vec3(0.0066, -0.0005, 1)} position={vec3(5.5105, -3.3, 0)} renderOrder={45} />
        <WallPaper map={plaster} scale={vec3(0.0032, 0.0001975, 1)} position={vec3(5.35, -3.7, 0)} UVOffset={vec2(0.2, 0.01)} />

        <Brace scale={vec3(0.0025, -0.0012, 0.0001)} position={vec3(1.725, -3.35, -6)} UVScale={vec2(0.5, 0.5)} greyOffset={-0.1} />
        <Post scale={vec3(0.004, 0.0013, 1)} position={vec3(3.8, -0.8, -6)} greyOffset={-0.12} />

        <WallPaper map={plaster} scale={vec3(0.004, 0.002975, 1)} position={vec3(0, -1.85, -13)} UVOffset={vec2(0.2, 0.01)} greyScale={true} greyOffset={-0.5} />
        <Shoji position={vec3(1.8, 1.8, -12.875)} scale={vec3(1.2, 1, 1)} />
        <Backdrop map={gotama} position={vec3(1.82, -2.15, -12.8)} scale={vec3(0.001155, 0.001155, 1)} UVOffset={vec2(0, 0)} greyScale={true} greyOffset={-1.9} greyMinCutoff={0.0} greyMaxCuttoff={1.0} greyRange={vec2(0.0, 1)} alphaRange={vec2(0.0, 1)} UVScale={vec2(1, 1)} alphaMinCutoff={0.4} alphaMaxCutoff={1} RGBOffset={vec3(0.0, 0.0, 0)} backMap={gotama} />
        <Mat position={vec3(3.1, -3.175, -7)} scale={vec3(0.000925, 0.000925, 0.01)} rotation={vec3(-90, 0, -90)} rightTrim={false} greyOffset={-0.3} />
        <Mat position={vec3(3.1, -3.175, -10.1)} scale={vec3(0.000925, 0.000925, 0.01)} rotation={vec3(-90, 0, -90)} rightTrim={false} greyOffset={-0.3} />

        <Backdrop map={woodPanel1} position={vec3(6.15, -0.9, -6.25)} scale={vec3(0.0015, 0.00175, 1)} UVScale={vec2(0.875, 0.875)} backMap={woodPanel1} greyScale={true} greyOffset={-0.35} />

        <Mat position={vec3(3.125, -3.5, -1.176)} scale={vec3(0.000925, 0.000925, 0.01)} rotation={vec3(-90, 0, -90)} rightTrim={true} />
        <Mat position={vec3(6.7876, -3.5, -1.176)} scale={vec3(0.000925, 0.000925, 0.01)} rotation={vec3(-90, 0, -90)} rightTrim={true} />
        <Mat position={vec3(10.338, -3.5, -1.176)} scale={vec3(0.000925, 0.000925, 0.01)} rotation={vec3(-90, 0, -90)} rightTrim={true} />
        <Mat position={vec3(13.8845, -3.5, -1.176)} scale={vec3(0.000925, 0.000925, 0.01)} rotation={vec3(-90, 0, -90)} rightTrim={true} />

        <Post scale={vec3(0.00275, 0.000071, 1)} position={vec3(6.825, -1.02, 0)} rotation={new THREE.Euler(0, -(Math.PI / 2), -(Math.PI / 2))} greyOffset={-0.2} renderOrder={35} />
        <Post scale={vec3(0.00274, 0.0004, 1)} position={vec3(6.775, -1.02, 0)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} greyOffset={0} renderOrder={35} />
        <WallPaper map={plaster} scale={vec3(0.0021, -0.00141225, 1)} position={vec3(10.2, -1.1, -0.0001)} UVOffset={vec2(0.2, 0.01)} greyScale={true} greyOffset={-0.4} />
        <Fusuma map={plaster} position={vec3(5.75, -1.03, -0.02)} scale={vec3(-0.001, 0.00134, 1)} ref={setupFusuma} />
        <Fusuma map={plaster} position={vec3(5.1, -1.03, -0.04)} scale={vec3(0.001, 0.00134, 1)} />
        <Post scale={vec3(0.0025885, 0.0004, 1)} position={vec3(6.579, -1.05, -0.14)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} greyOffset={0} renderOrder={35} />
        <WallPaper map={plaster} scale={vec3(0.0021, 0.00141225, 1)} position={vec3(10.2, -1.1, -0.1401)} UVOffset={vec2(0.2, 0.01)} greyScale={true} greyOffset={-0.7} />

        <Brace scale={vec3(-0.0045, 0.00025, 1)} position={vec3(3.59223, -3.3, -0.14)} rotation={new THREE.Euler(-(Math.PI / 2), 0, 0)} greyOffset={-0.1} />

        <WallPaper map={paper} position={vec3(-11, 3.33, -5.52)} scale={vec3(0.005, 0.0009, 1)} UVOffset={vec2(0.2, 0.02)} renderOrder={5} />
        <Backdrop map={ryouanji} position={vec3(-11.5, -1, -6)} scale={vec3(0.0017, 0.0017, 1)} UVScale={vec2(0.8, 0.8)} UVOffset={vec2(0.33, 0)} greyScale={true} greyRange={vec2(0.0, 0.7)} backMap={ryouanji} />
        <AkiScene position={vec3(-13, -1, -5.9)} scale={vec3(4, 8, 1)} />
        
        <Brace scale={vec3(0.01, 0.00075, 1)} position={vec3(-11, 1.775, -5.4999)} rotation={new THREE.Euler(0, 0, 0)} greyScale={true} greyOffset={-0.075} />
        <WallPaper map={plaster} position={vec3(-0.2, -0.9, -6.7)} scale={vec3(0.004125, 0.003, 1)} rotation={new THREE.Euler(0, Math.PI / 2, 0)} UVOffset={vec2(0.2, 0.01)} renderOrder={5} />

        <Shoji position={vec3(-2.75, 1.025, -2.80001)} scale={vec3(1.05, 1.005, 1)} />
        <Shoji position={vec3(-4.5, 1.025, -2.80001)} scale={vec3(1.02, 1.005, 1)} />
        <Shoji position={vec3(-6.4, 1.025, -2.80001)} scale={vec3(1.02, 1.005, 1)} ref={initLeftShoji} />
        <WallPaper map={plaster} position={vec3(-18.28, -0.9, -6.7)} scale={vec3(0.004125, 0.003, 1)} rotation={new THREE.Euler(0, Math.PI / 2, 0)} UVOffset={vec2(0.2, 0.01)} renderOrder={5} />
        <Post scale={vec3(0.00275, 0.000071, 1)} position={vec3(-11, -1.02, -5.5)} rotation={new THREE.Euler(0, -(Math.PI / 2), -(Math.PI / 2))} greyOffset={-0.2} renderOrder={35} />
        <Post scale={vec3(0.00355, 0.0005, 1)} position={vec3(-14.63, -1.125, -5.49999)} rotation={new THREE.Euler(0, 0, -(Math.PI / 2))} greyOffset={0} renderOrder={35} />
        <WallPaper map={plaster} scale={vec3(0.00115, -0.00176, 1)} position={vec3(-16.5, -1.14, -5.52)} UVOffset={vec2(0.2, 0.01)} greyScale={true} greyOffset={-0.4} />

        <Osaranma position={vec3(-3.65, 1.4375, -0.3)} />

        <Brace scale={vec3(0.0021, -0.0019, 0.0001)} position={vec3(-1.925, -3.655, -3.85)} UVScale={vec2(0.5, 0.5)} />
        <Post scale={vec3(0.005, 0.0012, .0001)} position={vec3(-3.459, -0.2, -3.85)} />
        <WallPaper scale={vec3(0.002, 0.006575, 1)} position={vec3(-1.8, 0.58, -3.851)} UVScale={vec2(1, 1)} UVOffset={vec2(0.2, 0.01)} useMap2={true} map2UVScale={vec2(1, 1)} map2Scale={0.05} />
        <Mat position={vec3(-0.6575, -3.36, -2.68)} scale={vec3(0.001, 0.00076, 0.01)} sizeX={3} sizeY={0} trimColorOffset={0.15} />
        <Brace scale={vec3(0.0020775, 0.000375, 1)} position={vec3(-1.88, -0.09, -1.651)} rotation={new THREE.Euler(0, 0, 0)} greyScale={true} greyOffset={-0.075} />
        <WallPaper map={plaster} scale={vec3(0.00105125, 0.00095, 1)} position={vec3(-1.9, 1.4, -1.652)} UVScale={vec2(1, 1)} UVOffset={vec2(0.2, 0.01)} useMap2={false} map2UVScale={vec2(1, 1)} map2Scale={0.05} />
        <Brace scale={vec3(0.00215, -0.0019, 0.0001)} position={vec3(-1.925, -3.655, -1.65)} UVScale={vec2(0.5, 0.5)} />

        <Mat position={vec3(-0.566, -3.95, -0.78)} scale={vec3(0.000925, 0.000925, 0.01)} rotation={vec3(-90, 0, -90)} />
        <Mat position={vec3(-4.1125, -3.95, -0.78)} scale={vec3(0.000925, 0.000925, 0.01)} />
        <Mat position={vec3(-7.659, -3.95, -0.78)} scale={vec3(0.000925, 0.000925, 0.01)} />
        <Mat position={vec3(-11.2055, -3.95, -0.78)} scale={vec3(0.000925, 0.000925, 0.01)} />
        <Mat position={vec3(-14.752, -3.95, -0.78)} scale={vec3(0.000925, 0.000925, 0.01)} />

        <Post scale={vec3(0.005, 0.0012, .0001)} position={vec3(-3.725, -0.675, -1.65)} />
        <Post scale={vec3(0.00595, 0.0017, 1)} position={vec3(-11.075, 0.15, -5.55)} />
        <Post scale={vec3(0.00595, 0.0015, 1)} position={vec3(-10.975, 0.27, -5.8)} rotation={new THREE.Euler(0, Math.PI / 2, (Math.PI / 2))} greyScale={true} greyOffset={-0.075} />
        <Brace scale={vec3(0.009, 0.0008, 1)} position={vec3(-7.4, -3.95, -5.625)} rotation={new THREE.Euler(-(Math.PI / 2), 0, 0)} greyScale={true} greyOffset={-0.075} />
      </group>
    </>);
};

export default GLInterior;