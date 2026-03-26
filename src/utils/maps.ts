const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export interface RouteInfo {
  distanceMeters: number;
  durationMinutes: number;
  mode: 'walking' | 'transit';
  description: string;
  estimatedFare: number;
  mapsUrl: string;
}

export async function getCurrentPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise(resolve => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000 }
    );
  });
}

export async function getRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number; name: string }
): Promise<RouteInfo> {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${from.lat},${from.lng}&destination=${encodeURIComponent(to.name)}&travelmode=transit`;

  if (MAPS_API_KEY && MAPS_API_KEY !== 'your_google_maps_api_key_here') {
    try {
      return await fetchDirections(from, to, mapsUrl);
    } catch (e) {
      console.warn('[maps] Directions API fallback:', e);
    }
  }
  return fallbackRoute(from, to, mapsUrl);
}

async function fetchDirections(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number; name: string },
  mapsUrl: string
): Promise<RouteInfo> {
  const params = new URLSearchParams({
    origin: `${from.lat},${from.lng}`,
    destination: `${to.lat},${to.lng}`,
    mode: 'transit',
    language: 'ja',
    key: MAPS_API_KEY!,
  });

  const res = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${params}`);
  const data = await res.json();

  if (data.status !== 'OK' || !data.routes?.[0]?.legs?.[0]) {
    return fallbackRoute(from, to, mapsUrl);
  }

  const leg = data.routes[0].legs[0];
  const distanceMeters: number = leg.distance.value;
  const durationMinutes = Math.ceil(leg.duration.value / 60);

  // 乗換ステップを組み立て
  const parts: string[] = [];
  for (const step of (leg.steps ?? []) as any[]) {
    if (step.travel_mode === 'TRANSIT') {
      const line = step.transit_details?.line?.short_name
        || step.transit_details?.line?.name
        || '電車';
      const mins = Math.ceil(step.duration.value / 60);
      parts.push(`${line}${mins}分`);
    } else if (step.travel_mode === 'WALKING' && step.duration.value > 120) {
      parts.push(`徒歩${Math.ceil(step.duration.value / 60)}分`);
    }
  }

  const mode: RouteInfo['mode'] = distanceMeters < 800 ? 'walking' : 'transit';
  const description = parts.length > 0
    ? parts.join(' → ')
    : mode === 'walking' ? `徒歩${durationMinutes}分` : `電車で${durationMinutes}分`;

  return {
    distanceMeters,
    durationMinutes,
    mode,
    description,
    estimatedFare: mode === 'walking' ? 0 : japanTransitFare(distanceMeters),
    mapsUrl,
  };
}

function fallbackRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number; name: string },
  mapsUrl: string
): RouteInfo {
  const distanceMeters = haversine(from, to);
  const mode: RouteInfo['mode'] = distanceMeters < 800 ? 'walking' : 'transit';
  const durationMinutes = mode === 'walking'
    ? Math.ceil(distanceMeters / 80)
    : Math.ceil(distanceMeters / 400 + 5);
  return {
    distanceMeters,
    durationMinutes,
    mode,
    description: mode === 'walking' ? `徒歩約${durationMinutes}分` : `電車・バスで約${durationMinutes}分`,
    estimatedFare: mode === 'walking' ? 0 : japanTransitFare(distanceMeters),
    mapsUrl,
  };
}

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// JR近距離運賃の近似（1人分）
function japanTransitFare(meters: number): number {
  const km = meters / 1000;
  if (km <= 3) return 200;
  if (km <= 6) return 220;
  if (km <= 10) return 250;
  if (km <= 15) return 310;
  if (km <= 20) return 360;
  if (km <= 30) return 420;
  if (km <= 40) return 510;
  if (km <= 50) return 620;
  return Math.round((620 + (km - 50) * 10) / 10) * 10;
}
