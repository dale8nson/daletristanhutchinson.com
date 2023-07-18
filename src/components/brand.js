import { LargeTitle } from '@fluentui/react-components';
import * as React from 'react';
import './scss/_brand.scss';
const Brand = (props) => {
  const { name } = props;
  return (
    <div className='brand'>
      <div className='brand-name'>
      <div className='brand-link'>
        <a href='/'>
          <LargeTitle className='brand-text'>{ name }</LargeTitle>
        </a>
        </div>
      </div>
    </div>
  ); 
};

export default Brand;