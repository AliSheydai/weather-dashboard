"use client";

import { SearchCity } from "./SearchCity";
import { MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeatherSidebarProps {
  onCitySelect: (city: string) => void;
  selectedCity: string;
}

const CITIES = [
  { name: "New York", temp: 22, condition: "Cloudy", high: 29, low: 15 },
  { name: "London", temp: 18, condition: "Rainy", high: 21, low: 12 },
  { name: "Tokyo", temp: 28, condition: "Clear", high: 32, low: 24 },
  { name: "Paris", temp: 20, condition: "Sunny", high: 25, low: 16 },
  { name: "Berlin", temp: 19, condition: "Cloudy", high: 23, low: 14 },
];

export function WeatherSidebar({ onCitySelect, selectedCity }: WeatherSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Weather Dashboard
        </h1>
      </div>

      <SearchCity onSearch={onCitySelect} />

      <div className="flex-1 overflow-auto p-2">
        <div className="space-y-1">
          {CITIES.map((city) => (
            <button
              key={city.name}
              onClick={() => onCitySelect(city.name)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedCity === city.name
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{city.name}</div>
                  <div className="text-sm opacity-70">{city.condition}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{city.temp}°</div>
                  <div className="text-xs opacity-70">
                    H:{city.high}° L:{city.low}°
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full" size="sm">
          <Star className="h-4 w-4 mr-2" />
          Manage Favorites
        </Button>
      </div>
    </div>
  );
}
