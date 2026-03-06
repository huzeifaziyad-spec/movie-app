import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        // Fetch movie details
        const res = await fetch(`${API_BASE_URL}/movie/${id}?language=en-US`, API_OPTIONS);
        const data = await res.json();
        setMovie(data);

        // Fetch cast
        const castRes = await fetch(`${API_BASE_URL}/movie/${id}/credits`, API_OPTIONS);
        const castData = await castRes.json();
        setCast(castData.cast.slice(0, 12)); // first 12 cast members
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

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
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030014]/50 to-[#030014]" />
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
          <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-6">{movie.overview}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-base md:text-lg font-medium text-gray-300">
            <p className="flex items-center gap-2"><span>📅</span> {movie.release_date}</p>
            <p className="flex items-center gap-2"><span>⭐</span> {movie.vote_average?.toFixed(1)}</p>
            <p className="flex items-center gap-2"><span>⏱️</span> {movie.runtime ? `${movie.runtime}m` : 'N/A'}</p>
            <p className="flex items-center gap-2"><span>🗣️</span> {movie.original_language?.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      <section className="mt-20">
        <h2 className="text-xl font-bold mb-2">Top Billed Cast</h2>
        <div className="flex overflow-x-auto gap-5 pb-5">
          {cast.map((actor) => (
            <div key={actor.cast_id || actor.credit_id} className="w-32 flex-shrink-0 text-center">
              <img
                src={
                  actor.profile_path
                    ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                    : "/assets/no-poster.png"
                }
                alt={actor.name}
                className="w-32 h-48 object-cover rounded-lg mx-auto"
              />
              <p className="font-semibold mt-1 text-neutral">{actor.name}</p>
              <p className="text-sm text-gray-500">{actor.character}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MovieDetail;
