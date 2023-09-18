
import { useRef } from 'react';
import { Seo, Deiru, Layout, ParallaxImage, CharacterString, DaleTristanHutchinson, Zen3D, GLHeader } from '../components';
import { home } from '../themes';
import { StaticImage } from 'gatsby-plugin-image';
import { ThemeUIProvider, Flex, NavLink, MenuButton, Container, Text, Divider, Box, Image } from 'theme-ui';
// import {Canvas} from '@react-three/fiber';
import './scss/_index.scss';
import endStrut from '../assets/woodgrain-ttb.svg';
import brace from '../assets/woodgrain-ltr.svg';
import bg from '../assets/zen-panorama-bg.webp#xywh=0,0,1470,500';
import {Canvas, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { StoneImage } from '../components/gl-header';


const IndexPage = () => {
  const zenRef = useRef(null);
  const zenFgRef = useRef(null);
  const zenBgRef = useRef(null);
  // const dTHRef = {current:null};
  const dTHRef = useRef(null);

  let dthAnims;
  // const dTHRef = useRef(null);
  const zenBgContainerRef = useRef(null);

  // const animWorker = new Worker(new URL('./dthAnimationWorker.js', import.meta.url));
  const setupDTHAnims = (node) => {
    // console.log('setupDTHAnims');
    const anims = node.getAnimations({subtree:true});
    // const animProxyHandler = {};
    // const animProxy = new Proxy(anims, animProxyHandler);
    // animWorker.postMessage(animProxy);
    dTHRef.current = node;
    // animWorker.postMessage();
    // anims.forEach(anim =>  console.log(anim));
    // dthAnims = anims.filter(anim => anim.effect.target.id.includes('p-'));
    const dTHAnim = anims.find(anim => anim.animationName === 'dth-entrance');
    dTHAnim.ready.then(() => requestAnimationFrame(() => dTHAnim.play()));
    // const SVGAnim = anims.find(anim => anim.animationName === 'dth-svg-entrance');
    // SVGAnim.ready.then(() => requestAnimationFrame(() => SVGAnim.play()));
    // const pathAnim = anims.find(anim => anim.animationName === 'dth-svg-path-entrance')
    // pathAnim.ready.then(() => requestAnimationFrame(() => pathAnim.play()));
    // const firstLetter = anims.find(anim => anim.effect.target.id === 'p-1');
    // firstLetter.ready.then(() => requestAnimationFrame(() => firstLetter.play()));
  }

  const animateEntrance = () => {
    // console.log('animateEntrance');

    zenRef.current.className += !zenRef.current.className.includes('entrance-active') ? ` entrance-active` : '';
    zenFgRef.current.className += !zenFgRef.current.className.includes('entrance-active') ? ` entrance-active` : '';
    zenBgRef.current.className += !zenBgRef.current.className.includes('entrance-active') ? ` entrance-active` : '';
    zenBgContainerRef.current.className += !zenBgContainerRef.current.className.includes('entrance-active') ? ` entrance-active` : '';
    
  }

  function handleDTHAnimationStart (e) {
    animManager(dTHRef);

  }

  function animManager(ref) {
    const animations = ref.current.getAnimations();
    const dTHAnim = animations.find(anim =>  anim.animationName === 'dth-entrance');
    const progress = dTHAnim.effect.getComputedTiming().progress;
    if(progress >= 0.16) {
      requestAnimationFrame(animateEntrance);
      return;
    }
    // setTimeout(() => requestAnimationFrame(() => animManager(ref), 1000));
    requestAnimationFrame(() => animManager(ref));
  }

  function handleDTHAnimationEnd (e) {
      const id = e.target.id;
      if(id.startsWith('p-')) {
        const pathNumber = Number(id.match(/\d+/)[0]);
        if(pathNumber < 19) {
        requestAnimationFrame(() => dthAnims[pathNumber].play());
      }
    }  
  }
  

  const handleFgAnimationEnd = (e) => {
    if(e.animationName === 'fg-entrance') {
      requestAnimationFrame(animateSwing);
    }
  }

  function animateSwing () {
    zenRef.current.className = `${zenRef.current.className.replace('entrance-active','')} swing-active`;
    zenFgRef.current.className = `${zenFgRef.current.className.replace('entrance-active','')} swing-active`;
    zenBgRef.current.className = `${zenBgRef.current.className.replace('entrance-active','')} swing-active`;
  }
  const strutArray = Array(50).fill(null).map((strut, i) => {
    return <use key={i} href='#mid-strut' className='mid-strut' x={(i + 1) * 14.7} y='-5' />
  });
  
  return (
    <ThemeUIProvider theme={ home }>
    <Layout header>
        <Layout.Header>
        {/* <Container style={{overflowX:'clip', overflowY:'visible'}}> */}
          {/* <div style={{margin:'0', height:'auto', width:'100%', overflowX:'clip', overflowY:'visible'}}> */}
            {/* <div className='zen-image' ref={zenRef}> */}
              {/* <div className='bg-container' style={{overflow:'hidden'}} ref={zenBgContainerRef}> */}
                {/* <div className='zen-image-bg' ref={zenBgRef} id='zen-bg' /> */}
                {/* <div className='zen-image-fg'  ref={zenFgRef} onAnimationEnd={handleFgAnimationEnd} /> */}
                {/* <DaleTristanHutchinson className='dth' ref={setupDTHAnims} onAnimationStart={handleDTHAnimationStart} onAnimationEnd={handleDTHAnimationEnd} /> */}

              {/* </div> */}
            {/* </div> */}
          {/* </div> */}
        {/* </Container> */}
        {/* <Divider/> */}
        <Canvas>
         <GLHeader />
        </Canvas>
        </Layout.Header>
      <Layout.MainContent>
      {/* <Canvas id='stone-canvas' dpr={window.devicePixelRatio} style={{width: '1463px', height: 'auto'}}>
        <ambientLight />
        <directionalLight position={new THREE.Vector3(-10,-5,5)} args={[0xcccccc, 0.7, 4]} castShadow={true} />
        <StoneImage />
      </Canvas> */}
      <div id='house-interior' >
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
      </div>
      </Layout.MainContent>
    </Layout>
    </ThemeUIProvider>
  )
};

export default IndexPage;

export const Head = () => <Seo title='Home'/>;