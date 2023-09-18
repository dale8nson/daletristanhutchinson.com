import  { useRef, useEffect } from 'react';
import * as React from 'react';
import Paths from '../images/dth-paths.svg';
import paintMask from '../images/paint-mask.png';
import './scss/_dale-tristan-hutchinson.scss';

const DaleTristanHutchinson = ({className, onAnimationEnd}) => {
  const pathsRef = useRef(null);
  // const loadHandler = (e) => {
    useEffect(() => {
      console.log(pathsRef.current);
      const pathGroup = pathsRef.current.querySelector("#path-group");
      console.log(pathGroup);
      const Mask = () => {return (
        <mask id='paint-mask'>
          <image href={paintMask} x='0' y='0' width='300' height='400' />
        </mask>
      )};
      console.log(Mask())
      const paintClip = (
        <clipPath id="paint-clip" mask="url(#paint-mask)" />
      );
    });
    
  // }
  // console.log(<Paths ref={pathsRef} />);
 return (
  <div className={`dale-tristan-hutchinson ${className || ''}`}  onAnimationEnd={onAnimationEnd}>
    {/* <DTH /> */}
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 169.84448 18.467926"
      version="1.1"
      id="svg5"
      ref={pathsRef}
      
   >
     <g
     id="layer1"
     transform="translate(-22.627089,-199.95126)">
    <g
       aria-label="dale Tristan Hutchinson"
       id="g298"
       >

    {/* <mask id='paint-mask'>
      <image href={paintMask} x='0' y='0' width='300' height='400' />
    </mask> */}
      
      <Paths />
      {/* <ClipPath /> */}
      {/* <clipPath id='paint-clip-path'>
        <image href={paintMask} x='0' y='0' width='300' height='400' />
      </clipPath> */}

    </g>
  </g>
  </svg>
  </div>
 )
}

export default DaleTristanHutchinson;