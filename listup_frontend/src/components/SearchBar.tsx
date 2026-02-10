"use client";
import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFilterStore } from "../store/useFilterStore";

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'location';
  icon: React.ReactNode;
}

export default function SearchBar() {
  const router = useRouter();
  const { search, setSearch } = useFilterStore();
  const [inputValue, setInputValue] = useState(search);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock search suggestions - in real app, these would come from API
  const [suggestions] = useState<SearchSuggestion[]>([
    { id: '1', text: 'iPhone 13', type: 'trending', icon: <TrendingUp size={16} /> },
    { id: '2', text: 'Samsung Galaxy', type: 'trending', icon: <TrendingUp size={16} /> },
    { id: '3', text: 'pefume', type: 'trending', icon: <TrendingUp size={16} /> },
    { id: '4', text: 'school gate', type: 'location', icon: <MapPin size={16} /> },
    { id: '5', text: 'iworoko', type: 'location', icon: <MapPin size={16} /> },
    { id: '6', text: 'Phase 2', type: 'location', icon: <MapPin size={16} /> },
  ]);

  // Recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing recent searches:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Update input value when search changes externally
    setInputValue(search || '');
  }, [search]);

  useEffect(() => {
    // Handle click outside to close suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addToRecentSearches = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setRecentSearches(prev => {
      const filtered = prev.filter(term => term !== searchTerm);
      const newSearches = [searchTerm, ...filtered].slice(0, 5); // Keep only 5 recent
      localStorage.setItem('recentSearches', JSON.stringify(newSearches));
      return newSearches;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(value.length > 0);
  };

  const handleInputFocus = () => {
    setShowSuggestions(inputValue.length > 0 || recentSearches.length > 0);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.text);
    setSearch(suggestion.text);
    setShowSuggestions(false);
    addToRecentSearches(suggestion.text);

    // Trigger search immediately when suggestion is clicked
    setIsSearching(true);
    router.push(`/listings?q=${encodeURIComponent(suggestion.text)}`);
    setTimeout(() => setIsSearching(false), 300);
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setInputValue(searchTerm);
    setSearch(searchTerm);
    setShowSuggestions(false);
    addToRecentSearches(searchTerm);

    // Trigger search immediately when recent search is clicked
    setIsSearching(true);
    router.push(`/listings?q=${encodeURIComponent(searchTerm)}`);
    setTimeout(() => setIsSearching(false), 300);
  };

  const handleSearchClick = () => {
    if (!inputValue.trim()) return;

    setIsSearching(true);
    setSearch(inputValue.trim());
    addToRecentSearches(inputValue.trim());
    setShowSuggestions(false);

    // Navigate to listings page if not already there
    router.push(`/listings?q=${encodeURIComponent(inputValue.trim())}`);

    // Simulate search delay
    setTimeout(() => setIsSearching(false), 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const clearSearch = () => {
    setInputValue('');
    setSearch('');
    setShowSuggestions(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const renderSuggestions = () => {
    if (!showSuggestions) return null;

    const filteredSuggestions = suggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Recent Searches</span>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((searchTerm, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(searchTerm)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Clock size={16} className="text-gray-400" />
                  <span className="truncate">{searchTerm}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Suggestions */}
        {filteredSuggestions.length > 0 && (
          <div className="p-3">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Suggestions</span>
            <div className="space-y-1">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <span className="text-lime-500">{suggestion.icon}</span>
                  <span className="truncate">{suggestion.text}</span>
                  <span className="ml-auto text-xs text-gray-400 capitalize">
                    {suggestion.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredSuggestions.length === 0 && inputValue.length > 0 && (
          <div className="p-4 text-center text-gray-500">
            <Search size={20} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No suggestions found</p>
            <p className="text-xs">Try different keywords</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full" ref={searchRef}>
      <div className="relative w-full mx-auto">
        {/* Search Input with Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const searchInput = e.currentTarget.querySelector('input');
            const searchValue = searchInput?.value || '';
            if (searchValue.trim()) {
              setIsSearching(true);
              setSearch(searchValue.trim());
              addToRecentSearches(searchValue.trim());
              setShowSuggestions(false);
              router.push(`/listings?q=${encodeURIComponent(searchValue.trim())}`);
              setTimeout(() => setIsSearching(false), 300);
            }
          }}
          className="relative flex"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search for products, categories, or locations..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder-slate-400 rounded-l-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all focus:outline-none"
            />

            {/* Clear Button */}
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={!inputValue.trim() || isSearching}
            className={`px-6 py-3 bg-lime-500 text-white font-medium rounded-r-lg transition-all focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 ${!inputValue.trim() || isSearching
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-lime-600 active:bg-lime-700'
              }`}
          >
            {isSearching ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search size={18} />
                <span>Search</span>
              </div>
            )}
          </button>
        </form>

        {/* Search Suggestions Dropdown */}
        {renderSuggestions()}

        {/* Search Tips */}
        {/* {!showSuggestions && !inputValue && (
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <TrendingUp size={14} />
                Trending: iPhone, Samsung
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                Popular: Lagos, Abuja
              </span>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
