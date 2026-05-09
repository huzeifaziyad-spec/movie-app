const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full max-w-3xl mx-auto mt-12 group">
      {/* Animated Neon Glow Backdrop */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
      
      {/* Search Input Container */}
      <div className="relative bg-[#050510] rounded-2xl flex items-center p-1.5 shadow-2xl">
        <input
          type="text"
          placeholder="Search...."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-white placeholder-gray-300 outline-none px-5 py-3 text-lg font-medium tracking-wide"
        />
        
        {/* Search Icon Button */}
        <button className="flex-shrink-0 bg-[#0a0a20] border border-indigo-500/50 p-3.5 rounded-xl ml-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-indigo-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Search;
