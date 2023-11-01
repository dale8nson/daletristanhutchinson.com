import * as React from 'react';
// import '../assets/scss/_fonts.scss';
// import './scss/_char.scss';

const Char = ({as, char, font, className, charStyle }) => {
  const style = {
    fontFamily: font,
    ...charStyle
  }
  return React.createElement(as || 'div', {style, className:'char ' + className}, [char]);
};

export default Char;