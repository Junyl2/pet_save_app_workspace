'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import styles from './ReviewImageGallery.module.css';

interface ReviewImageGalleryProps {
  images: string[];
}

export function ReviewImageGallery({ images }: ReviewImageGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.gallery}>
          {images.map((src, idx) => (
            <Image
              key={`${src}-${idx}`}
              src={src}
              alt={`review-${idx}`}
              width={100}
              height={100}
              className={styles.thumb}
              onClick={() => setIndex(idx)}
            />
          ))}
        </div>
      </div>

      {index !== null && (
        <Lightbox
          open
          close={() => setIndex(null)}
          slides={images.map((src) => ({ src }))}
          index={index}
          plugins={[Zoom]}
          zoom={{
            maxZoomPixelRatio: 3,
            scrollToZoom: true,
          }}
          controller={{
            closeOnBackdropClick: true,
          }}
          carousel={{
            finite: true,
          }}
        />
      )}
    </>
  );
}
