import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { message: "lat and lon parameters are required" },
      { status: 400 }
    );
  }

  const apiKey =
    process.env.WEATHER_API_KEY || "371ec30872dff9e2936e074606552d16";

  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${encodeURIComponent(
        lat
      )}&lon=${encodeURIComponent(lon)}&limit=1&appid=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json(
        { message: "Failed to reverse geocode location" },
        { status: res.status }
      );
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0 || !data[0].name) {
      return NextResponse.json(
        { message: "Could not determine city from coordinates" },
        { status: 404 }
      );
    }

    return NextResponse.json({ city: data[0].name });
  } catch {
    return NextResponse.json(
      { message: "Internal server error during geocoding" },
      { status: 500 }
    );
  }
}
