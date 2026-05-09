import { Link } from "react-router-dom";

const MovieCards = ({
  movie: { id, title, poster_path, release_date, vote_average, original_language },
}) => {
  return (
    <Link to={`/movie/${id}`}>
      <div className="movie-card transition-all duration-300">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "/assets/no-poster.png"
          }
          alt={title}
        />
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="/assets/star.svg" alt="Star" />
            <p>{vote_average ? vote_average.toFixed(1) : "N/A"}</p>
          </div>
          <span>{release_date ? release_date.slice(0, 4) : "N/A"}</span>
          <span>{original_language ? original_language.toUpperCase() : "N/A"}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCards;
