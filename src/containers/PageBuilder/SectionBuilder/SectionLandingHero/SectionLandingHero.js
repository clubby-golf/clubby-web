'use client';

import { useState, useEffect } from 'react';
import css from './SectionLandingHero.module.css';

const images = [];

export default function SectionLandingHero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section className={css.heroSection}>
      {/* Background Images */}
      <div className={css.backgroundContainer}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`${css.backgroundImage} ${index === currentImage ? css.active : ''}`}
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        ))}
      </div>

      {/* Overlay for better text readability */}
      <div className={css.overlay} />

      {/* Scrolling Animation Overlay */}
      <div className={css.scrollingOverlay}>
        <div className={css.scrollingGradient} />
      </div>

      {/* Content */}
      <div className={css.content}>
        <div className={css.container}>
          <div className={css.textContainer}>
            <h1 className={css.title}>
              Create Something
              <span className={css.titleGradient}>Extraordinary</span>
            </h1>
            <p className={css.subtitle}>
              Transform your ideas into reality with our innovative platform. Experience the future
              of digital creation today.
            </p>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className={css.indicators}>
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`${css.indicator} ${index === currentImage ? css.active : ''}`}
          />
        ))}
      </div>
    </section>
  );
}
