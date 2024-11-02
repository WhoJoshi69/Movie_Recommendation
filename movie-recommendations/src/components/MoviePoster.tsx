import React, { useEffect, useRef, useState } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { Movie } from '../types';

interface MoviePosterProps {
  movie: Movie;
  onSelect: () => void;
  initialX: number;
  initialY: number;
  isBlasted: boolean;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ movie, onSelect, initialX, initialY, isBlasted }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const [{ x, y }, api] = useSpring(() => ({
    x: initialX,
    y: initialY,
    config: { mass: 1, tension: 280, friction: 60 }
  }));

  useEffect(() => {
    if (isBlasted) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 0;
      api.start({
        x: x.get() + Math.cos(angle) * distance,
        y: y.get() + Math.sin(angle) * distance,
        config: { ...config.wobbly, velocity: 1000 }
      });
    } else {
      api.start({
        x: initialX,
        y: initialY,
        config: config.gentle
      });
    }
  }, [isBlasted, api, x, y, initialX, initialY]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
        const repelForce = Math.min(30, 3000 / (distance + 1)); // Reduced repel force
        api.start({ 
          x: x.get() + Math.cos(angle) * repelForce, 
          y: y.get() + Math.sin(angle) * repelForce,
          config: { mass: 1, tension: 200, friction: 400 }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [api, x, y]);

  return (
    <animated.div
      ref={ref}
      style={{ 
        x, 
        y, 
        position: 'absolute', 
        cursor: 'grab', 
        touchAction: 'none',
        transform: 'translate3d(0,0,0)',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
      onClick={onSelect}
    >
      <div className="relative">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-[150px] h-[225px] sm:w-[200px] sm:h-[300px] rounded-lg shadow-lg"
          onLoad={() => setIsLoaded(true)}
          style={{ display: isLoaded ? 'block' : 'none' }}
        />
        {!isLoaded && (
          <div className="w-[150px] h-[225px] sm:w-[200px] sm:h-[300px] bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="loader"></span>
          </div>
        )}
      </div>
    </animated.div>
  );
};

export default MoviePoster;
