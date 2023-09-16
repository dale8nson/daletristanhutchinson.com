import * as React from 'react';
import  DeiruLogo  from '../images/deiru-logo.svg';
import './scss/_deiru.scss';

const DEBUG = false;

DEBUG && console.log(`typeof Logo: ${typeof DeiruLogo}`);
DEBUG && console.log(`Logo: ${DeiruLogo}`);

const Deiru = () => {
  return (
    <div className='deiru'>
      <DeiruLogo/>
    </div>
  );
} 

export default Deiru;