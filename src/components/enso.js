import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { SpinnerShader } from './shaders/shader';
import { useThree, useFrame } from '@react-three/fiber';
import { useVideoTexture } from '@react-three/drei';
import enso from '../assets/enso-scaled.png';
import filmGrain from '../assets/01156_old_film_look_with_border.webm';

const vec2 = (n1 = null, n2 = null) => new THREE.Vector2(n1, n2);
const vec3 = (n1 = null, n2 = null, n3 = null) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1 = null, n2 = null, n3 = null, n4 = null) => new THREE.Vector4(n1, n2, n3, n4);


const Enso = ({ position = vec3(0, 0, 0), scale = vec3(1, 1, 1), rotation = new THREE.Euler(0, 0, 0) }) => {
  const { gl, scene, camera } = useThree();

  const dpr = gl.getPixelRatio();

  const size = vec3(0,0,0);
  gl.getSize(size);

  const filmGrainTex = useVideoTexture(filmGrain);
  filmGrainTex.wrapS = filmGrainTex.wrapT = THREE.RepeatWrapping;
  // gl.initTexture(filmGrainTex);

  const mask = useLoader(THREE.TextureLoader, enso);
  mask.wrapS = mask.wrapT = THREE.RepeatWrapping;
  mask.repeat = vec2(1,1);
  // gl.initTexture(mask);
  
  // gl.compile(scene, camera);

  const meshRef = useRef(null);

  let mixer, thetaTrack, thetaLengthTrack, alphaTrack, clip, action;
  thetaTrack = useMemo(() => new THREE.NumberKeyframeTrack('.theta', [0, 4], [4.4505895925855405, -1.919862177193762]), []);
  thetaLengthTrack = useMemo(() => new THREE.NumberKeyframeTrack('.thetaLength', [0,4],[6.283185307179586,0]), []);
  alphaTrack = useMemo(() => new THREE.NumberKeyframeTrack('.alpha',[0, 1, 2], [0,1.0,0]), []);

  clip = useMemo(() => new THREE.AnimationClip('', 4, [thetaTrack, thetaLengthTrack, alphaTrack]), [thetaTrack, thetaLengthTrack, alphaTrack]);

  const initMesh = node => {
    // return;
    if (node) {
      meshRef.current = node;
      const nodeRef = meshRef.current;
      if (!Object.hasOwn(nodeRef, 'color')) {
        Object.defineProperties(nodeRef, {
          color: {
            get() { return this.material.uniforms.color.value; },
            set(val) {
              this.material.uniforms.color.value = val;
            }
          },
          alpha: {
            get() { return this.material.uniforms.alpha.value;},
            set(val) { 
              this.material.uniforms.alpha.value = val;
            }
          },
          theta: {
            get() { return this.material.uniforms.theta.value },
            set(val) {
              this.material.uniforms.theta.value = val;
            }
          },
          thetaLength: {
            get() { return this.material.uniforms.thetaLength.value; },
            set(val) {
              this.material.uniforms.thetaLength.value = val;
            }
          }
        }
        );
      }

      mixer = new THREE.AnimationMixer(nodeRef);
      action = mixer.clipAction(clip);
      action?.setLoop(THREE.LoopRepeat);
      // action?.play();
      // requestAnimationFrame(animate);
    }

  }

  const clock = new THREE.Clock();

  const animate = () => {
    const delta = clock.getDelta();
    meshRef.current && mixer?.update(delta);
    requestAnimationFrame(animate);
  }

  useFrame((_, delta) => {
    // console.log(`theta: ${meshRef.current.theta}, thetaLength: ${meshRef.current.thetaLength}`);
    // console.log(`alpha: ${meshRef.current.alpha}`);
    meshRef.current && mixer?.update(delta);

  });

  // gl.compile(scene, camera);
  return (
    <mesh position={[position.x, position.y, position.z]} scale={[scale.x, scale.y, scale.z]} rotation={new THREE.Euler(rotation.x, rotation.y, rotation.z)} ref={initMesh} >
      <planeGeometry args={[mask.image.width * dpr, mask.image.height * dpr]} />
      <shaderMaterial args={[SpinnerShader({ mask: mask, UVScale:vec2(1.8, 1.8 / (scale.x / scale.y) ), UVOffset:vec2(-0.15, 0.1), filmGrainMap:filmGrainTex, filmGrainUVScale:vec2(0.5, 0.5 / (scale.x / scale.y)), filmGrainUVOffset:vec2(0.2,0.1), color: vec4(0.2,0.2, 0.2, 1) })]} wireframe={false} />
    </mesh>
  );
}

export default Enso;