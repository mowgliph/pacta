import React from 'react';
import Virtua from 'virtua';

const VirtualizedList = ({ items, renderItem }) => {
  return (
    <Virtua
      items={items}
      itemHeight={50}
      render={renderItem}
    />
  );
};

export default VirtualizedList;