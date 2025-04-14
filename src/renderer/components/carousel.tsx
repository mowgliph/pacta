import React from 'react';
import Flicking from '@egjs/react-flicking';
import '@egjs/react-flicking/dist/flicking.css';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
}

const Carousel: React.FC<CarouselProps> = ({ children, className }) => {
  return (
    <Flicking className={className}>
      {children}
    </Flicking>
  );
};

export default Carousel;