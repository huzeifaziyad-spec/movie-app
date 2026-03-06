import Search from "./components/Search";
import { useEffect, useState } from "react";
import Spinner from "./components/Spinner";
import MovieCards from "./components/MovieCards";
import { useDebounce } from "react-use";
import { updateSearchCount, getTrendingMovies } from "./appwrite.js";
import { Link } from "react-router-dom";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};
const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [newestMovies, setNewestMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Create a debounced version of searchTerm.
  // It updates 500ms after the user stops typing
  // to prevent making too many API requests.
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 1000, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Error Fetching the movies");
      }
      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "No movies found");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

      setErrorMessage("");
    } catch (error) {
      console.log(`Error Fetching the movies: ${error}`);
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
      const response = await fetch(`${API_BASE_URL}/movie/now_playing?language=en-US&page=1`, API_OPTIONS);
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setNewestMovies(data.results.slice(0, 3)); // only first 3 movies
      }
    } catch (error) {
      console.log("Error fetching newest movies:", error);
    }
  };

  // This effect runs whenever the debouncedSearchTerm changes.
  // It calls fetchMovies to get updated movie results
  // after the user stops typing (debounced value).
  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    fetchNewestMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          {newestMovies.length > 0 ? (
            <div className="flex gap-5 w-full max-w-lg mx-auto mb-10 justify-center">
              {newestMovies.map((movie) => (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="relative group overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer flex-1"
                >
                  <img
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/no-movie.png"
                    }
                    alt={movie.title}
                    className="w-full h-auto object-cover"
                  />
                </Link>
              ))}
            </div>
          ) : (
            <img  />
          )}
          <h1 className="mt-8">
            Find <span className="text-boxed">Movies</span> you'll enjoy
            without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>
        {/* passing trending movie */}
        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2 className="">Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <Link to={`/movie/${movie.movie_id}`} className="flex flex-row items-center">
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.title} />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2 className="">All Movies</h2>
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
