import * as React from 'react';
import '../assets/scss/_fonts.scss';

const Char = ({char, font, className, as}) => {
  const style = {
    fontFamily: font
  }
  return React.createElement(as || 'div', {style, className:'char ' + className}, [char]);
};

export default Char;