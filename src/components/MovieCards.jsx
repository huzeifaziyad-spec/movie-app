import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { addToWatchlist, removeFromWatchlist, checkIfInWatchlist } from "../appwrite";

const MovieCards = ({
  movie,
}) => {
  const { id, title, poster_path, release_date, vote_average, original_language } = movie;
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkIfInWatchlist(id);
      setIsInWatchlist(status);
    };
    checkStatus();
  }, [id]);

  const toggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(id);
        setIsInWatchlist(false);
      } else {
        await addToWatchlist(movie);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
    }
  };

  return (
    <Link to={`/movie/${id}`}>
      <div className="movie-card transition-all duration-300 relative group">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : "/assets/no-poster.png"
            }
            alt={title}
            className="group-hover:scale-105 transition-transform duration-500"
          />

          {/* Watchlist Button Overlay */}
          <button
            onClick={toggleWatchlist}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-20 ${isInWatchlist
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/40 opacity-100'
              : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-white hover:text-black'
              }`}
            title={isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          >
            {isInWatchlist ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>

        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="/assets/star.svg" alt="Star" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>{release_date ? release_date.slice(0, 4) : "N/A"}</span>
          <span>{original_language ? original_language.toUpperCase() : "N/A"}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCards;
