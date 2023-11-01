import * as THREE from 'three';

const vec2 = (n1 = null, n2 = null) => new THREE.Vector2 (n1, n2);
const vec3 = (n1 = null, n2 = null, n3 = null) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1 = null, n2 = null, n3 = null, n4 = null) => new THREE.Vector4(n1, n2, n3, n4);


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
      map2UVScale: {value: map2UVScale || vec2(1,1)},
      useBackMap: {value: useBackMap || false},
      backMap: {value: backMap || null},
      antialias: {value: antialias || false},  
      UVScale: {value: UVScale || vec2(1,1)}, 
      UVOffset: {value: UVOffset || vec2(0,0)},
      RGBScale: {value: RGBScale || vec3(1,1,1)},
      RGBOffset: {value: RGBOffset || vec3(0,0,0)},
      alphaRange: { value: alphaRange || vec2(0.0,1.0)},
      alphaMinCutoff: {value: alphaMinCutoff || 0.0},
      alphaMaxCutoff: {value: alphaMaxCutoff || 1.0},
      greyOffset: {value: greyOffset || 0.0},
      greyScale: {value: greyScale || false},
      greyMinCutoff: { value: greyMinCutoff || 0},
      greyMaxCutoff: { value: greyMaxCutoff || 1},
      negative: { value: negative || 0.0 },
      redRange: { value: redRange || vec2(0,1) },
      greenRange: { value: greenRange || vec2(0,1) },
      blueRange: { value: blueRange || vec2(0,1) },
      greyRange: { value: greyRange || vec2(0,1) }
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

const SpinnerShader = ({mask=null, color=vec4(1,1,1,1), alpha=1.0, theta=(Math.PI / 180) * 255, thetaLength=((Math.PI / 180) * 360)}) => {
  const shader =  {
    uniforms: {
      mask: { value: mask },
      color: { value: color },
      alpha: { value: alpha },
      theta: { value: theta },
      thetaLength: { value: thetaLength },
      PI: { value: Math.PI }
    },
    vertexShader: vertexPass,
    fragmentShader: `
      uniform sampler2D mask;
      uniform vec4 color;
      uniform float alpha, theta, thetaLength, PI;

      varying vec2 vUv;

      void main() {
        float uvX = vUv.x - 0.5;
        float uvY = vUv.y - 0.5;
        
        float uvTheta = (atan(uvY, uvX));

        if (uvTheta < 0.0) uvTheta = 2.0 * PI + uvTheta;

        uvTheta = uvTheta + floor(theta / (2.0 * PI)) * 2.0 * PI;

        // float startAngle = theta - floor(theta / (2.0 * PI)) * 2.0 * PI;
        // float endAngle = (theta + thetaLength) - floor((theta + thetaLength) / (2.0 * PI)) * 2.0 * PI;

        // if (uvTheta > theta) {
        //   discard;
        // }
        vec4 maskColor = texture2D(mask, vUv);
        if (maskColor.r > 0.9) {
          discard;
        }

        gl_FragColor = vec4(color.rgb, alpha);
      }
      `
  }

  return shader;
}

export {
  Shader,
  SpinnerShader
}