import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ImageComponent = ({ image }) => {
  return (
    <Image src={image?.image?.file?.url} alt="image" width={190} height={108} />
  );
};

export default ImageComponent;
