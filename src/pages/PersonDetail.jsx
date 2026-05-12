import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import MovieCards from "../components/MovieCards";
import Spinner from "../components/Spinner";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const PersonDetail = () => {
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [movies, setMovies] = useState([]);
  const [backdrop, setBackdrop] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        // Fetch person details
        const personRes = await fetch(`${API_BASE_URL}/person/${id}?api_key=${API_KEY}`);
        const personData = await personRes.json();
        setPerson(personData);

        // Fetch movie credits
        const creditsRes = await fetch(`${API_BASE_URL}/person/${id}/movie_credits?api_key=${API_KEY}`);
        const creditsData = await creditsRes.json();

        // Sort by popularity and filter out those without posters for a cleaner look
        const sortedMovies = (creditsData.cast || [])
          .sort((a, b) => b.popularity - a.popularity)
          .filter(movie => movie.poster_path);

        setMovies(sortedMovies);

        // Fetch tagged images for backdrop
        try {
          const imagesRes = await fetch(`${API_BASE_URL}/person/${id}/tagged_images?api_key=${API_KEY}`);
          const imagesData = await imagesRes.json();
          const foundBackdrop = imagesData.results?.find(img => img.image_type === 'backdrop')?.file_path;

          if (foundBackdrop) {
            setBackdrop(foundBackdrop);
          } else if (sortedMovies.length > 0) {
            // Fallback: Use backdrop of their most popular movie
            setBackdrop(sortedMovies[0].backdrop_path);
          }
        } catch (err) {
          if (sortedMovies.length > 0) {
            setBackdrop(sortedMovies[0].backdrop_path);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPersonData();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) return <Spinner fullPage />;

  if (!person) return (
    <div className="min-h-screen bg-[#000000] text-white p-10 flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">Person not found</h1>
      <Link to="/" className="text-red-500 hover:underline">Go back home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Image */}
      {backdrop && (
        <div className="absolute top-0 left-0 w-full h-[700px] z-0">
          <img
            src={`https://image.tmdb.org/t/p/original${backdrop}`}
            alt="Backdrop"
            className="w-full h-full object-cover opacity-30 grayscale blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/80 to-[#000000]" />
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Home
        </Link>

        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-shrink-0">
            <img
              src={person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : "/assets/no-poster.png"}
              alt={person.name}
              className="w-48 md:w-72 rounded-2xl shadow-2xl border-4 border-white/10 object-cover aspect-[2/3]"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 tracking-tighter text-white uppercase italic leading-none">{person.name}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] sm:text-xs md:text-sm font-bold text-red-500 mb-6 uppercase tracking-widest">
              <span className="bg-white/5 px-2 py-1 rounded">{person.known_for_department}</span>
              {person.place_of_birth && (
                <>
                  <span className="text-white/20 hidden sm:inline">•</span>
                  <span className="bg-white/5 px-2 py-1 rounded">{person.place_of_birth}</span>
                </>
              )}
            </div>
            {person.biography ? (
              <p className="text-gray-400 leading-relaxed max-w-4xl text-sm sm:text-base md:text-lg font-medium px-2 md:px-0">
                {person.biography}
              </p>
            ) : (
              <p className="text-gray-500 italic text-sm sm:text-base">No biography available for this person.</p>
            )}
          </div>
        </div>

        <section className="all-movies mt-20">
          <h2 className="text-3xl font-black mb-10 uppercase tracking-tight flex items-center gap-3">
            <span className="w-8 h-1 bg-red-600 rounded-full"></span>
            Top Performances
          </h2>
          <ul className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {movies.map((movie) => (
              <li key={movie.id} className="animate-in fade-in zoom-in duration-500">
                <MovieCards movie={movie} />
              </li>
            ))}
          </ul>
          {movies.length === 0 && (
            <p className="text-gray-500 text-center py-20 bg-white/5 rounded-2xl border border-white/5">
              No movies found for this person.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default PersonDetail;
