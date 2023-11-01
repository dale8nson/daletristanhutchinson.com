import * as React from 'react';
import { useState, useEffect, Suspense } from "react";
import * as THREE from 'three';
import { Spinner } from "@nextui-org/react";
import { Canvas } from "@react-three/fiber";
import { GLHeader } from  './';
import { GLInterior } from "./";

const WebGLCanvas = () => {

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  })

  return (
    <>
      {isMounted && (
        <Canvas id='canvas' ref={node => { }} >
        <directionalLight position={new THREE.Vector3(-40, 0, 10)} args={[0xffffff, 1.2]} castShadow={false} />
        <directionalLight position={new THREE.Vector3(40, 0, 10)} args={[0xffffff, 1.2]} castShadow={false} />
        <GLHeader />
        <GLInterior />
      </Canvas>
      )}
    </>
  );
}

export default WebGLCanvas;