import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MovieCards from "../components/MovieCards";
import Spinner from "../components/Spinner";
import { addToWatchlist, removeFromWatchlist, checkIfInWatchlist } from "../appwrite";
import TrailerModal from "../components/TrailerModal";

import { fetchFromTMDB } from "../lib/tmdb";

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [activeServer, setActiveServer] = useState("vidsrc_to");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [youtubeKey, setYoutubeKey] = useState("");
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  const formatRuntime = (mins) => {
    if (!mins) return "N/A";
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return hrs > 0 ? `${hrs}h ${remMins}m` : `${remMins}m`;
  };

  const handleWatchTrailer = async () => {
    setIsLoadingTrailer(true);
    try {
      const data = await fetchFromTMDB(`/movie/${movie.id}/videos`);
      const trailer = data.results?.find(
        (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
      ) || data.results?.find((v) => v.site === "YouTube");
      
      if (trailer) {
        setYoutubeKey(trailer.key);
        setIsModalOpen(true);
      } else {
        alert("Trailer not found for this movie.");
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  useEffect(() => {
    const fetchAllDetails = async () => {
      setIsLoading(true);
      try {
        const [movieData, castData, relatedData, watchlistStatus] = await Promise.all([
          fetchFromTMDB(`/movie/${id}?language=en-US`),
          fetchFromTMDB(`/movie/${id}/credits`),
          fetchFromTMDB(`/movie/${id}/recommendations`),
          checkIfInWatchlist(id)
        ]);

        setMovie(movieData);
        setCast((castData.cast || []).slice(0, 12));
        setRelatedMovies(relatedData.results || []);
        setIsInWatchlist(watchlistStatus);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDetails();
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

  if (isLoading) return <Spinner fullPage />;
  if (!movie) return <p>Movie not found</p>;

  const score = movie.vote_average || 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dash = (score / 10) * circumference;

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">

      {/* ─── Full-bleed Cinematic Backdrop ─── */}
      <div className="absolute inset-0 h-[110vh] z-0 pointer-events-none">
        {movie.backdrop_path && (
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt="backdrop"
            className="w-full h-full object-cover object-top"
            style={{ opacity: 0.35 }}
          />
        )}
        {/* vignette stack */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/70 to-transparent h-32" />
      </div>

      {/* ─── Hero Content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-16">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-end md:items-end">

          {/* Poster */}
          <div className="flex-shrink-0 self-center md:self-end">
            <div className="relative group">
              {/* glow ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-orange-500/40 via-red-500/20 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img
                src={
                  movie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : "/assets/no-poster.png"
                }
                alt={movie.title}
                className="relative w-44 md:w-56 lg:w-64 rounded-2xl shadow-[0_32px_80px_-12px_rgba(0,0,0,0.9)] border border-white/10 transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-5">

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {movie.genres?.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase border border-orange-500/40 text-orange-400 bg-orange-500/10"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight"
              style={{
                fontFamily: '"Bebas Neue", "Funnel Display", sans-serif',
                textShadow: '0 0 80px rgba(255,140,0,0.15)',
              }}
            >
              {movie.title}
            </h1>

            {/* Tagline */}
            {movie.tagline && (
              <p className="text-sm md:text-base text-orange-300/70 italic font-medium tracking-wide -mt-1">
                "{movie.tagline}"
              </p>
            )}

            {/* Overview */}
            <p className="text-sm md:text-[15px] text-gray-400 leading-relaxed max-w-2xl line-clamp-4">
              {movie.overview}
            </p>

            {/* ─── Inline Stats Row ─── */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-1">

              {/* Circular score gauge */}
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                    <circle
                      cx="28" cy="28" r={radius} fill="none"
                      stroke={score >= 7 ? "#f97316" : score >= 5 ? "#eab308" : "#ef4444"}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - dash}
                      style={{ transition: "stroke-dashoffset 1s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Score</span>
                  <span className="text-xs text-gray-400">{movie.vote_count?.toLocaleString()} votes</span>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              {/* Runtime */}
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Runtime</span>
                <span className="text-sm font-bold text-white">{formatRuntime(movie.runtime)}</span>
              </div>

              <div className="w-px h-8 bg-white/10 hidden sm:block" />

              {/* Year */}
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Year</span>
                <span className="text-sm font-bold text-white">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A"}
                </span>
              </div>

              {(movie.budget > 0 || movie.revenue > 0) && (
                <>
                  <div className="w-px h-8 bg-white/10 hidden sm:block" />
                  <div className="flex flex-col">
                    <span className="text-[11px] uppercase tracking-widest text-gray-500 font-bold">Box Office</span>
                    <span className="text-sm font-bold text-white">
                      {movie.budget > 0 ? `$${(movie.budget / 1e6).toFixed(0)}M` : "—"}
                      <span className="text-gray-500 font-normal mx-1">/</span>
                      {movie.revenue > 0 ? `$${(movie.revenue / 1e6).toFixed(0)}M` : "—"}
                    </span>
                  </div>
                </>
              )}

              {/* Status badge */}
              {movie.status && (
                <span className="ml-auto text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/30 text-green-400 bg-green-500/10">
                  {movie.status}
                </span>
              )}
            </div>

            {/* ─── Action Buttons ─── */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {/* Play */}
              <button
                onClick={() => document.getElementById("player-section")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-2.5 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold px-7 py-3 rounded-full shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_40px_rgba(249,115,22,0.6)] transition-all duration-300 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Now
              </button>

              {/* Trailer */}
              <button
                onClick={handleWatchTrailer}
                disabled={isLoadingTrailer}
                className="flex items-center gap-2.5 bg-white/8 hover:bg-white/15 active:scale-95 border border-white/15 text-white font-bold px-7 py-3 rounded-full backdrop-blur-md transition-all duration-300 disabled:opacity-50 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-400">
                  <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z" />
                </svg>
                {isLoadingTrailer ? "Loading…" : "Trailer"}
              </button>

              {/* Watchlist */}
              <button
                onClick={toggleWatchlist}
                className={`flex items-center gap-2.5 font-bold px-7 py-3 rounded-full border active:scale-95 transition-all duration-300 cursor-pointer ${
                  isInWatchlist
                    ? "bg-orange-500/20 border-orange-500/60 text-orange-300 shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                    : "bg-white/5 border-white/15 text-gray-300 hover:bg-white/12 hover:text-white"
                }`}
              >
                {isInWatchlist ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                  </svg>
                )}
                {isInWatchlist ? "Saved" : "Watchlist"}
              </button>

              {/* Download icon */}
              <a
                href={`https://vidvault.ru/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Download"
                className="flex items-center justify-center w-12 h-12 rounded-full border border-white/15 bg-white/5 hover:bg-white/12 text-gray-400 hover:text-white active:scale-95 transition-all duration-300"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ─── Main Content Below Hero ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20">

        {/* Cast */}
        <section className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full bg-orange-500" />
            <h2 className="text-xl font-bold tracking-tight">Cast</h2>
          </div>
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4 hide-scrollbar snap-x">
            {cast.map((actor) => (
              <Link
                key={actor.cast_id || actor.credit_id}
                to={`/person/${actor.id}`}
                className="flex items-center gap-3 w-[240px] sm:w-auto flex-shrink-0 snap-start bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 p-3 rounded-xl transition-all duration-300 group"
              >
                <img
                  src={actor.profile_path ? `https://image.tmdb.org/t/p/w200${actor.profile_path}` : "/assets/no-poster.png"}
                  alt={actor.name}
                  className="w-12 h-12 object-cover rounded-full border-2 border-transparent group-hover:border-orange-500/60 transition-colors flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-bold text-white text-sm line-clamp-1 group-hover:text-orange-400 transition-colors">{actor.name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{actor.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Player */}
        <section id="player-section" className="mt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-orange-500" />
              <h2 className="text-xl font-bold tracking-tight">Watch Now</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Server</span>
              <select
                value={activeServer}
                onChange={(e) => setActiveServer(e.target.value)}
                className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 cursor-pointer transition-colors"
              >
                <option value="vidsrc_to">VidSrc.to</option>
                <option value="vidsrc_cc">VidSrc.cc</option>
                <option value="embed_su">Embed.su</option>
                <option value="vidsrc_pro">VidSrc.pro</option>
                <option value="vidsrc_me">VidSrc.me</option>
              </select>
            </div>
          </div>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.9)] border border-white/8 bg-black">
            <iframe
              src={
                activeServer === "vidsrc_to"
                  ? `https://vidsrc.to/embed/movie/${movie.imdb_id || movie.id}`
                  : activeServer === "vidsrc_cc"
                  ? `https://vidsrc.cc/v2/embed/movie/${movie.imdb_id || movie.id}`
                  : activeServer === "embed_su"
                  ? `https://embed.su/embed/movie/${movie.imdb_id || movie.id}`
                  : activeServer === "vidsrc_pro"
                  ? `https://vidsrc.pro/embed/movie/${movie.imdb_id || movie.id}`
                  : movie.imdb_id
                  ? `https://vidsrc.me/embed/movie?imdb=${movie.imdb_id}`
                  : `https://vidsrc.me/embed/movie?tmdb=${movie.id}`
              }
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allowFullScreen
              title="Movie Player"
            />
          </div>
        </section>

        {/* Related */}
        {relatedMovies.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 rounded-full bg-orange-500" />
              <h2 className="text-xl font-bold tracking-tight">More Like This</h2>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
              {relatedMovies.map((r) => (
                <div key={r.id} className="w-[180px] flex-shrink-0 snap-start">
                  <MovieCards movie={r} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <TrailerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} youtubeKey={youtubeKey} />
    </div>
  );
};

export default MovieDetail;

