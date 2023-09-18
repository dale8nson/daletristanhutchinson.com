import * as React from 'react';
import { Flex, Box } from 'theme-ui';

const ZenAnimation = (props) => {
  return (
  <Flex className='zen-image'>
    <Box className='zen-image-bg' />
    <Box className='zen-image-fg' />
  </Flex>
  );
};

export default ZenAnimation;