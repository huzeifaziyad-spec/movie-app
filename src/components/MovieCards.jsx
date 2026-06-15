import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { addToWatchlist, removeFromWatchlist, checkIfInWatchlist } from "../appwrite";

const MovieCards = ({
  movie,
  isFavorite,
  mediaType
}) => {
  const { id, title, name, poster_path, release_date, first_air_date, vote_average, original_language } = movie;

  const isTv = mediaType === "tv" || movie.media_type === "tv" || String(id).startsWith("tv-") || first_air_date !== undefined || (name !== undefined && title === undefined);
  const actualId = String(id).replace("tv-", "");
  const watchlistId = isTv ? `tv-${actualId}` : actualId;
  const linkPath = isTv ? `/tv/${actualId}` : `/movie/${actualId}`;

  const displayTitle = title || name || "Untitled";
  const displayDate = release_date || first_air_date || "";

  const [isInWatchlist, setIsInWatchlist] = useState(isFavorite ?? false);

  useEffect(() => {
    if (isFavorite !== undefined) {
      setIsInWatchlist(isFavorite);
      return;
    }
    const checkStatus = async () => {
      const status = await checkIfInWatchlist(watchlistId);
      setIsInWatchlist(status);
    };
    checkStatus();
  }, [watchlistId, isFavorite]);

  const toggleWatchlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isInWatchlist) {
        await removeFromWatchlist(watchlistId);
        setIsInWatchlist(false);
      } else {
        // Normalize object to save to Appwrite
        const mediaObj = {
          id: watchlistId,
          title: displayTitle,
          poster_path,
          vote_average,
          release_date: displayDate
        };
        await addToWatchlist(mediaObj);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
    }
  };

  return (
    <Link to={linkPath}>
      <div className="movie-card transition-all duration-300 relative group">
        <div className="relative overflow-hidden rounded-xl">
          <img
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : "/assets/no-poster.png"
            }
            alt={displayTitle}
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
            {isInWatchlist
              ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
              </svg>
              : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            }
          </button>
        </div>

        <h3>{displayTitle}</h3>
        <div className="content">
          <div className="rating">
            <img src="/assets/star.svg" alt="Star" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>{displayDate ? displayDate.slice(0, 4) : "N/A"}</span>
          <span>{original_language ? original_language.toUpperCase() : "N/A"}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCards;
