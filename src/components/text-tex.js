import { extend } from '@react-three/fiber';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import * as THREE from 'three';
import { Text3D } from '@react-three/drei';
import { StdShader } from './shaders/shader';

const vec2 = (n1, n2) => new THREE.Vector2(n1, n2);
const vec3 = (n1, n2, n3) => new THREE.Vector3(n1, n2, n3);
const vec4 = (n1, n2, n3, n4) => new THREE.Vector4(n1, n2, n3, n4);



const TextTex = ({ children, map = null, font, size = 1, height = 1, color = 0xffffff, position = vec3(0, 0, 0), scale = vec3(1, 1, 1), rotation = new THREE.Euler(0, 0, 0) }) => {
  extend({ TextGeometry });

  return (
    <mesh position={[position.x, position.y, position.z]} scale={[scale.x, scale.y, scale.z]}>
      <textGeometry args={[children, { font: font, size: size, height: height }]} />
      {/* <shaderMaterial args={[StdShader({map:map, UVScale:vec2(1,1 / (scale.x / scale.y)), greyScale:true})]} wireframe={false} /> */}
      <meshBasicMaterial  color={color} wireframe={false} />
    </mesh>
  )
}

export default TextTex;