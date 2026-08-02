"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

interface SearchCityProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
}

export function SearchCity({ onSearch, isLoading }: SearchCityProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94a3b8] group-focus-within:text-indigo-400 transition-colors" />
        {isLoading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400 animate-spin" />
        )}
        <input
          type="text"
          placeholder="Search for a city or airport"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-10 bg-[#141420] border border-white/[0.08] rounded-xl text-sm text-white placeholder:text-[#64748b] focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>
    </form>
  );
}
