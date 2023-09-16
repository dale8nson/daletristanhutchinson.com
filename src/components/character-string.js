// import * as React from 'react';
import { Char } from './';

const DEBUG = true;

const CharacterString = ({children, font, className, charClassName, charStyle}) => {
  DEBUG && console.log(`typeof children: ${typeof children}`);

  const chars = children.split('').map(child => child.split('').map((char, i) => {

    return (
      <Char key={i} style={charStyle} font={font} char={char} className={charClassName} as='span'/>
    );
    
  }));
  
  return (
    <span className={`character-string ${className}`}>
      {chars}
    </span>
  );
};

export default CharacterString;