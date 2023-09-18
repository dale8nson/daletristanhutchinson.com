import * as React from 'react';
import './scss/_parallax-image.scss';

const ParallaxImage = ({src, className}) => {
  const style = {
    backgroundImage: src
  };
  return (
    <div className={`parallax-image ${className}`} style={{...style}} />
  );
}

export default ParallaxImage;