
import { useEffect, useRef, useState, Suspense } from 'react';
import { Seo,Layout, GLHeader, GLInterior } from '../components';
import './scss/_index.scss';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Slider, Label } from '@fluentui/react';
import { Spinner } from '@nextui-org/react';
import { useFrame } from '@react-three/fiber';

const IndexPage = () => {

  const houseAspect = useRef();
  useEffect(() => { houseAspect.current = window.outerWidth / ((window.outerHeight * 0.8) - window.outerWidth * 0.15)});

  const [sX, setSX] = useState(0.01);
  const [sY, setSY] = useState(0.01);
  const [oX, setOX] = useState(0.01);
  const [oY, setOY] = useState(0.01);
  
  const onSXChange = (data) => {
    console.log(`onSXChange data`, data);
    setSX(data);
  }

  const onSYChange = (data) => {
    setSY(data);
  }

  const onOXChange = (data) => {
    setOX(data);
  }

  const onOYChange = (data) => {
    setOY(data);
  }

  

  return (
    
    // <ThemeUIProvider theme={ home }>
    // <Layout header>
    //   <Layout.Header>
    <>
      {/* <Suspense fallback={<Spinner label='Loading. Please wait...' size='lg' color='danger' />} > */}
      {/* <Suspense fallback={<span>Loading. Please wait...' </span>} > */}

        <Canvas id='canvas' >
          <directionalLight position={new THREE.Vector3(-40,0,10)} args={[0xffffff, 1.2]} castShadow={false} />
          <directionalLight position={new THREE.Vector3(40,0,10)} args={[0xffffff, 1.2]} castShadow={false} />
          <GLHeader {...{sX, sY, oX, oY}} />
          <GLInterior />
        </Canvas>
      {/* </Suspense> */}
      {/* </Layout.Header> */}
      {/* <Layout.MainContent> */}
        {/* <Canvas id='house'> */}
          {/* <hemisphereLight args={[0xffffff]} /> */}
          {/* <directionalLight position={new THREE.Vector3(-50,20,10)} args={[0xffffff, 1.5]} castShadow={true} target={new THREE.Object3D()}/> */}
          {/* <directionalLight position={new THREE.Vector3(40,0,10)} args={[0xffffff, 1.2]} castShadow={false} /> */}
          {/* <perspectiveCamera fov={50} aspect={houseAspect} near={0.1} far={2000} /> */}
          
        {/* </Canvas> */}
      {/* <div id='house-interior' >
        <div id='right-frame'>
          <div id='right-lintel'>
            <div id='lintel-paper' />
          </div>
        </div>
        <div id='left-frame'>
          <div id='left-side-center-screen' />
          <div id='left-side-left-tatami' />
          <div id='left-side-center-tatami' />
          <div id='raised-tatami' />
          <div id='dais-partition'> 
            <svg id='dais-bottom-lintel' viewBox='0 0 341 666' > 
              <use href='#lintel' x='0' y='623' /> 
            </svg>
          </div>
          <div id='left-side-right-bottom-tatami' />
          <div id='left-lintel' >
            <svg id='struts' viewBox='0 0 735 77' xmlns="http://www.w3.org/2000/svg">
              <defs>
                <image id='strut' href={endStrut} x='0' y='0' width='7' height='75'  preserveAspectRatio="none" />
                <image id='brace' href={brace} x='0' y='0' width='735' height='5' preserveAspectRatio='none' />
                <image id='mid-strut' href={endStrut} x='0' y='0' width='4' height='75' preserveAspectRatio='none' />
                <image id='lintel' href={brace} x='0' y='0' width='341' height='39'  preserveAspectRatio='none' />
              </defs>
              <use href='#strut' className='end-strut' x='0' y='-4' />
              <use href='#strut' className='end-strut' x='727' y='-4' />
              { strutArray }
              <use href='#brace' className='brace' x='0' y='69' />
            </svg>
          </div>
        </div>
      </div> */}
      </>
    //   </Layout.MainContent>
    // </Layout>
    // </ThemeUIProvider>
  )
};

export default IndexPage;

// export const Head = () => <Seo title='Home'/>;