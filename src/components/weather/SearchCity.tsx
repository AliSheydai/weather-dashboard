"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchCityProps {
  onSearch: (city: string) => void;
}

export function SearchCity({ onSearch }: SearchCityProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-border">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a city or airport"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-secondary"
        />
      </div>
    </form>
  );
}
