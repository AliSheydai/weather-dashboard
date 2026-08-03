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

  const uvPct = Math.min((uvIndex / 11) * 100, 100);
  const aqiPct = Math.min((aqi / 300) * 100, 100);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 h-full">
        <MetricCard
          index={0}
          icon={<Sun className="h-3.5 w-3.5" />}
          title="UV Index"
          value={`${uvIndex}`}
          subtitle={uvStatus}
          extra={
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full"
                style={{ width: `${uvPct}%` }}
              />
            </div>
          }
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
        title="UV Index Details"
        description="Understanding UV radiation levels and protection recommendations."
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-light text-white">{uvIndex}</div>
            <div>
              <p className="text-white/80 font-medium">{uvStatus}</p>
              <p className="text-xs text-white/40 mt-1">
                {uvIndex <= 2
                  ? "Low exposure. No protection needed."
                  : uvIndex <= 5
                  ? "Moderate exposure. Wear sunscreen."
                  : uvIndex <= 7
                  ? "High exposure. Reduce time in the sun."
                  : "Very high exposure. Avoid midday sun."}
              </p>
            </div>
          </div>
          <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full transition-all"
              style={{ width: `${uvPct}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {["Low", "Moderate", "High", "Very High", "Extreme"].map((label, i) => (
              <div key={label} className="text-[10px] text-white/30">
                <div
                  className={`h-1.5 rounded-full mb-1 ${
                    ["bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500", "bg-purple-500"][i]
                  } ${i <= Math.floor(uvIndex / 3) ? "opacity-100" : "opacity-20"}`}
                />
                {label}
              </div>
            ))}
          </div>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "sunrise"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Sunrise & Sunset"
        description="Today's sun schedule and daylight duration."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sunrise className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-xs text-white/40">Sunrise</p>
                <p className="text-3xl font-light text-white">{sunrise}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Sunset className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-xs text-white/40">Sunset</p>
                <p className="text-3xl font-light text-white">{sunset}</p>
              </div>
            </div>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/30 via-yellow-500/10 to-purple-500/30" />
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
              style={{ width: "60%" }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
              style={{ left: "60%" }}
            />
          </div>
          <p className="text-xs text-white/30 text-center">
            Approx. 14 hours of daylight
          </p>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "visibility"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Visibility"
        description="Current atmospheric visibility conditions."
      >
        <div className="space-y-4">
          <div className="text-5xl font-light text-white">{visibility} km</div>
          <p className="text-white/60">{visibilityStatus}</p>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-slate-500 to-blue-400 rounded-full"
              style={{ width: `${Math.min((visibility / 20) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-white/30">
            {visibility >= 10
              ? "Crystal clear conditions. Perfect for outdoor activities."
              : visibility >= 5
              ? "Good visibility. Minor atmospheric haze possible."
              : "Reduced visibility. Exercise caution when driving."}
          </p>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "feelslike"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Feels Like"
        description="How the temperature actually feels to the human body."
      >
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="text-5xl font-light text-white">{feelsLike}°</div>
            <span className="text-white/30 mb-2">C</span>
          </div>
          <p className="text-white/60">{feelsLikeStatus}</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center p-3 rounded-xl bg-white/[0.04]">
              <p className="text-xs text-white/30 mb-1">Actual</p>
              <p className="text-xl font-light text-white">{actualTemp}°</p>
            </div>
            <div className="flex-1 text-center p-3 rounded-xl bg-white/[0.04]">
              <p className="text-xs text-white/30 mb-1">Feels Like</p>
              <p className="text-xl font-light text-white">{feelsLike}°</p>
            </div>
          </div>
          <p className="text-xs text-white/30">
            Wind, humidity, and other factors affect how temperature feels.
          </p>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "avgtemp"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Average Temperature"
        description="Daily average temperature and range analysis."
      >
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="text-5xl font-light text-white">
              {Math.round((feelsLike + actualTemp) / 2)}°
            </div>
            <span className="text-white/30 mb-2">C</span>
          </div>
          <p className="text-white/60">Average of actual and feels-like temperatures</p>
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center p-3 rounded-xl bg-white/[0.04]">
              <p className="text-xs text-white/30 mb-1">Low</p>
              <p className="text-xl font-light text-white">{actualTemp - 3}°</p>
            </div>
            <div className="flex-1 text-center p-3 rounded-xl bg-white/[0.04]">
              <p className="text-xs text-white/30 mb-1">Average</p>
              <p className="text-xl font-light text-white">{Math.round((feelsLike + actualTemp) / 2)}°</p>
            </div>
            <div className="flex-1 text-center p-3 rounded-xl bg-white/[0.04]">
              <p className="text-xs text-white/30 mb-1">High</p>
              <p className="text-xl font-light text-white">{actualTemp + 3}°</p>
            </div>
          </div>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-orange-500 rounded-full"
              style={{ width: "65%" }}
            />
          </div>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "rainfall"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Rainfall"
        description="Precipitation data and forecast."
      >
        <div className="space-y-4">
          <div className="text-5xl font-light text-white">{rainfall} mm</div>
          <p className="text-white/60">
            {rainfall === 0 ? "No rainfall expected" : "in the last 24 hours"}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {["6h", "12h", "18h", "24h"].map((period) => (
              <div
                key={period}
                className="text-center p-2 rounded-xl bg-white/[0.04]"
              >
                <p className="text-[10px] text-white/30 mb-1">{period}</p>
                <p className="text-sm text-white/60">
                  {Math.round(rainfall * Math.random())} mm
                </p>
              </div>
            ))}
          </div>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "wind"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Wind"
        description="Wind speed and direction details."
      >
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="text-5xl font-light text-white">{windSpeed}</div>
            <span className="text-white/30 mb-2">km/h</span>
          </div>
          <p className="text-white/60">Direction: {windDirection}</p>
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full border border-white/10" />
              <div className="absolute inset-2 rounded-full border border-white/[0.06]" />
              {["N", "E", "S", "W"].map((dir, i) => (
                <span
                  key={dir}
                  className="absolute text-[10px] text-white/30"
                  style={{
                    top: i === 0 ? "0" : i === 2 ? "auto" : "50%",
                    bottom: i === 2 ? "0" : "auto",
                    left: i === 3 ? "0" : i === 1 ? "auto" : "50%",
                    right: i === 1 ? "0" : "auto",
                    transform:
                      i % 2 === 0 ? "translateX(-50%)" : "translateY(-50%)",
                  }}
                >
                  {dir}
                </span>
              ))}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[14px] border-b-indigo-400 transition-transform"
                  style={{
                    transform: `rotate(${
                      { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 }[windDirection] || 0
                    }deg)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "aqi"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Air Quality"
        description="Current air quality index and health recommendations."
      >
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="text-5xl font-light text-white">{aqi}</div>
            <span className="text-white/30 mb-2">AQI</span>
          </div>
          <p className="text-white/60">{aqiStatus}</p>
          <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 rounded-full"
              style={{ width: `${aqiPct}%` }}
            />
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {["Good", "Moderate", "Unhealthy SG", "Unhealthy", "Very Unhealthy"].map(
              (label, i) => (
                <div key={label} className="text-[10px] text-white/30">
                  <div
                    className={`h-1.5 rounded-full mb-1 ${
                      ["bg-green-500", "bg-yellow-500", "bg-orange-500", "bg-red-500", "bg-purple-500"][i]
                    } ${aqi <= (i + 1) * 50 ? "opacity-100" : "opacity-20"}`}
                  />
                  {label}
                </div>
              )
            )}
          </div>
        </div>
      </MetricDetailDialog>

      <MetricDetailDialog
        open={openDialog === "humidity"}
        onOpenChange={(o) => !o && setOpenDialog(null)}
        title="Humidity"
        description="Current atmospheric humidity levels."
      >
        <div className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="text-5xl font-light text-white">{humidity}</div>
            <span className="text-white/30 mb-2">%</span>
          </div>
          <p className="text-white/60">{humidityStatus}</p>
          <div className="h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              style={{ width: `${humidity}%` }}
            />
          </div>
          <p className="text-xs text-white/30">
            {humidity < 30
              ? "Very dry air. Consider using a humidifier."
              : humidity < 60
              ? "Comfortable humidity levels for most activities."
              : "High humidity may cause discomfort."}
          </p>
        </div>
      </MetricDetailDialog>
    </>
  );
}
