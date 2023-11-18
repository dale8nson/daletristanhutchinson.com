import * as THREE from 'three';

const vec2 = (n1 = null, n2 = null) => new THREE.Vector2 (n1, n2);
const vec3 = (n1 = null, n2 = null, n3 = null) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1 = null, n2 = null, n3 = null, n4 = null) => new THREE.Vector4(n1, n2, n3, n4);


const stdVertexShader = `
    
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const htmlVertexShader = `
/*
  This shader is from the THREE's SpriteMaterial.
  We need to turn the backing plane into a Sprite
  (make it always face the camera) if "transfrom" 
  is false. 
*/
#include <common>

varying vec2 vUv;

void main() {
  vec2 center = vec2(0., 1.);
  float rotation = 0.0;
  
  // This is somewhat arbitrary, but it seems to work well
  // Need to figure out how to derive this dynamically if it even matters
  float size = 0.03;

  vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
  vec2 scale;
  scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
  scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

  bool isPerspective = isPerspectiveMatrix( projectionMatrix );
  if ( isPerspective ) scale *= - mvPosition.z;

  vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
  vec2 rotatedPosition;
  rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
  rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
  mvPosition.xy += rotatedPosition;

  vUv = uv;

  gl_Position = projectionMatrix * mvPosition;
}
`
const stdFragmentShader= `

uniform int colorsSelectCount, edge, bokehPasses;
uniform int uBokehSampleCount;
uniform sampler2D map, map2, map3, backMap;
uniform vec3 RGBScale, RGBOffset, map2Color, selectColor;
uniform vec2 UVScale, UVOffset, map2UVScale, map2UVOffset, map3UVScale, map3UVOffset, redRange, greenRange, blueRange, greyRange, alphaRange, psr;
uniform bool useColorSelect, useMap2, useMap3, useBackMap, greyScale, BnW, bokeh;
uniform float alphaMinCutoff, alphaMaxCutoff, map2Scale, map2MaxCutoff, greyOffset, greyMinCutoff, greyMaxCutoff, negative, opacity, tolerance, BnWThreshold, bokehScale;

varying vec2 vUv;
vec2 circleCoords(float deg);

float PI = 3.141592653589793;
vec2 circleCoords(float deg, float offset) {
  float rad = PI / 180.0 * deg;
  float x = cos(rad) * (psr.x + offset);
  float y = sin(rad) * (psr.y + offset);

  return vec2(x, y);
}

void main() {

  vec2 scaledUV = vec2(vUv.x * UVScale.x + UVOffset.x, vUv.y * UVScale.y + UVOffset.y);
  vec4 mapCol = texture2D(map, scaledUV);
  const int bokehSampleCount = 16;

  vec4 col = mapCol;

  float red = col.r, green = col.g, blue = col.b, grey, alpha;
  
  if(bokeh) {
    float r, g, b;

    for(int j = 0; j < bokehPasses; j++) {
    float offset = 0.003125;
    
    vec2 a0 = scaledUV + circleCoords(0.0, offset);
    // vec2 a22_5 = scaledUV + circleCoords(22.5, offset);
    // vec2 a45 = scaledUV + circleCoords(45.0, offset);
    vec2 a60 = scaledUV + circleCoords(60.0, offset);
    // vec2 a67_5 = scaledUV + circleCoords(67.5, offset);
    // vec2 a90 = scaledUV + circleCoords(90.0, offset);
    // vec2 a112_5 = scaledUV + circleCoords(112.5, offset);
    vec2 a120 = scaledUV + circleCoords(120.0, offset);
    // vec2 a135 = scaledUV + circleCoords(135.0, offset);
    // vec2 a157_5 = scaledUV + circleCoords(157.5, offset);
    vec2 a180 = scaledUV + circleCoords(180.0, offset);
    // vec2 a202_5 = scaledUV + circleCoords(202.5, offset);
    // vec2 a225 = scaledUV + circleCoords(225.0, offset);
    vec2 a240 = scaledUV + circleCoords(240.0, offset);
    // vec2 a247_5 = scaledUV + circleCoords(247.5, offset);
    // vec2 a270 = scaledUV + circleCoords(270.0, offset);
    // vec2 a292_5 = scaledUV + circleCoords(292.5, offset);
    vec2 a300 = scaledUV + circleCoords(300.0, offset);
    // vec2 a315 = scaledUV + circleCoords(315.0, offset);
    // vec2 a337_5 = scaledUV + circleCoords(337.5, offset);

    vec4 c0 = texture2D(map, a0);
    // vec4 c22_5 = texture2D(map, a22_5);
    // vec4 c45 = texture2D(map, a45);
    vec4 c60 = texture2D(map, a60);
    // vec4 c67_5 = texture2D(map, a67_5);
    // vec4 c90 = texture2D(map, a90);
    // vec4 c112_5 = texture2D(map, a112_5);
    vec4 c120 = texture2D(map, a120);
    // vec4 c135 = texture2D(map, a135);
    // vec4 c157_5 = texture2D(map, a157_5);
    vec4 c180 = texture2D(map, a180);
    // vec4 c202_5 = texture2D(map, a202_5);
    // vec4 c225 = texture2D(map, a225);
    vec4 c240 = texture2D(map, a240);
    // vec4 c247_5 = texture2D(map, a247_5);
    // vec4 c270 = texture2D(map, a270);
    // vec4 c292_5 = texture2D(map, a292_5);
    vec4 c300 = texture2D(map, a300);
    // vec4 c315 = texture2D(map, a315);
    // vec4 c337_5 = texture2D(map, a337_5);

    // float sampleCount = floor(intBitsToFloat(bokehSampleCount));

    // vec4 samples[16] = vec4[16](c0,c22_5,c45,c67_5,c90,c112_5,c135,c157_5,c180,c202_5,c225,c247_5,c270,c292_5,c315,c337_5);
    // vec4 samples[4] = vec4[4](c0,c90,c180,c270);
    vec4 samples[6] = vec4[6](c0,c60,c120,c180,c240,c300);



    // float bokehAngleStep = 360.0 / 4.0;
    // for(float angle = 0.0; angle <= 360.0; angle += bokehAngleStep) {
    //   vec2 coords = scaledUV + circleCoords(angle);
    //   int index = 360 / floatBitsToInt(floor(angle / bokehAngleStep));
    //   samples[index] = texture2D(map, coords);
    // }
    
      r = g = b = 0.0;
    
      for(int i = 0; i < 6; i++) {
        r += samples[i].r;
        g += samples[i].g;
        b += samples[i].b;
      }

      // r /= 16.0;
      // g /= 16.0;
      // b /= 16.0;
      r /= 6.0;
      g /= 6.0;
      b /= 6.0;
      for(int i = 0; i < samples.length(); i++) {
        samples[i] = vec4(r, g, b, samples[i].a);
      }
    }
    red = (red * (1.0 - bokehScale)) +  r * bokehScale;
    green = (green * (1.0 - bokehScale)) + g * bokehScale;
    blue = (blue * (1.0 - bokehScale)) + b * bokehScale;
    
    // red = 0.93;
    // green = 0.0;
    // blue = 0.0; 
  }
  
  col.r = red;
  col.g = green;
  col.b = blue;

  grey = (red + green + blue) / 3.0;
  alpha = clamp(col.a, alphaRange.x, alphaRange.y);

  if(greyScale) {

    float scale = (RGBScale.r + RGBScale.g + RGBScale.b) / 3.0;
    float offset = (RGBOffset.r + RGBOffset.g + RGBOffset.b) / 3.0;
    grey = clamp(grey, greyRange.x, greyRange.y);

    red = green = blue = grey * scale + offset + greyOffset;

    if(BnW) {
      if (grey >= BnWThreshold) {
        red = green = blue = greyRange.y;
      }
      else {
        red = green = blue = greyRange.x;
      } 
    }

    if(useColorSelect) {
      if(col.r >= (selectColor.x - tolerance) && col.r <= (selectColor.x + tolerance)
        && col.g >= (selectColor.y - tolerance) && col.g <= (selectColor.y + tolerance)
        && col.b >= (selectColor.z - tolerance) && col.b <= (selectColor.z + tolerance)) {
          red = col.r + greyOffset + RGBOffset.r;
          green = col.g + greyOffset + RGBOffset.g;
          blue = col.b + greyOffset + RGBOffset.b;
      }
    }

  } else {

    red = clamp(red * alpha * RGBScale.r + RGBOffset.r + greyOffset, redRange.x, redRange.y);
    green = clamp(green * alpha * RGBScale.g + RGBOffset.g + greyOffset, greenRange.x + greyOffset, greenRange.y);
    blue = clamp(blue * alpha * RGBScale.b + RGBOffset.b + greyOffset, blueRange.x, blueRange.y);

    if(col.r < greyMinCutoff || col.r > greyMaxCutoff ||
      col.g < greyMinCutoff || col.g > greyMaxCutoff ||
      col.b < greyMinCutoff || col.b > greyMaxCutoff
      ) { red = green = blue = 0.0; }
  }

  if(useMap2) {
    vec2 map2Scaled = vec2(vUv.x * map2UVScale.x + map2UVOffset.x, vUv.y * map2UVScale.y + map2UVOffset.y );
    vec4 map2Col = texture2D(map2, map2Scaled);
    if ((map2Col.r + map2Col.g + map2Col.b) / 3.0 > map2MaxCutoff) {
      red -= map2Col.r * map2Scale;
      green -=  map2Col.g * map2Scale;
      blue -= map2Col.b * map2Scale;
      // alpha -= map2Col.r * 0.1;
      // discard;
    }

  }

  if(useMap3) {

    vec2 map3Scale = (1.0 - vUv) * map3UVScale + map3UVOffset;

    vec4 col = texture2D(map3, map3Scale);

    float map3Grey;

    switch(edge) {
      
      case 1:
        
        vec4 colRt = texture2D(map3, vec2(1.0, map3Scale.y));
        map3Grey = (colRt.r + colRt.g + colRt.b) / 3.0;

        red -= map3Grey * (1.0 - scaledUV.x + greyOffset);
        green -= map3Grey * (1.0 - scaledUV.x + greyOffset);
        blue -= map3Grey * (1.0 - scaledUV.x + greyOffset);

        // red += map3Grey + greyOffset;
        // green += map3Grey + greyOffset;
        // blue += map3Grey + greyOffset;

        break;

      case 2:
        vec4 colBtm = texture2D(map3, vec2(map3Scale.x, 1.0));

        map3Grey = (colBtm.r + colBtm.g + colBtm.b) / 3.0;

        // red += map3Grey * (1.0 - scaledUV.y + greyOffset);
        // green += map3Grey * (1.0 - scaledUV.y + greyOffset);
        // blue += map3Grey * (1.0 - scaledUV.y + greyOffset);

        red += map3Grey * (scaledUV.y + greyOffset);
        green += map3Grey * (scaledUV.y + greyOffset);
        blue += map3Grey * (scaledUV.y + greyOffset);

        // red += map3Grey + greyOffset;
        // green += map3Grey + greyOffset;
        // blue += map3Grey + greyOffset;

        break;

      case 3:
        vec4 colLt = texture2D(map3, vec2(0.01, map3Scale.y));
        map3Grey = (colLt.r + colLt.g + colLt.b) / 3.0;

        red += map3Grey * (scaledUV.x + greyOffset);
        green += map3Grey * (scaledUV.x + greyOffset);
        blue += map3Grey * (scaledUV.x + greyOffset);

        // red += map3Grey + greyOffset;
        // green += map3Grey + greyOffset;
        // blue += map3Grey +greyOffset;

        break;
      
      default:
        vec4 colTp = texture2D(map3, vec2(map3Scale.x, 0.01));
        map3Grey = (colTp.r + colTp.g + colTp.b) / 3.0;

        red += map3Grey + greyOffset;
        green += map3Grey + greyOffset;
        blue += map3Grey +greyOffset;

    }
  }

  

  if(grey < greyMinCutoff || grey > greyMaxCutoff ||
    col.a < alphaMinCutoff || col.a > alphaMaxCutoff) { discard; }

  

  gl_FragColor = vec4(red, green, blue, opacity);

  // gl_FragColor = vec4(0.93, 0.0, 0.0, 1.0);

}
` 

const htmlFragmentShader = `
      
uniform sampler2D map, map2, map3;
uniform vec3 RGBScale, RGBOffset, map2Color;
uniform vec2 UVScale, UVOffset, map2UVScale, map2UVOffset, map2Offset, map3UVScale, map3UVOffset, redRange, greenRange, blueRange, greyRange, alphaRange;
uniform bool useMap2, useMap3, greyScale, map2GreyScale;
uniform float alphaMinCutoff, alphaMaxCutoff, map2Scale, map2MaxCutoff, greyOffset, greyMinCutoff, greyMaxCutoff, negative, opacity;

varying vec2 vUv;

void main() {

  vec2 scaledUV = vec2(vUv.x * UVScale.x + UVOffset.x, vUv.y * UVScale.y + UVOffset.y);
  vec4 mapCol = texture2D(map, scaledUV);

  vec4 col = mapCol;



  float red, green, blue, grey;
  red = mapCol.r;
  green = mapCol.g;
  blue = mapCol.b;

  grey = (col.r + col.g + col.b) / 3.0;
  // alpha = clamp(col.a, alphaRange.x, alphaRange.y);

  if(greyScale) {

    float scale = (RGBScale.r + RGBScale.g + RGBScale.b) / 3.0;
    float offset = (RGBOffset.r + RGBOffset.g + RGBOffset.b) / 3.0;
    grey = clamp(grey, greyRange.x, greyRange.y);

    red = green = blue = grey * scale + offset + greyOffset;

  } else {

    // red = clamp(col.r * RGBScale.r + RGBOffset.r + greyOffset, redRange.x, redRange.y);
    // green = clamp(col.g * RGBScale.g + RGBOffset.g + greyOffset, greenRange.x + greyOffset, greenRange.y);
    // blue = clamp(col.b * RGBScale.b + RGBOffset.b + greyOffset, blueRange.x, blueRange.y);

    // if(col.r < greyMinCutoff || col.r > greyMaxCutoff ||
    //   col.g < greyMinCutoff || col.g > greyMaxCutoff ||
    //   col.b < greyMinCutoff || col.b > greyMaxCutoff
    //   ) { red = green = blue = 0.0; }
  }

  if(useMap3) {

    vec2 map3Scale = vUv * map3UVScale + map3UVOffset;
    vec4 map3Col = texture2D(map3, map3Scale);
    
    if(grey > 0.0001 || col.a < 0.0000001) {
      float map3Grey = (map3Col.r + map3Col.g + map3Col.b) / 3.0;
      red = green = blue = map3Grey + greyOffset;
    }
  }

  if(useMap2) {
    vec2 map2Scaled = vUv * map2Scale + map2Offset;
    vec4 map2Col = texture2D(map2, map2Scaled);
    
    float map2Grey = (map2Col.r + map2Col.g + map2Col.b) / 3.0;
      red -= map2Col.r * map2Scale;
      green -=  map2Col.g * map2Scale;
      blue -= map2Col.b * map2Scale;
  }

  // if(grey < greyMinCutoff || grey > greyMaxCutoff ||
  //   col.a < alphaMinCutoff || col.a > alphaMaxCutoff) { discard; }

  gl_FragColor = vec4(red, green, blue, opacity);

  // gl_FragColor = vec4(0.93, 0.0, 0.0, 1.0);

}
` 

const StdShader = ({
  map,
  map2,
  useMap2,
  map2UVScale,
  map2Scale,
  map2Color,
  map2UVOffset,
  map2MaxCutoff,
  useMap3,
  map3,
  map3UVScale,
  map3UVOffset,
  edge,
  useBackMap,
  backMap, 
  UVScale, 
  UVOffset, 
  RGBScale, 
  RGBOffset,
  opacity,
  alphaRange,
  alphaMinCutoff,
  alphaMaxCutoff,
  greyOffset, 
  greyScale,
  BnW,
  BnWThreshold,
  bokeh,
  bokehPasses,
  bokehSampleCount,
  bokehScale,
  psr,
  greyMinCutoff,
  greyMaxCutoff,
  useColorSelect,
  selectColor,
  tolerance,
  negative,
  redRange,
  greenRange,
  blueRange,
  greyRange,
  
 }) => {
  const mat = {
    uniforms: {
      map: {value: map || null},
      map2: {value: map2 || null},
      useMap2: { value: useMap2 || false},
      map2Scale: {value: map2Scale || 1.0},
      map2Color: { value: map2Color || vec3(1,1,1)},
      map2UVScale: {value: map2UVScale || vec2(1,1)},
      map2UVOffset: {value: map2UVOffset || vec2(0,0)},
      map2MaxCutoff: { value: map2MaxCutoff || 0.6},
      useMap3: { value: useMap3 || false},
      map3: { value: map3 || null },
      map3UVScale: { value: map3UVScale || vec2(1,1) },
      map3UVOffset: { value: map3UVOffset || vec2(0,0) },
      edge: { value: edge || 0 },
      useBackMap: {value: useBackMap || false},
      backMap: {value: backMap || null}, 
      UVScale: {value: UVScale || vec2(1,1)}, 
      UVOffset: {value: UVOffset || vec2(0,0)},
      RGBScale: {value: RGBScale || vec3(1,1,1)},
      RGBOffset: {value: RGBOffset || vec3(0,0,0)},
      opacity: {value: opacity || 1.0},
      alphaRange: { value: alphaRange || vec2(0.0,1.0)},
      alphaMinCutoff: {value: alphaMinCutoff || 0.0},
      alphaMaxCutoff: {value: alphaMaxCutoff || 1.0},
      greyOffset: {value: greyOffset || 0.0},
      greyScale: {value: greyScale || false},
      BnW: { value: BnW },
      BnWThreshold: { value: BnWThreshold || 0.5},
      bokeh: {value: bokeh || false },
      bokehPasses: { value: bokehPasses || 1},
      bokehSampleCount: { value: bokehSampleCount || 8 },
      bokehScale: { value: bokehScale || 1.0 },
      psr: { value: psr || vec2(0.01, 0.01) },
      useColorSelect: { value: useColorSelect || false },
      selectColor: {value: selectColor || vec3(1,1,1)},
      tolerance: { value: tolerance || 0.1 },
      greyMinCutoff: { value: greyMinCutoff || -2},
      greyMaxCutoff: { value: greyMaxCutoff || 2},
      negative: { value: negative || 0.0 },
      redRange: { value: redRange || vec2(0,1) },
      greenRange: { value: greenRange || vec2(0,1) },
      blueRange: { value: blueRange || vec2(0,1) },
      greyRange: { value: greyRange || vec2(0,1) }
    },
    vertexShader: stdVertexShader,
    fragmentShader: stdFragmentShader,
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
    },
    bokehScale: {
      get() { return this.uniforms.bokehScale.value; },
      set(val) { this.uniforms.bokehScale.value = val; }
    }

  });

  console.log(`useColorSelect is set to ${useColorSelect}`);
  return mat;

}

const SpinnerShader = ({mask=null, UVScale=vec2(1,1), UVOffset=vec2(0,0), filmGrainMap=null, filmGrainUVScale=vec2(1,1), filmGrainUVOffset=vec2(0,0), color=vec4(1,1,1,1), alpha=1.0, theta=(Math.PI / 180) * 255, thetaLength=((Math.PI / 180) * 360)}) => {
  const shader =  {
    uniforms: {
      mask: { value: mask },
      UVScale: { value: UVScale },
      UVOffset: { value: UVOffset },
      filmGrainMap: { value: filmGrainMap },
      filmGrainUVScale: { value: filmGrainUVScale },
      filmGrainUVOffset: { value: filmGrainUVOffset },
      color: { value: color },
      alpha: { value: alpha },
      theta: { value: theta },
      thetaLength: { value: thetaLength },
      PI: { value: Math.PI }
    },
    vertexShader: stdVertexShader,
    fragmentShader: `
      uniform sampler2D mask, filmGrainMap;
      uniform vec2 UVScale, UVOffset, filmGrainUVScale, filmGrainUVOffset;
      uniform vec4 color;
      uniform float alpha, theta, thetaLength, PI;

      varying vec2 vUv;

      void main() {
        float uvX = vUv.x - 0.5;
        float uvY = vUv.y - 0.5;

        
        
        // float uvTheta = (atan(uvY, uvX));

        // if (uvTheta < 0.0) uvTheta = 2.0 * PI + uvTheta;

        // uvTheta = uvTheta + floor(theta / (2.0 * PI)) * 2.0 * PI;

        // float startAngle = theta - floor(theta / (2.0 * PI)) * 2.0 * PI;
        // float endAngle = (theta + thetaLength) - floor((theta + thetaLength) / (2.0 * PI)) * 2.0 * PI;

        // if (uvTheta > theta) {
        //   discard;
        // }
        
        
        vec2 filmGrainScale = vUv * filmGrainUVScale + filmGrainUVOffset;
        vec4 filmGrainCol = texture2D(filmGrainMap, filmGrainScale);

        float red, green, blue;
        red = color.r;
        green = color.g;
        blue = color.b;

        vec2 maskScale = vUv * UVScale + UVOffset;

        vec4 maskColor = texture2D(mask, maskScale);
        if (maskColor.r > 0.9) {
          // discard;
          red = green = blue = 0.0;

        }

        if (filmGrainCol.r <= 1.0) {
        
          // red = filmGrainCol.r;
          // green = filmGrainCol.g;
          // blue = filmGrainCol.b;
          red += filmGrainCol.r * 0.3;
          green += filmGrainCol.r * 0.3;
          blue += filmGrainCol.r * 0.3;
          // red -= filmGrainCol.r * 0.3;
          // green = 0.0;
          // blue = 0.0;
  
          // alpha = glassCol.r * 0.8;
          // discard;
        }

        

        gl_FragColor = vec4(red, green, blue, alpha);
        // gl_FragColor = vec4(0.93, 0.0, 0.0, 1.0);

      }
      `
  }

  return shader;
}

const HtmlShader = ({
  map,
  map2,
  useMap2,
  map2UVScale,
  map2Scale,
  map2Color,
  map2UVOffset,
  map2MaxCutoff,
  map2Offset,
  useMap3,
  map3,
  map3UVScale,
  map3UVOffset,
  edge,
  useBackMap,
  backMap,
  antialias, 
  UVScale, 
  UVOffset, 
  RGBScale, 
  RGBOffset,
  opacity,
  alphaRange,
  alphaMinCutoff,
  alphaMaxCutoff,
  greyOffset, 
  greyScale, 
  greyMinCutoff,
  greyMaxCutoff,
  useColorSelect,
  colorsSelect,
  colorsSelectCount,
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
      map2Color: { value: map2Color || vec3(1,1,1)},
      map2UVScale: {value: map2UVScale || vec2(1,1)},
      map2UVOffset: {value: map2UVOffset || vec2(1,1)},
      map2Offset: { value: map2Offset || vec2(0,0) },
      map2MaxCutoff: { value: map2MaxCutoff || 0.6},
      useMap3: { value: useMap3 || false},
      map3: { value: map3 || null },
      map3UVScale: { value: map3UVScale || vec2(1,1) },
      map3UVOffset: { value: map3UVOffset || vec2(0,0) },
      edge: { value: edge || 0 },
      useBackMap: {value: useBackMap || false},
      backMap: {value: backMap || null},
      antialias: {value: antialias || false},  
      UVScale: {value: UVScale || vec2(1,1)}, 
      UVOffset: {value: UVOffset || vec2(0,0)},
      RGBScale: {value: RGBScale || vec3(1,1,1)},
      RGBOffset: {value: RGBOffset || vec3(0,0,0)},
      opacity: {value: opacity || 1.0},
      alphaRange: { value: alphaRange || vec2(0.0,1.0)},
      alphaMinCutoff: {value: alphaMinCutoff || 0.0},
      alphaMaxCutoff: {value: alphaMaxCutoff || 1.0},
      greyOffset: {value: greyOffset || 0.0},
      greyScale: {value: greyScale || false},
      useColorSelect: { value: useColorSelect || false },
      // colorsSelect: { value: colorsSelect || null },
      // colorsSelectCount: { value: colorsSelectCount || 0 },
      greyMinCutoff: { value: greyMinCutoff || 0},
      greyMaxCutoff: { value: greyMaxCutoff || 1},
      negative: { value: negative || 0.0 },
      redRange: { value: redRange || vec2(0,1) },
      greenRange: { value: greenRange || vec2(0,1) },
      blueRange: { value: blueRange || vec2(0,1) },
      greyRange: { value: greyRange || vec2(0,1) }
    },
    vertexShader: stdVertexShader,
    fragmentShader: htmlFragmentShader,
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

export {
  StdShader,
  SpinnerShader,
  HtmlShader
}