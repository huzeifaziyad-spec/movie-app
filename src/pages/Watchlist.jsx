import React, { useEffect, useState } from "react";
import { getWatchlist } from "../appwrite";
import MovieCards from "../components/MovieCards";
import Spinner from "../components/Spinner";
import { Link } from "react-router-dom";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      setIsLoading(true);
      const movies = await getWatchlist();
      setWatchlist(movies);
      setIsLoading(false);
    };

    fetchWatchlist();
  }, []);

  return (
    <main className="bg-[#000000] min-h-screen text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mt-10 mb-12">
          <Link to="/" className="text-gray-400 hover:text-white flex items-center gap-2 mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-2 h-10 bg-orange-500 rounded-full"></div>
            <h1 className="!text-left !mx-0 !text-5xl !text-white">My Watchlist</h1>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-32 text-gray-400">
            <div className="relative mb-6">
              <svg className="w-24 h-24 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <div className="absolute -top-2 -right-2 bg-orange-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold animate-pulse">0</div>
            </div>
            <p className="text-2xl font-bold text-white mb-2">Your watchlist is empty</p>
            <p className="text-gray-500 mb-8 text-center max-w-xs">Looks like you haven't added any movies to your watchlist yet.</p>
            <Link to="/" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-orange-500/20">
              Discover Movies
            </Link>
          </div>
        ) : (
          <section className="all-movies pb-20">
            <ul>
              {watchlist.map((movie) => (
                <li key={movie.$id}>
                  <MovieCards
                    movie={{
                      id: movie.movie_id,
                      title: movie.title,
                      poster_path: movie.poster_url?.replace("https://image.tmdb.org/t/p/w500", ""),
                      vote_average: movie.vote_average,
                      release_date: movie.release_date,
                    }}
                    isFavorite={true}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
};

export default Watchlist;
