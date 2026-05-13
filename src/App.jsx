import Search from "./components/Search";
import { useEffect, useState } from "react";
import Spinner from "./components/Spinner";
import MovieCards from "./components/MovieCards";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";
import { Link } from "react-router-dom";
import HeroSlider from "./components/HeroSlider";
import Categories from "./components/Categories";
import { fetchFromTMDB, genreMap } from "./lib/tmdb";

const App = () => {
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
    sessionStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem("selectedGenre", selectedGenre);
  }, [selectedGenre]);

  useEffect(() => {
    sessionStorage.setItem("selectedCategory", selectedCategory);
  }, [selectedCategory]);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "", genre = "", category = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      let endpoint = "";
      if (query) {
        endpoint = `/search/movie?query=${encodeURIComponent(query)}`;
      } else if (category === "Popular") {
        endpoint = `/movie/popular`;
      } else if (category === "Premieres") {
        endpoint = `/movie/upcoming`;
      } else if (category === "Recently Added") {
        endpoint = `/movie/now_playing`;
      } else if (genre && genreMap[genre]) {
        endpoint = `/discover/movie?with_genres=${genreMap[genre]}&sort_by=popularity.desc`;
      } else {
        endpoint = `/discover/movie?sort_by=popularity.desc`;
      }

      const data = await fetchFromTMDB(endpoint);
      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error Fetching the movies: ${error}`);
      setErrorMessage(error.message || "Failed to load movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [trending, newest] = await Promise.all([
        getTrendingMovies(),
        fetchFromTMDB('/movie/now_playing?language=en-US&page=1')
      ]);
      
      setTrendingMovies(trending);
      if (newest.results) {
        setNewestMovies(newest.results.slice(0, 6));
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, selectedGenre, selectedCategory);
  }, [debouncedSearchTerm, selectedGenre, selectedCategory]);

  useEffect(() => {
    loadInitialData();
  }, []);

  return (
    <main>
      <HeroSlider movies={newestMovies} />

      <div className="wrapper">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/30">
              <span className="text-white font-black text-2xl italic">M</span>
            </div>
            <h1 className="!text-left !mx-0 !text-3xl tracking-tighter hidden sm:block">MovieBox</h1>
          </div>
          <Link to="/watchlist" className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group">
            <svg className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
            <span className="font-bold text-sm text-white">My Watchlist</span>
          </Link>
        </header>

        {/* passing trending movie */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2 className="mb-8">Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <Link to={`/movie/${movie.movie_id}`} className="flex flex-row items-center">
                    <p className="fancy-text">{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </Link>
                </li>
              ))}
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
                  <MovieCards movie={movie} key={movie.id} />
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
