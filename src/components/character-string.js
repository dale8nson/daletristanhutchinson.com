// import * as React from 'react';
import { Char } from './';

const DEBUG = true;

const CharacterString = ({children, font, className, charClassName =''}) => {
  DEBUG && console.log(`typeof children: ${typeof children}`);
  const chars = children.split('').map(child => child.split('').map((char, i) => <Char key={i} font={font} char={char} className={charClassName} as='span'/>));

  return (
    <div className={className}>
      {chars}
    </div>
  );
};

export default CharacterString;