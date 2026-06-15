import Search from "./components/Search";
import { useEffect, useState } from "react";
import Spinner from "./components/Spinner";
import MovieCards from "./components/MovieCards";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";
import { Link } from "react-router-dom";
import HeroSlider from "./components/HeroSlider";
import Categories from "./components/Categories";
import { fetchFromTMDB, movieGenreMap, tvGenreMap } from "./lib/tmdb";

const formatTitle = (str) => {
  if (!str) return "—";
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const App = () => {
  const [mediaType, setMediaType] = useState(() => sessionStorage.getItem("mediaType") || "movie");
  const [searchTerm, setSearchTerm] = useState(() => sessionStorage.getItem("searchTerm") || "");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newestMovies, setNewestMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(() => sessionStorage.getItem("selectedGenre") || "");
  const [selectedCategory, setSelectedCategory] = useState(() => sessionStorage.getItem("selectedCategory") || "Popular");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    sessionStorage.setItem("mediaType", mediaType);
  }, [mediaType]);

  useEffect(() => {
    sessionStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem("selectedGenre", selectedGenre);
  }, [selectedGenre]);

  useEffect(() => {
    sessionStorage.setItem("selectedCategory", selectedCategory);
  }, [selectedCategory]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMedia = async (query = "", genre = "", category = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      let endpoint = "";
      if (query) {
        endpoint = `/search/${mediaType}?query=${encodeURIComponent(query)}`;
      } else if (category === "Popular") {
        endpoint = `/${mediaType}/popular`;
      } else if (category === "Premieres") {
        endpoint = mediaType === "movie" ? `/movie/upcoming` : `/tv/on_the_air`;
      } else if (category === "Recently Added") {
        endpoint = mediaType === "movie" ? `/movie/now_playing` : `/tv/airing_today`;
      } else if (genre) {
        const currentGenreMap = mediaType === "movie" ? movieGenreMap : tvGenreMap;
        if (currentGenreMap[genre]) {
          endpoint = `/discover/${mediaType}?with_genres=${currentGenreMap[genre]}&sort_by=popularity.desc`;
        } else {
          endpoint = `/discover/${mediaType}?sort_by=popularity.desc`;
        }
      } else {
        endpoint = `/discover/${mediaType}?sort_by=popularity.desc`;
      }

      const data = await fetchFromTMDB(endpoint);
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        const item = data.results[0];
        const normalizedItem = {
          ...item,
          id: mediaType === "tv" ? `tv-${item.id}` : item.id
        };
        updateSearchCount(query, normalizedItem);
      }
    } catch (error) {
      console.error(`Error Fetching the media: ${error}`);
      setErrorMessage(error.message || `Failed to load ${mediaType === "movie" ? "movies" : "TV shows"}. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHeroData = async () => {
    try {
      const endpoint = mediaType === "movie"
        ? '/movie/now_playing?language=en-US&page=1'
        : '/tv/on_the_air?language=en-US&page=1';
      const newest = await fetchFromTMDB(endpoint);
      if (newest.results) {
        setNewestMovies(newest.results.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching hero data:", error);
    }
  };

  const loadTrendingData = async () => {
    try {
      const trending = await getTrendingMovies();
      setTrendingMovies(trending);
    } catch (error) {
      console.error("Error fetching trending searches:", error);
    }
  };

  useEffect(() => {
    fetchMedia(debouncedSearchTerm, selectedGenre, selectedCategory);
  }, [debouncedSearchTerm, selectedGenre, selectedCategory, mediaType]);

  useEffect(() => {
    loadHeroData();
  }, [mediaType]);

  useEffect(() => {
    loadTrendingData();
  }, []);

  return (
    <main>
      <HeroSlider movies={newestMovies} mediaType={mediaType} />

      <div className="wrapper">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6 md:gap-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-white font-black text-2xl italic">M</span>
              </div>
              <h1 className="!text-left !mx-0 !text-3xl tracking-tighter hidden sm:block">MovieBox</h1>
            </div>

            {/* Media Type Toggle */}
            <div className="flex gap-1.5 sm:gap-0 sm:bg-white/5 sm:p-1 sm:rounded-xl sm:border sm:border-white/10">
              <button
                onClick={() => {
                  setMediaType("movie");
                  setSelectedGenre("");
                  setSelectedCategory("Popular");
                  setSearchTerm("");
                }}
                title="Movies"
                className={`w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center sm:gap-1.5 sm:px-4 sm:py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex-shrink-0 ${
                  mediaType === "movie"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 text-gray-400 hover:text-white"
                }`}
              >
                {/* Film strip icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path fillRule="evenodd" d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625Zm1.5 0v1.5c0 .207.168.375.375.375h1.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-1.5A.375.375 0 0 0 3 5.625Zm16.125-.375a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0 0 21 7.125v-1.5a.375.375 0 0 0-.375-.375h-1.5ZM21 9.375A.375.375 0 0 0 20.625 9h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0 0 21 10.875v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0 0 21 14.625v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-1.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0 0 21 18.375v-1.5ZM3.375 9a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5A.375.375 0 0 0 4.875 10.875v-1.5A.375.375 0 0 0 4.5 9h-1.125Zm.375 3.375a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h1.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375H3.75Zm-.375 3.75c0-.207.168-.375.375-.375h1.5a.375.375 0 0 1 .375.375v1.5a.375.375 0 0 1-.375.375h-1.5a.375.375 0 0 1-.375-.375v-1.5ZM7.875 6a.75.75 0 0 0-.75.75v10.5c0 .414.336.75.75.75h8.25a.75.75 0 0 0 .75-.75V6.75a.75.75 0 0 0-.75-.75h-8.25Z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Movies</span>
              </button>
              <button
                onClick={() => {
                  setMediaType("tv");
                  setSelectedGenre("");
                  setSelectedCategory("Popular");
                  setSearchTerm("");
                }}
                title="TV Shows"
                className={`w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center sm:gap-1.5 sm:px-4 sm:py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex-shrink-0 ${
                  mediaType === "tv"
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "bg-white/5 sm:bg-transparent border border-white/10 sm:border-0 text-gray-400 hover:text-white"
                }`}
              >
                {/* TV monitor icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path d="M19.5 6h-15v9h15V6Z" />
                  <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v11.25C1.5 17.16 2.34 18 3.375 18H9.75v1.5H6A.75.75 0 0 0 6 21h12a.75.75 0 0 0 0-1.5h-3.75V18h6.375c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375Zm0 13.5h17.25a.375.375 0 0 0 .375-.375V4.875a.375.375 0 0 0-.375-.375H3.375A.375.375 0 0 0 3 4.875v11.25c0 .207.168.375.375.375Z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">TV Shows</span>
              </button>
            </div>
          </div>
          <Link
            to="/watchlist"
            className="w-10 h-10 sm:w-auto sm:h-auto flex items-center justify-center sm:gap-2 sm:px-6 sm:py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group flex-shrink-0"
            title="My Watchlist"
          >
            <svg className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="font-bold text-sm text-white hidden sm:inline">My Watchlist</span>
          </Link>
        </header>

        {/* Trending Searches */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <ul>
              {trendingMovies.map((movie, index) => {
                const isTv = String(movie.movie_id).startsWith("tv-");
                const cleanId = String(movie.movie_id).replace("tv-", "");
                const targetLink = isTv ? `/tv/${cleanId}` : `/movie/${cleanId}`;
                return (
                  <li key={movie.$id}>
                    <Link to={targetLink} className="flex flex-row items-center group">
                      <p className="fancy-text">{index + 1}</p>
                      <div className="relative">
                        <img
                          src={movie.poster_url}
                          alt={movie.title || "trending"}
                        />
                        {/* TV badge */}
                        {isTv && (
                          <span className="absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest bg-orange-500 text-white px-1.5 py-0.5 rounded-md z-20">
                            TV
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

        <Categories
          selectedGenre={selectedGenre}
          onGenreChange={(genre) => {
            setSelectedGenre(genre);
            setSelectedCategory("");
            setSearchTerm("");
          }}
          selectedCategory={selectedCategory}
          onCategoryChange={(category) => {
            setSelectedCategory(category);
            setSelectedGenre("");
            setSearchTerm("");
          }}
          mediaType={mediaType}
        />

        <section className="all-movies">
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <li key={movie.id}>
                  <MovieCards movie={movie} key={movie.id} mediaType={mediaType} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
