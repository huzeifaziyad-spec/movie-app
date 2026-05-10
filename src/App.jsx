import Search from "./components/Search";
import { useEffect, useState } from "react";
import Spinner from "./components/Spinner";
import MovieCards from "./components/MovieCards";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";
import { Link } from "react-router-dom";
import HeroSlider from "./components/HeroSlider";
import Categories from "./components/Categories";

const genreMap = {
  "Action": 28, "Adventure": 12, "Animation": 16, "Biography": 1, "Crime": 80, "Comedy": 35, "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "History": 36, "Horror": 27, "Music": 10402, "Mystery": 9648, "Romance": 10749, "Science Fiction": 878, "TV Movie": 10770, "Thriller": 53, "War": 10752, "Western": 37
};

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newestMovies, setNewestMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Popular");
  // Create a debounced version of searchTerm.
  // It updates 500ms after the user stops typing
  // to prevent making too many API requests.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const fetchMovies = async (query = "", genre = "", category = "") => {
    setIsLoading(true);
    setErrorMessage("");

    if (!API_KEY) {
      setErrorMessage("TMDB API Key is missing. Please check your environment variables.");
      setIsLoading(false);
      return;
    }

    try {
      let endpoint = "";
      if (query) {
        endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${API_KEY}`;
      } else if (category === "Popular") {
        endpoint = `${API_BASE_URL}/movie/popular?api_key=${API_KEY}`;
      } else if (category === "Premieres") {
        endpoint = `${API_BASE_URL}/movie/upcoming?api_key=${API_KEY}`;
      } else if (category === "Recently Added") {
        endpoint = `${API_BASE_URL}/movie/now_playing?api_key=${API_KEY}`;
      } else if (genre && genreMap[genre]) {
        endpoint = `${API_BASE_URL}/discover/movie?with_genres=${genreMap[genre]}&sort_by=popularity.desc&api_key=${API_KEY}`;
      } else {
        endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
      }

      const response = await fetch(endpoint);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status_message || "Error Fetching the movies");
      }
      const data = await response.json();

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error Fetching the movies: ${error}`);
      setErrorMessage(error.message || "Failed to load movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.log("Error fetching trending movies:", error);
    }
  };

  const fetchNewestMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/movie/now_playing?language=en-US&page=1&api_key=${API_KEY}`);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setNewestMovies(data.results.slice(0, 6)); // top 6 for slider
      }
    } catch (error) {
      console.log("Error fetching newest movies:", error);
    }
  };

  // This effect runs whenever the debouncedSearchTerm, selectedGenre or selectedCategory changes.
  useEffect(() => {
    fetchMovies(debouncedSearchTerm, selectedGenre, selectedCategory);
  }, [debouncedSearchTerm, selectedGenre, selectedCategory]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    fetchNewestMovies();
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
