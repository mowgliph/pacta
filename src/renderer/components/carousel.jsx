import React from 'react';
import Flicking from '@egjs/react-flicking';
import '@egjs/react-flicking/dist/flicking.css';

const Carousel = ({ children }) => {
  return (
    <Flicking className="w-full">
      {children}
    </Flicking>
  );
};

export default Carousel;