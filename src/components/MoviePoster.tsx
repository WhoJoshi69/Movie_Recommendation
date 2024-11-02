import React, { useState } from 'react';
import { Movie } from '../types';

interface MoviePosterProps {
  movie: Movie;
  onSelect: () => void;
  initialX: number;
  initialY: number;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ movie, onSelect, initialX, initialY }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      style={{ 
        position: 'absolute',
        left: `${initialX}px`,
        top: `${initialY}px`,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        userSelect: 'none'
      }}
      onClick={onSelect}
    >
      <div className="relative">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="w-[150px] h-[225px] sm:w-[200px] sm:h-[300px] rounded-lg shadow-lg cursor-pointer"
          onLoad={() => setIsLoaded(true)}
          style={{ display: isLoaded ? 'block' : 'none' }}
          draggable={false}
        />
        {!isLoaded && (
          <div className="w-[150px] h-[225px] sm:w-[200px] sm:h-[300px] bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="loader"></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoviePoster;
