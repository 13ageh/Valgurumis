'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function ProductImage({ src, alt, priority = false }) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      priority={priority}
      onError={() => setImgSrc('/placeholder.jpg')}
    />
  );
}