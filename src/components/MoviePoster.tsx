import { animated } from '@react-spring/web';

interface MoviePosterProps {
  movie: {
    posterUrl: string;
    title: string;
  };
  ref: React.RefObject<HTMLElement>;
  onSelect: () => void;
}

const MoviePoster: React.FC<MoviePosterProps> = ({ movie, ref, onSelect }) => {
  const { x, y, bind } = animated.useSpring(() => ({ x: 0, y: 0, bind: 'together' }));

  return (
    <animated.div
      ref={ref}
      {...bind()}
      style={{ x, y, position: 'absolute', cursor: 'grab', touchAction: 'none' }}
      onClick={onSelect}
    >
      <div className="relative">
        <div className="absolute top-0 left-1/2 w-0.5 h-12 bg-gray-400 transform -translate-x-1/2" />
        <img src={movie.posterUrl} alt={movie.title} className="w-[150px] h-[225px] sm:w-[200px] sm:h-[300px] rounded-lg shadow-lg" />
      </div>
    </animated.div>
  );
};

export default MoviePoster;
