"use client";

import { useState } from "react";
import {
  Sun,
  Sunrise,
  Sunset,
  Eye,
  Thermometer,
  CloudRain,
  Wind,
  Droplets,
  Gauge,
  ThermometerSun,
} from "lucide-react";
import { MetricCard } from "./MetricCard";
import { MetricDetailDialog } from "./MetricDetailDialog";
import { MiniUVGauge } from "./MiniUVGauge";
import { UVIndexModal } from "./UVIndexModal";
import { SunriseSunsetModal } from "./SunriseSunsetModal";
import { WindModal } from "./WindModal";
import { HumidityModal } from "./HumidityModal";
import { FeelsLikeModal } from "./FeelsLikeModal";
import { VisibilityModal } from "./VisibilityModal";
import { AirQualityModal } from "./AirQualityModal";
import { RainfallModal } from "./RainfallModal";
import { AvgTemperatureModal } from "./AvgTemperatureModal";

interface DailyData {
  day: string;
  minTemp: number;
  maxTemp: number;
}

interface MetricsGridProps {
  uvIndex: number;
  uvStatus: string;
  sunrise: string;
  sunset: string;
  visibility: number;
  feelsLike: number;
  actualTemp: number;
  rainfall: number;
  windSpeed: number;
  windDirection: string;
  aqi: number;
  aqiStatus: string;
  humidity: number;
  daily?: DailyData[];
}

export function MetricsGrid({
  uvIndex,
  uvStatus,
  sunrise,
  sunset,
  visibility,
  feelsLike,
  actualTemp,
  rainfall,
  windSpeed,
  windDirection,
  aqi,
  aqiStatus,
  humidity,
  daily,
}: MetricsGridProps) {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const humidityStatus =
    humidity < 30 ? "Dry" : humidity < 60 ? "Comfortable" : humidity < 80 ? "Moderate" : "High";
  const visibilityStatus =
    visibility >= 10 ? "Excellent" : visibility >= 5 ? "Good" : visibility >= 2 ? "Moderate" : "Poor";
  const feelsLikeDiff = feelsLike - actualTemp;
  const feelsLikeStatus =
    feelsLikeDiff > 0
      ? `+${feelsLikeDiff}° warmer than actual`
      : feelsLikeDiff < 0
      ? `${feelsLikeDiff}° cooler than actual`
      : "Same as actual";

  const aqiPct = Math.min((aqi / 300) * 100, 100);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 lg:h-full">
        <MetricCard
          index={0}
          icon={<Sun className="h-3.5 w-3.5" />}
          title="UV Index"
          value={`${uvIndex}`}
          subtitle={uvStatus}
          extra={<MiniUVGauge uvIndex={uvIndex} />}
          onShowMore={() => setOpenDialog("uv")}
        />

        <MetricCard
          index={1}
          icon={<Sunrise className="h-3.5 w-3.5" />}
          title="Sunrise & Sunset"
          value={sunrise}
          subtitle={`Sunset ${sunset}`}
          extra={
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden relative mt-1">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-amber-500/10 to-purple-500/30" />
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                style={{ width: "60%" }}
              />
            </div>
          }
          onShowMore={() => setOpenDialog("sunrise")}
        />

        <MetricCard
          index={2}
          icon={<Eye className="h-3.5 w-3.5" />}
          title="Visibility"
          value={`${visibility} km`}
          subtitle={visibilityStatus}
          onShowMore={() => setOpenDialog("visibility")}
        />

        <MetricCard
          index={3}
          icon={<Thermometer className="h-3.5 w-3.5" />}
          title="Feels Like"
          value={`${feelsLike}°`}
          subtitle={feelsLikeStatus}
          onShowMore={() => setOpenDialog("feelslike")}
        />

        <MetricCard
          index={4}
          icon={<ThermometerSun className="h-3.5 w-3.5" />}
          title="Avg Temperature"
          value={`${Math.round((feelsLike + actualTemp) / 2)}°`}
          subtitle={`Range: ${actualTemp - 3}° – ${actualTemp + 3}°`}
          onShowMore={() => setOpenDialog("avgtemp")}
        />

        <MetricCard
          index={5}
          icon={<CloudRain className="h-3.5 w-3.5" />}
          title="Rainfall"
          value={`${rainfall} mm`}
          subtitle={rainfall === 0 ? "No rainfall expected" : "in the last 24 hours"}
          onShowMore={() => setOpenDialog("rainfall")}
        />

        <MetricCard
          index={6}
          icon={<Wind className="h-3.5 w-3.5" />}
          title="Wind"
          value={`${windSpeed}`}
          subtitle={`km/h ${windDirection}`}
          extra={
            <div className="flex items-center gap-2 mt-1">
              <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center">
                <div
                  className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[6px] border-b-indigo-400"
                  style={{
                    transform: `rotate(${
                      { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }[windDirection] || 0
                    }deg)`,
                  }}
                />
              </div>
              <span className="text-[10px] text-white/30">{windDirection}</span>
            </div>
          }
          onShowMore={() => setOpenDialog("wind")}
        />

        <MetricCard
          index={7}
          icon={<Gauge className="h-3.5 w-3.5" />}
          title="Air Quality"
          value={`${aqi}`}
          subtitle={aqiStatus}
          extra={
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full"
                style={{ width: `${aqiPct}%` }}
              />
            </div>
          }
          onShowMore={() => setOpenDialog("aqi")}
        />

        <MetricCard
          index={8}
          icon={<Droplets className="h-3.5 w-3.5" />}
          title="Humidity"
          value={`${humidity}%`}
          subtitle={humidityStatus}
          extra={
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${humidity}%` }}
              />
            </div>
          }
          onShowMore={() => setOpenDialog("humidity")}
        />
      </div>

      {/* Detail Dialogs */}
      <MetricDetailDialog
        open={openDialog === "uv"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="UV Index"
        description="UV radiation levels and sun protection guidance"
      >
        <UVIndexModal uvIndex={uvIndex} uvStatus={uvStatus} />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "sunrise"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Sunrise & Sunset"
        description="Today's sun schedule and daylight duration"
      >
        <SunriseSunsetModal sunrise={sunrise} sunset={sunset} />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "visibility"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Visibility"
        description="Atmospheric visibility and fog risk analysis"
      >
        <VisibilityModal visibility={visibility} />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "feelslike"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Feels Like"
        description="Perceived temperature and driving factors"
      >
        <FeelsLikeModal feelsLike={feelsLike} actualTemp={actualTemp} />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "avgtemp"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Average Temperature"
        description="Daily averages and seasonal deviation analysis"
      >
        <AvgTemperatureModal
          actualTemp={actualTemp}
          feelsLike={feelsLike}
          daily={daily}
        />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "rainfall"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Rainfall"
        description="Precipitation forecast and weekly accumulation"
      >
        <RainfallModal rainfall={rainfall} />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "wind"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Wind"
        description="Wind speed, direction, and gust analysis"
      >
        <WindModal windSpeed={windSpeed} windDirection={windDirection} />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "aqi"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Air Quality"
        description="AQI index and pollutant health analysis"
      >
        <AirQualityModal aqi={aqi} aqiStatus={aqiStatus} />
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "humidity"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Humidity"
        description="Atmospheric moisture levels and comfort analysis"
      >
        <HumidityModal humidity={humidity} />
      </MetricDetailDialog>
    </>
  );
}
