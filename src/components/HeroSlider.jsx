import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchFromTMDB } from '../lib/tmdb';
import TrailerModal from './TrailerModal';

const HeroSlider = ({ movies, mediaType = "movie" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [youtubeKey, setYoutubeKey] = useState("");
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  const handleWatchTrailer = async () => {
    if (!activeMovie) return;
    setIsLoadingTrailer(true);
    try {
      const endpoint = `/${mediaType}/${activeMovie.id}/videos`;
      const data = await fetchFromTMDB(endpoint);
      const trailer = data.results?.find(
        (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
      ) || data.results?.find((v) => v.site === "YouTube");
      
      if (trailer) {
        setYoutubeKey(trailer.key);
        setIsModalOpen(true);
      } else {
        alert("Trailer not found for this title.");
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  useEffect(() => {
    if (!movies || movies.length === 0) return;

    setIsExpanded(false);

    // Auto expand after 1.5 seconds
    const expandTimer = setTimeout(() => {
      setIsExpanded(true);
    }, 1500);

    // Auto advance to next movie after 8 seconds
    const advanceTimer = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, 8000);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(advanceTimer);
    };
  }, [activeIndex, movies]);

  if (!movies || movies.length === 0) return null;

  const activeMovie = movies[activeIndex];

  return (
    <div className="relative w-full h-[90vh] min-h-[600px] bg-[#000000] overflow-hidden mb-12">

      {/* Dynamic Background with Fade & Blur */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={`https://image.tmdb.org/t/p/original${activeMovie.backdrop_path}`}
            alt={activeMovie.title || activeMovie.name}
            className={`w-full h-full object-cover transition-all duration-1000 ${isExpanded ? 'opacity-80 scale-105' : 'opacity-100'}`}
          />
          {/* Smooth bottom gradient blend */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent z-10" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent w-full md:w-3/4" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 w-full px-5 md:px-12 z-20 flex flex-col justify-end pb-10 pt-20">

        {/* Expanded Info */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                className="max-w-4xl"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl sm:text-5xl md:text-6xl lg:text-4xl font-black mb-6 uppercase tracking-tight leading-tight drop-shadow-2xl text-white mx-0"
                  style={{ fontFamily: '"Bebas Neue", "Funnel Display", sans-serif' }}
                >
                  {activeMovie.title || activeMovie.name}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-200 text-base md:text-lg lg:text-xl leading-relaxed mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl font-light drop-shadow-lg"
                >
                  {activeMovie.overview}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-wrap items-center gap-3 animate-fade-in"
                >
                  <Link
                    to={mediaType === "tv" ? `/tv/${activeMovie.id}` : `/movie/${activeMovie.id}`}
                    className="bg-white text-black px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:bg-gray-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] cursor-pointer text-sm sm:text-base"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Watch Now
                  </Link>
                  <button
                    onClick={handleWatchTrailer}
                    disabled={isLoadingTrailer}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold hover:bg-white/20 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] cursor-pointer disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isLoadingTrailer ? "Loading…" : (
                      <>
                        <svg className="w-4 h-4 text-orange-500 fill-current flex-shrink-0" viewBox="0 0 24 24">
                          <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
                        </svg>
                        Trailer
                      </>
                    )}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Horizontal Cards Tray */}
        <div className="flex items-end gap-4 w-full mt-auto">
          {movies.map((movie, idx) => {
            const isActive = idx === activeIndex;
            return (
              <motion.div
                key={movie.id}
                layout
                onClick={() => setActiveIndex(idx)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer flex-shrink-0 transition-all duration-700 ease-out 
                  ${isActive && isExpanded ? 'w-48 md:w-72 aspect-video border-2 border-indigo-400/50 shadow-[0_0_30px_rgba(79,70,229,0.3)]' : isActive ? 'w-24 md:w-32 aspect-[2/3] border-2 border-white/40' : 'w-24 md:w-32 aspect-[2/3] border border-white/10 opacity-50 hover:opacity-100 hover:scale-105'}
                `}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${isActive && isExpanded ? movie.backdrop_path : movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover transition-all duration-700"
                />

                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700" />
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="absolute bottom-4 left-4 right-4"
                      >
                        <p className="text-white text-xs md:text-sm font-bold line-clamp-2">{movie.title || movie.name}</p>
                      </motion.div>
                    )}
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                      <motion.div
                        key={`progress-${activeIndex}`}
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]"
                      />
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}

          {/* Controls */}
          <div className="ml-auto flex gap-3 pb-2 self-end">
            <button
              onClick={() => setActiveIndex(prev => (prev - 1 + movies.length) % movies.length)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-md hover:scale-110 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => setActiveIndex(prev => (prev + 1) % movies.length)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all backdrop-blur-md hover:scale-110 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <TrailerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        youtubeKey={youtubeKey}
      />
    </div>
  );
};

export default HeroSlider;
