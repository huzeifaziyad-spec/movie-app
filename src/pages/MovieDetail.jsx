import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MovieCards from "../components/MovieCards";
import { addToWatchlist, removeFromWatchlist, checkIfInWatchlist } from "../appwrite";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setIsLoading(true);
      if (!API_KEY) {
        console.error("TMDB API Key is missing");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch movie details
        const res = await fetch(`${API_BASE_URL}/movie/${id}?language=en-US&api_key=${API_KEY}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.status_message || "Failed to fetch movie details");
        }
        
        const data = await res.json();
        setMovie(data);

        // Fetch cast
        const castRes = await fetch(`${API_BASE_URL}/movie/${id}/credits?api_key=${API_KEY}`);
        const castData = await castRes.ok ? await castRes.json() : { cast: [] };
        const topCast = (castData.cast || []).slice(0, 12);

        const castWithCounts = await Promise.all(
          topCast.map(async (actor) => {
            try {
              const actorRes = await fetch(`${API_BASE_URL}/person/${actor.id}/movie_credits?api_key=${API_KEY}`);
              const actorData = await actorRes.json();
              return { ...actor, movieCount: actorData.cast?.length || 0 };
            } catch (err) {
              return { ...actor, movieCount: 0 };
            }
          })
        );

        setCast(castWithCounts);

        // Fetch related movies
        const relatedRes = await fetch(`${API_BASE_URL}/movie/${id}/recommendations?api_key=${API_KEY}`);
        const relatedData = await relatedRes.ok ? await relatedRes.json() : { results: [] };
        setRelatedMovies(relatedData.results || []);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const checkWatchlistStatus = async () => {
      const status = await checkIfInWatchlist(id);
      setIsInWatchlist(status);
    };

    fetchMovieDetails();
    checkWatchlistStatus();
    window.scrollTo(0, 0);
  }, [id]);

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movie.id);
        setIsInWatchlist(false);
      } else {
        await addToWatchlist(movie);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (!movie) return <p>Movie not found</p>;

  return (
    <div className="movie-detail p-4 relative min-h-screen bg-primary text-white">
      {/* Backdrop Image */}
      {movie.backdrop_path && (
        <div className="absolute top-0 left-0 w-full h-[600px] z-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt="Backdrop"
            className="w-full h-full object-cover opacity-60 mask-image-b"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[black]/50 to-[black]" />
          <div className="absolute bottom-0 left-0 w-full h-32 backdrop-blur-md" />
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto mt-64 flex flex-col md:flex-row gap-10 items-center md:items-start p-6 relative z-10 transition-all duration-300">
        {/* Left Side: Poster */}
        <div className="flex-shrink-0">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-48 md:w-60 rounded-xl shadow-2xl border-4 border-white/10 md:mt-[-165px]"
          />
        </div>

        {/* Right Side: Details */}
        <div className="text-center md:text-left flex-1 md:mt-[-145px]">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight shadow-black drop-shadow-lg">{movie.title}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm md:text-base font-medium text-gray-400 mb-4">
            {movie.genres?.map((genre) => (
              <span key={genre.id} className="bg-white/10 text-red-400 px-2 py-0.5 rounded text-xs">
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-6">{movie.overview}</p>

          <div className="flex items-center justify-center md:justify-start gap-4">
            <button
              onClick={() => document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black hover:bg-gray-200 px-6 py-2 rounded-md font-bold flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
              Play
            </button>

            <button
              onClick={toggleWatchlist}
              className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-all duration-300 ${isInWatchlist
                  ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                  : 'bg-transparent border border-gray-600 hover:bg-white/10 text-white'
                }`}
            >
              {isInWatchlist ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              )}
              {isInWatchlist ? "In Watchlist" : "Watchlist"}
            </button>

            <a
              href={`https://vidvault.ru/movie/${movie.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-600 hover:bg-white/10 text-white p-2 rounded-md flex items-center justify-center transition-colors"
              title="Download Movie"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <section className="mt-20">
        <h2 className="text-xl font-bold mb-6">Cast</h2>
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-5 hide-scrollbar snap-x">
          {cast.map((actor) => (
            <Link
              key={actor.cast_id || actor.credit_id}
              to={`/person/${actor.id}`}
              className="flex items-center gap-4 w-[240px] sm:w-auto flex-shrink-0 snap-start bg-dark-100/50 p-3 rounded-2xl border border-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 group"
            >
              <img
                src={
                  actor.profile_path
                    ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                    : "/assets/no-poster.png"
                }
                alt={actor.name}
                className="w-14 h-14 object-cover rounded-full shadow-lg border-2 border-transparent group-hover:border-red-500 transition-colors"
              />
              <div className="flex flex-col">
                <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-red-400 transition-colors">{actor.name}</p>
                <p className="text-xs text-gray-400 line-clamp-1 mb-1">{actor.character}</p>
                {actor.movieCount !== undefined && (
                  <p className="text-[10px] font-black text-white/50 tracking-wider uppercase">
                    {actor.movieCount} {actor.movieCount === 1 ? 'Movie' : 'Movies'}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Embedded Player Section */}
      <section id="player-section" className="mt-20 mb-20 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Watch Now</h2>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50">
          <iframe
            src={`https://vidsrc.me/embed/movie?tmdb=${movie.id}`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title="Movie Player"
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </section>

      {/* Related Movies Section */}
      {relatedMovies.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold mb-6">Related Movies</h2>
          <div className="flex overflow-x-auto gap-6 pb-5 hide-scrollbar snap-x">
            {relatedMovies.map((relatedMovie) => (
              <div key={relatedMovie.id} className="w-[200px] flex-shrink-0 snap-start">
                <MovieCards movie={relatedMovie} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MovieDetail;
