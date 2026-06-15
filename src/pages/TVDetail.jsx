import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MovieCards from "../components/MovieCards";
import Spinner from "../components/Spinner";
import { addToWatchlist, removeFromWatchlist, checkIfInWatchlist } from "../appwrite";
import { fetchFromTMDB } from "../lib/tmdb";
import TrailerModal from "../components/TrailerModal";

const TVDetail = () => {
  const { id } = useParams();
  const [tv, setTv] = useState(null);
  const [cast, setCast] = useState([]);
  const [relatedTV, setRelatedTV] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [activeServer, setActiveServer] = useState("vidsrc_to");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [youtubeKey, setYoutubeKey] = useState("");
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  const handleWatchTrailer = async () => {
    setIsLoadingTrailer(true);
    try {
      const data = await fetchFromTMDB(`/tv/${id}/videos`);
      const trailer = data.results?.find(
        (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
      ) || data.results?.find((v) => v.site === "YouTube");
      
      if (trailer) {
        setYoutubeKey(trailer.key);
        setIsModalOpen(true);
      } else {
        alert("Trailer not found for this TV show.");
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  const handleNextEpisode = () => {
    if (activeEpisode < episodes.length) {
      setActiveEpisode(prev => prev + 1);
    } else {
      const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
      if (currentSeasonIndex !== -1 && currentSeasonIndex < seasons.length - 1) {
        const nextSeasonNum = seasons[currentSeasonIndex + 1].season_number;
        setSelectedSeason(nextSeasonNum);
        setActiveEpisode(1);
      }
    }
  };

  const handlePrevEpisode = () => {
    if (activeEpisode > 1) {
      setActiveEpisode(prev => prev - 1);
    } else {
      const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
      if (currentSeasonIndex > 0) {
        const prevSeason = seasons[currentSeasonIndex - 1];
        setSelectedSeason(prevSeason.season_number);
        setActiveEpisode(prevSeason.episode_count || 1);
      }
    }
  };

  // Fetch TV Details, Cast, and Recommendations
  useEffect(() => {
    const fetchAllDetails = async () => {
      setIsLoading(true);
      try {
        const [tvData, castData, relatedData, watchlistStatus] = await Promise.all([
          fetchFromTMDB(`/tv/${id}?language=en-US`),
          fetchFromTMDB(`/tv/${id}/credits`),
          fetchFromTMDB(`/tv/${id}/recommendations`),
          checkIfInWatchlist(`tv-${id}`)
        ]);

        setTv(tvData);
        setCast((castData.cast || []).slice(0, 12));
        setRelatedTV(relatedData.results || []);
        setIsInWatchlist(watchlistStatus);

        // Filter and set valid seasons (exclude specials / season 0 if possible, but keep fallback)
        const validSeasons = (tvData.seasons || []).filter(s => s.season_number > 0);
        const finalSeasons = validSeasons.length > 0 ? validSeasons : tvData.seasons || [];
        setSeasons(finalSeasons);
        
        if (finalSeasons.length > 0) {
          setSelectedSeason(finalSeasons[0].season_number);
        }
      } catch (error) {
        console.error("Error fetching TV details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllDetails();
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch episodes when selectedSeason changes
  useEffect(() => {
    if (!tv) return;
    
    const fetchEpisodes = async () => {
      setIsLoadingEpisodes(true);
      try {
        const seasonData = await fetchFromTMDB(`/tv/${id}/season/${selectedSeason}`);
        setEpisodes(seasonData.episodes || []);
      } catch (error) {
        console.error(`Error fetching episodes for season ${selectedSeason}:`, error);
        setEpisodes([]);
      } finally {
        setIsLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [id, selectedSeason, tv]);

  const toggleWatchlist = async () => {
    try {
      const watchlistId = `tv-${tv.id}`;
      if (isInWatchlist) {
        await removeFromWatchlist(watchlistId);
        setIsInWatchlist(false);
      } else {
        const tvObj = {
          id: watchlistId,
          title: tv.name,
          poster_path: tv.poster_path,
          vote_average: tv.vote_average,
          release_date: tv.first_air_date
        };
        await addToWatchlist(tvObj);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
    }
  };

  const handleEpisodeSelect = (episodeNum) => {
    setActiveEpisode(episodeNum);
    document.getElementById('player-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) return <Spinner fullPage />;
  if (!tv) return <p className="text-center py-20 text-red-500">TV Show not found</p>;

  return (
    <div className="movie-detail p-4 relative min-h-screen bg-primary text-white">
      {/* Backdrop Image */}
      {tv.backdrop_path && (
        <div className="absolute top-0 left-0 w-full h-[600px] z-0">
          <img
            src={`https://image.tmdb.org/t/p/original${tv.backdrop_path}`}
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
            src={
              tv.poster_path
                ? `https://image.tmdb.org/t/p/w500${tv.poster_path}`
                : "/assets/no-poster.png"
            }
            alt={tv.name}
            className="w-48 md:w-60 rounded-xl shadow-2xl border-4 border-white/10 md:mt-[-165px]"
          />
        </div>

        {/* Right Side: Details */}
        <div className="text-center md:text-left flex-1 md:mt-[-145px]">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight shadow-black drop-shadow-lg">{tv.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 text-sm md:text-base font-medium text-gray-400 mb-4">
            {tv.genres?.map((genre) => (
              <span key={genre.id} className="bg-white/10 text-red-400 px-2 py-0.5 rounded text-xs">
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-sm md:text-base text-gray-300 leading-relaxed mb-6">{tv.overview}</p>

          {/* Quick Stats Grid with Circular Gauge */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8 max-w-2xl bg-white/5 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="stroke-white/10"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    className="stroke-orange-500 transition-all duration-1000"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 20}
                    strokeDashoffset={2 * Math.PI * 20 - (Math.round((tv.vote_average || 0) * 10) / 100) * (2 * Math.PI * 20)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-white">
                  {tv.vote_average?.toFixed(1)}
                </span>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider leading-none mb-0.5">Rating</p>
                <p className="text-[10px] text-gray-500 font-medium leading-none">{tv.vote_count} votes</p>
              </div>
            </div>

            <div className="flex flex-col justify-center border-l border-white/10 pl-4">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider leading-none mb-1">Seasons / Episodes</p>
              <p className="text-xs text-white font-bold leading-none">{tv.number_of_seasons} S / {tv.number_of_episodes} E</p>
            </div>

            <div className="flex flex-col justify-center border-l border-white/10 pl-4">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider leading-none mb-1">First Aired</p>
              <p className="text-xs text-white font-bold leading-none">{tv.first_air_date ? new Date(tv.first_air_date).getFullYear() : "N/A"}</p>
            </div>

            <div className="flex flex-col justify-center border-l border-white/10 pl-4">
              <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider leading-none mb-1">Network</p>
              <p className="text-xs text-white font-bold leading-none line-clamp-1">{tv.networks?.[0]?.name || "N/A"}</p>
            </div>
          </div>

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
              onClick={handleWatchTrailer}
              disabled={isLoadingTrailer}
              className="border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-md font-bold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {isLoadingTrailer ? "Loading..." : "Trailer"}
            </button>

            <button
              onClick={toggleWatchlist}
              className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-all duration-300 ${isInWatchlist
                ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                : 'bg-transparent border border-gray-600 hover:bg-white/10 text-white'
                }`}
            >
              {isInWatchlist ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
              )}
              {isInWatchlist ? "In Watchlist" : "Watchlist"}
            </button>
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
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Embedded Player Section */}
      <section id="player-section" className="mt-20 mb-10 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              Watch Now 
              <span className="text-sm bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-md border border-orange-500/30">
                S{selectedSeason} E{activeEpisode}
              </span>
            </h2>
            {/* Quick Episode Navigator */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5">
              <button
                onClick={handlePrevEpisode}
                disabled={activeEpisode === 1 && seasons.findIndex(s => s.season_number === selectedSeason) === 0}
                className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                &larr; Prev
              </button>
              <div className="w-[1px] h-4 bg-white/15" />
              <button
                onClick={handleNextEpisode}
                disabled={activeEpisode === episodes.length && seasons.findIndex(s => s.season_number === selectedSeason) === seasons.length - 1}
                className="px-3 py-1 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Select Server:</span>
            <select
              value={activeServer}
              onChange={(e) => setActiveServer(e.target.value)}
              className="bg-gray-800 border border-white/10 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="vidsrc_to">Server 1 (VidSrc.to)</option>
              <option value="vidsrc_cc">Server 2 (VidSrc.cc)</option>
              <option value="embed_su">Server 3 (Embed.su)</option>
              <option value="vidsrc_pro">Server 4 (VidSrc.pro)</option>
              <option value="vidsrc_me">Server 5 (VidSrc.me)</option>
            </select>
          </div>
        </div>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black/50">
          <iframe
            src={
              activeServer === "vidsrc_to"
                ? `https://vidsrc.to/embed/tv/${tv.id}/${selectedSeason}/${activeEpisode}`
                : activeServer === "vidsrc_cc"
                ? `https://vidsrc.cc/v2/embed/tv/${tv.id}/${selectedSeason}/${activeEpisode}`
                : activeServer === "embed_su"
                ? `https://embed.su/embed/tv/${tv.id}/${selectedSeason}/${activeEpisode}`
                : activeServer === "vidsrc_pro"
                ? `https://vidsrc.pro/embed/tv/${tv.id}/${selectedSeason}/${activeEpisode}`
                : `https://vidsrc.me/embed/tv?tmdb=${tv.id}&season=${selectedSeason}&episode=${activeEpisode}`
            }
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            title="TV Show Player"
            className="absolute top-0 left-0 w-full h-full"
          ></iframe>
        </div>
      </section>

      {/* Season and Episode Selector */}
      <section className="mt-16 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold">Episodes</h2>
          
          {/* Season Dropdown */}
          <div className="flex items-center gap-2 self-end">
            <span className="text-sm text-gray-400">Season:</span>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(Number(e.target.value));
                setActiveEpisode(1);
              }}
              className="bg-gray-800 border border-white/10 text-white rounded-md px-4 py-2 text-sm focus:outline-none focus:border-orange-500 cursor-pointer font-bold"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.season_number}>
                  {s.name || `Season ${s.season_number}`} ({s.episode_count} Episodes)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Episodes Grid */}
        {isLoadingEpisodes ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {episodes.map((episode) => {
              const isActive = episode.episode_number === activeEpisode;
              return (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeSelect(episode.episode_number)}
                  className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5"
                      : "bg-dark-100/40 border-white/5 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {/* Episode Thumbnail */}
                  <div className="w-28 sm:w-32 aspect-video bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <img
                      src={
                        episode.still_path
                          ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                          : tv.backdrop_path
                          ? `https://image.tmdb.org/t/p/w300${tv.backdrop_path}`
                          : "/assets/no-poster.png"
                      }
                      alt={episode.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>

                  {/* Episode Info */}
                  <div className="flex flex-col flex-grow min-w-0">
                    <span className="text-xs font-bold text-orange-500 mb-1">
                      Episode {episode.episode_number}
                    </span>
                    <h3 className={`text-sm font-bold line-clamp-1 mb-1 transition-colors ${isActive ? "text-orange-400" : "text-white"}`}>
                      {episode.name}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {episode.overview || "No description available for this episode."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Related TV Shows Section */}
      {relatedTV.length > 0 && (
        <section className="mt-20">
          <h2 className="text-xl font-bold mb-6">Related TV Shows</h2>
          <div className="flex overflow-x-auto gap-6 pb-5 hide-scrollbar snap-x">
            {relatedTV.map((relatedItem) => (
              <div key={relatedItem.id} className="w-[200px] flex-shrink-0 snap-start">
                <MovieCards movie={relatedItem} mediaType="tv" />
              </div>
            ))}
          </div>
        </section>
      )}
      <TrailerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        youtubeKey={youtubeKey}
      />
    </div>
  );
};

export default TVDetail;
