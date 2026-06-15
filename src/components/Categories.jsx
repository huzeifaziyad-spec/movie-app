import React from 'react';

const movieGenres = [
  "Action", "Adventure", "Animation", "Biography", "Crime", "Comedy", "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery", "Romance", "Science Fiction", "TV Movie", "Thriller", "War", "Western"
];

const tvGenres = [
  "Action & Adventure", "Animation", "Comedy", "Crime", "Documentary", "Drama", "Family", "Kids", "Mystery", "News", "Reality", "Sci-Fi & Fantasy", "Soap", "Talk", "War & Politics", "Western"
];

const Categories = ({ selectedGenre, onGenreChange, selectedCategory, onCategoryChange, mediaType = "movie" }) => {
  const genres = mediaType === "movie" ? movieGenres : tvGenres;

  return (
    <div className="categories-container">
      {/* Header Row */}
      <div className="categories-header">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <h2 className="text-2xl font-bold text-white tracking-tight">Trends Now</h2>
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-5 ml-[-10px]"></div>
        </div>

        <div className="hidden md:flex items-center gap-10 font-medium text-sm">
          <button
            onClick={() => onCategoryChange('Popular')}
            className={`category-btn flex items-center gap-2 hover:text-white transition-colors ${selectedCategory === 'Popular' ? 'active' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.450.385c-.39.23-.75.438-1.071.621l-.01.006-.003.001a1 1 0 00.998 1.734l.012-.007.017-.01c.299-.17.618-.352.946-.546l.006-.004c-.31.393-.615.828-.88 1.282l-.013.023a1 1 0 101.724.996l.006-.01c.365-.632.793-1.258 1.246-1.83a1 1 0 00-.546-1.545l-.017-.01-.017-.01a1.003 1.003 0 00-.998-1.734l.017.01zm-3.23 4.195a1 1 0 00-1.450.385c-.39.23-.75.438-1.071.621l-.01.006-.003.001a1 1 0 00.998 1.734l.012-.007.017-.01c.299-.17.618-.352.946-.546l.006-.004c-.31.393-.615.828-.88 1.282l-.013.023a1 1 0 101.724.996l.006-.01c.365-.632.793-1.258 1.246-1.83a1 1 0 00-.546-1.545l-.017-.01-.017-.01a1.003 1.003 0 00-.998-1.734l.017.01z" />
            </svg>
            Popular
          </button>
          <button
            onClick={() => onCategoryChange('Premieres')}
            className={`category-btn flex items-center gap-2 hover:text-white transition-colors ${selectedCategory === 'Premieres' ? 'active' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {mediaType === "movie" ? "Premieres" : "On The Air"}
          </button>
          <button
            onClick={() => onCategoryChange('Recently Added')}
            className={`category-btn flex items-center gap-2 hover:text-white transition-colors ${selectedCategory === 'Recently Added' ? 'active' : 'text-gray-400'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {mediaType === "movie" ? "Recently Added" : "Airing Today"}
          </button>
        </div>
      </div>

      <div className="border-b border-white/5 w-full my-6"></div>

      {/* Genres Pills */}
      <div className="genres-list flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => onGenreChange(genre)}
            className={`genre-pill ${selectedGenre === genre ? 'active' : ''}`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;
