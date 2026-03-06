import { Link } from "react-router-dom";

const MovieCards = ({
  movie: { id, title, poster_path, release_date, vote_average, original_language },
}) => {
  return (
    <Link to={`/movie/${id}`}>
      <div className="movie-card hover:scale-105 transition-transform duration-300 cursor-pointer">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "/assets/no-poster.png"
          }
          alt={title}
          className="rounded-lg shadow-md"
        />
        <h3 className="mt-2 font-semibold">{title}</h3>
        <div className="content flex justify-between items-center text-sm mt-1">
          <div className="rating flex items-center gap-1">
            <img src="/assets/star.svg" alt="Star" className="w-4 h-4" />
            <span>{vote_average ? vote_average.toFixed(1) : "N/A"}</span>
          </div>
          <span>{release_date ? release_date.slice(0, 4) : "N/A"}</span>
          <span>{original_language ? original_language.toUpperCase() : "N/A"}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCards;
