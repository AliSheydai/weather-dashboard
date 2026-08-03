"use client";

import { Star, Trash2, Clock } from "lucide-react";

interface CityData {
  name: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  isFavorite?: boolean;
  isHistory?: boolean;
}

interface CityListProps {
  cities: CityData[];
  selectedCity: string;
  onSelect: (city: string) => void;
  onToggleFavorite?: (city: string) => void;
  onRemove?: (cityName: string) => void;
  title?: string;
}

export function CityList({
  cities,
  selectedCity,
  onSelect,
  onToggleFavorite,
  onRemove,
  title,
}: CityListProps) {
  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("clear") || c.includes("sunny")) return "☀️";
    if (c.includes("cloud")) return "☁️";
    if (c.includes("rain")) return "🌧️";
    if (c.includes("snow")) return "❄️";
    if (c.includes("thunder")) return "⛈️";
    return "🌤️";
  };

  return (
    <div className="flex-1 overflow-auto px-2">
      {title && (
        <div className="px-3 py-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-xs text-[#475569]">{cities.length}</span>
        </div>
      )}
      <div className="space-y-1">
        {cities.map((city) => {
          const isSelected = selectedCity === city.name;
          return (
            <div
              key={city.name}
              className={`group relative flex items-center p-3 rounded-xl cursor-pointer transition-all ${
                isSelected
                  ? "bg-indigo-500/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/10"
                  : "hover:bg-white/[0.04] hover:border-white/[0.06] border border-transparent"
              }`}
              onClick={() => onSelect(city.name)}
            >
              {/* Weather Icon or History Icon */}
              <div className="text-2xl mr-3">
                {city.isHistory ? (
                  <Clock className="h-5 w-5 text-[#64748b]" />
                ) : (
                  getWeatherIcon(city.condition)
                )}
              </div>

              {/* City Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate">
                  {city.name}
                </div>
                <div className="text-xs text-[#94a3b8]">
                  {city.isHistory ? "Recent search" : city.condition}
                </div>
              </div>

              {/* Temperature (only show if not history or has temp) */}
              {!city.isHistory && city.temperature > 0 && (
                <div className="text-right ml-3">
                  <div className="text-xl font-bold text-white">
                    {city.temperature}°
                  </div>
                  <div className="text-xs text-[#64748b]">
                    H:{city.high}° L:{city.low}°
                  </div>
                </div>
              )}

              {/* Favorite Star - Always visible if favorite */}
              {city.isFavorite && onToggleFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(city.name);
                  }}
                  className="ml-2 p-1.5 rounded-lg hover:bg-yellow-500/20 transition-colors"
                  title="Remove from favorites"
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </button>
              )}

              {/* Actions on hover */}
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {!city.isFavorite && onToggleFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(city.name);
                    }}
                    className="p-1 rounded-lg hover:bg-yellow-500/20 transition-colors"
                    title="Add to favorites"
                  >
                    <Star className="h-3.5 w-3.5 text-[#64748b] hover:text-yellow-400" />
                  </button>
                )}
                {onRemove && city.isFavorite && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(city.name);
                    }}
                    className="p-1 rounded-lg hover:bg-red-500/20 transition-colors"
                    title="Remove from favorites"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#64748b] hover:text-red-400" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
