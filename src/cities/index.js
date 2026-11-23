// Canonical city list — the four owned loficities packs (europe 16 + collection
// 9 new + world-mix vol 2 10 new + world-mix vol 3 21 = 56 cities), all 4-min
// 1080p60 H.264 loops, no audio (audio is live Icecast). `lon` is the city's
// longitude (degrees east) — display-only, drives the picker's west/east split.
export const CITIES = [
  { id:"agra", label:"Agra", file:"lofi-cities-agra-loop-4min-1080p60.mp4", lon:78.01 },
  { id:"amsterdam", label:"Amsterdam", file:"lofi-cities-amsterdam-loop-4min-1080p60.mp4", lon:4.9 },
  { id:"athens", label:"Athens", file:"lofi-cities-athens-loop-4min-1080p60.mp4", lon:23.73 },
  { id:"bali", label:"Bali", file:"lofi-cities-bali-loop-4min-1080p60.mp4", lon:115.19 },
  { id:"bangkok", label:"Bangkok", file:"lofi-cities-bangkok-loop-4min-1080p60.mp4", lon:100.5 },
  { id:"barcelona", label:"Barcelona", file:"lofi-cities-barcelona-loop-4min-1080p60.mp4", lon:2.17 },
  { id:"berlin", label:"Berlin", file:"lofi-cities-berlin-loop-4min-1080p60.mp4", lon:13.4 },
  { id:"boston", label:"Boston", file:"lofi-cities-boston-loop-4min-1080p60.mp4", lon:-71.06 },
  { id:"budapest", label:"Budapest", file:"lofi-cities-budapest-loop-4min-1080p60.mp4", lon:19.04 },
  { id:"buenos-aires", label:"Buenos Aires", file:"lofi-cities-buenos-aires-loop-4min-1080p60.mp4", lon:-58.38 },
  { id:"cairo", label:"Cairo", file:"lofi-cities-cairo-loop-4min-1080p60.mp4", lon:31.24 },
  { id:"cape-town", label:"Cape Town", file:"lofi-cities-cape-town-loop-4min-1080p60.mp4", lon:18.42 },
  { id:"chicago", label:"Chicago", file:"lofi-cities-chicago-loop-4min-1080p60.mp4", lon:-87.63 },
  { id:"chongqing", label:"Chongqing", file:"lofi-cities-chongqing-loop-4min-1080p60.mp4", lon:106.55 },
  { id:"copenhagen", label:"Copenhagen", file:"lofi-cities-copenhagen-loop-4min-1080p60.mp4", lon:12.57 },
  { id:"dubai", label:"Dubai", file:"lofi-cities-dubai-loop-4min-1080p60.mp4", lon:55.27 },
  { id:"dublin", label:"Dublin", file:"lofi-cities-dublin-loop-4min-1080p60.mp4", lon:-6.26 },
  { id:"florence", label:"Florence", file:"lofi-cities-florence-loop-4min-1080p60.mp4", lon:11.25 },
  { id:"hamburg", label:"Hamburg", file:"lofi-cities-hamburg-loop-4min-1080p60.mp4", lon:10.0 },
  { id:"havana", label:"Havana", file:"lofi-cities-havana-loop-4min-1080p60.mp4", lon:-82.38 },
  { id:"hong-kong", label:"Hong Kong", file:"lofi-cities-hong-kong-loop-4min-1080p60.mp4", lon:114.17 },
  { id:"honolulu", label:"Honolulu", file:"lofi-cities-honolulu-loop-4min-1080p60.mp4", lon:-157.86 },
  { id:"istanbul", label:"Istanbul", file:"lofi-cities-istanbul-loop-4min-1080p60.mp4", lon:28.98 },
  { id:"kuala-lumpur", label:"Kuala Lumpur", file:"lofi-cities-kuala-lumpur-loop-4min-1080p60.mp4", lon:101.69 },
  { id:"kyoto", label:"Kyoto", file:"lofi-cities-kyoto-loop-4min-1080p60.mp4", lon:135.77 },
  { id:"las-vegas", label:"Las Vegas", file:"lofi-cities-las-vegas-loop-4min-1080p60.mp4", lon:-115.14 },
  { id:"lisbon", label:"Lisbon", file:"lofi-cities-lisbon-loop-4min-1080p60.mp4", lon:-9.14 },
  { id:"london", label:"London", file:"lofi-cities-london-loop-4min-1080p60.mp4", lon:-0.13 },
  { id:"los-angeles", label:"Los Angeles", file:"lofi-cities-los-angeles-loop-4min-1080p60.mp4", lon:-118.24 },
  { id:"madrid", label:"Madrid", file:"lofi-cities-madrid-loop-4min-1080p60.mp4", lon:-3.7 },
  { id:"marrakech", label:"Marrakech", file:"lofi-cities-marrakech-loop-4min-1080p60.mp4", lon:-8.01 },
  { id:"melbourne", label:"Melbourne", file:"lofi-cities-melbourne-loop-4min-1080p60.mp4", lon:144.96 },
  { id:"mexico-city", label:"Mexico City", file:"lofi-cities-mexico-city-loop-4min-1080p60.mp4", lon:-99.13 },
  { id:"miami", label:"Miami", file:"lofi-cities-miami-loop-4min-1080p60.mp4", lon:-80.19 },
  { id:"munich", label:"Munich", file:"lofi-cities-munich-loop-4min-1080p60.mp4", lon:11.58 },
  { id:"new-delhi", label:"New Delhi", file:"lofi-cities-new-delhi-loop-4min-1080p60.mp4", lon:77.21 },
  { id:"new-orleans", label:"New Orleans", file:"lofi-cities-new-orleans-loop-4min-1080p60.mp4", lon:-90.07 },
  { id:"new-york", label:"New York", file:"lofi-cities-new-york-loop-4min-1080p60.mp4", lon:-74.01 },
  { id:"osaka", label:"Osaka", file:"lofi-cities-osaka-loop-4min-1080p60.mp4", lon:135.5 },
  { id:"paris", label:"Paris", file:"lofi-cities-paris-loop-4min-1080p60.mp4", lon:2.35 },
  { id:"porto", label:"Porto", file:"lofi-cities-porto-loop-4min-1080p60.mp4", lon:-8.61 },
  { id:"prague", label:"Prague", file:"lofi-cities-prague-loop-4min-1080p60.mp4", lon:14.42 },
  { id:"reykjavik", label:"Reykjavik", file:"lofi-cities-reykjavik-loop-4min-1080p60.mp4", lon:-21.9 },
  { id:"rio", label:"Rio", file:"lofi-cities-rio-loop-4min-1080p60.mp4", lon:-43.17 },
  { id:"rome", label:"Rome", file:"lofi-cities-rome-loop-4min-1080p60.mp4", lon:12.5 },
  { id:"san-francisco", label:"San Francisco", file:"lofi-cities-san-francisco-loop-4min-1080p60.mp4", lon:-122.42 },
  { id:"seattle", label:"Seattle", file:"lofi-cities-seattle-loop-4min-1080p60.mp4", lon:-122.33 },
  { id:"seoul", label:"Seoul", file:"lofi-cities-seoul-loop-4min-1080p60.mp4", lon:126.98 },
  { id:"singapore", label:"Singapore", file:"lofi-cities-singapore-loop-4min-1080p60.mp4", lon:103.82 },
  { id:"stockholm", label:"Stockholm", file:"lofi-cities-stockholm-loop-4min-1080p60.mp4", lon:18.07 },
  { id:"sydney", label:"Sydney", file:"lofi-cities-sydney-loop-4min-1080p60.mp4", lon:151.21 },
  { id:"taipei", label:"Taipei", file:"lofi-cities-taipei-loop-4min-1080p60.mp4", lon:121.57 },
  { id:"tokyo", label:"Tokyo", file:"lofi-cities-tokyo-loop-4min-1080p60.mp4", lon:139.69 },
  { id:"toronto", label:"Toronto", file:"lofi-cities-toronto-loop-4min-1080p60.mp4", lon:-79.38 },
  { id:"vancouver", label:"Vancouver", file:"lofi-cities-vancouver-loop-4min-1080p60.mp4", lon:-123.12 },
  { id:"venice", label:"Venice", file:"lofi-cities-venice-loop-4min-1080p60.mp4", lon:12.32 },
];
const LOOP_BASE = "https://pub-f443cfa20d11480ba421991226fd803c.r2.dev";

export function loopUrl(city) {
  // Loops live on Cloudflare R2 (same files as public/loops/, 1:1 filenames).
  return `${LOOP_BASE}/loops/${city.file}`;
}

// Picker columns: west half / east half of the world by longitude, exactly
// 28 each — the two columns read like the two halves of a map (Honolulu →
// Florence on the left, Munich → Sydney on the right).
const BY_LONGITUDE = [...CITIES].sort((a, b) => a.lon - b.lon);
export const WEST = BY_LONGITUDE.slice(0, BY_LONGITUDE.length / 2);
export const EAST = BY_LONGITUDE.slice(BY_LONGITUDE.length / 2);

// Drift route: every city west→east (Honolulu first, Sydney last), so
// drifting from any city continues the round-the-world route (wraps).
export const ROTATION_ORDER = BY_LONGITUDE.map((c) => c.id);
