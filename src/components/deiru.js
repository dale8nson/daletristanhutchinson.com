import * as React from 'react';
import  DeiruLogo  from '../images/deiru-logo.svg';

const DEBUG = false;

DEBUG && console.log(`typeof Logo: ${typeof DeiruLogo}`);
DEBUG && console.log(`Logo: ${DeiruLogo}`);

const Deiru = () => {

  const style = {
    position: 'relative',
    width:'3%',
    overflow:'visible',
    zIndex:10
  }
  
  return (
    <div style={style}>
      <DeiruLogo/>
    </div>
  );
} 

export default Deiru;