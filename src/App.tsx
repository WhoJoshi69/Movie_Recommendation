import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import MoviePoster from './components/MoviePoster';
import SwirlCursor from './components/SwirlCursor';
import { Movie } from './types';
import { useSpring } from '@react-spring/web';
import Autocomplete from './components/Autocomplete';

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <span className="loader"></span>
  </div>
);

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2 bg-gray-900/80 backdrop-blur-lg' 
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <h1 className={`font-bold font-montserrat transition-all duration-300 ${
            isScrolled ? 'text-2xl' : 'text-4xl'
          }`}>
            WhoJoshi Movie Recommendations
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-800 transition-colors duration-300"
          >
            {darkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isBlasted, setIsBlasted] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);

  const [{ y }, setY] = useSpring(() => ({ y: 0 }));

  const fetchAutocompleteResults = async (query: string) => {
    try {
      const response = await fetch(`http://localhost:8000/autocomplete?term=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.movie.map((item: { label: string; url: string }) => item.label);
    } catch (error) {
      console.error('Error fetching autocomplete results:', error);
      return [];
    }
  };

  const debouncedFetchMovies = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(query);
    }, 300);
  }, []);

  const handleEnterPress = useCallback((query: string) => {
    setIsLoading(true);
    fetch(`http://localhost:8000/recommend?query=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        setMovies(data.movies || []);
      })
      .catch(error => {
        console.error('Error fetching movies:', error);
        setMovies([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setY({ y: window.scrollY });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBlast = useCallback(() => {
    setIsBlasted(true);
    setTimeout(() => setIsBlasted(false), 1000);
  }, []);

  return (
    <div className={`h-screen fixed inset-0 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-500`}>
      <SwirlCursor />
      <div className="h-full flex flex-col">
        <div className="flex-none px-4 py-8">
          <div ref={searchBarRef} className="relative flex justify-center">
            <Autocomplete
              onSearch={debouncedFetchMovies}
              fetchSuggestions={fetchAutocompleteResults}
              placeholder="Search for a movie..."
              className="w-full max-w-md p-4 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
              onEnter={handleEnterPress}
            />
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <div className="poster-grid-container">
            <div 
              className="poster-grid flex flex-wrap justify-center items-start p-4"
              onClick={handleBlast}
            >
              {movies.map((movie, index) => (
                <MoviePoster
                  key={movie.id}
                  movie={movie}
                  onSelect={() => setSelectedMovie(movie)}
                  initialX={(index % 5 - 2) * 220}
                  initialY={Math.floor(index / 5) * 320}
                  isBlasted={isBlasted}
                />
              ))}
            </div>
          </div>
          <AnimatePresence>
            {selectedMovie && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
                onClick={() => setSelectedMovie(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 15, stiffness: 100 }}
                  className="bg-white rounded-lg p-8 max-w-2xl w-full text-gray-900 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <motion.h2 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-bold mb-4"
                  >
                    {selectedMovie.title}
                  </motion.h2>
                  <div className="flex flex-col md:flex-row">
                    <motion.img 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      src={selectedMovie.posterUrl} 
                      alt={selectedMovie.title} 
                      className="w-full md:w-1/3 h-auto object-cover rounded-lg mb-4 md:mb-0 md:mr-4" 
                    />
                    <div className="flex-1">
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mb-2"
                      >
                        Release Year: {selectedMovie.year}
                      </motion.p>
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mb-2"
                      >
                        Genres: {selectedMovie.genres.join(', ')}
                      </motion.p>
                      <motion.p 
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mb-4"
                      >
                        {selectedMovie.overview}
                      </motion.p>
                    </div>
                  </div>
                  <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={() => setSelectedMovie(null)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-300"
                  >
                    Close
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {isLoading && <Loader />}
    </div>
  );
}