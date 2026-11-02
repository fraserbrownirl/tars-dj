// Canonical city list — matches loficities Europe packs in ~/Downloads (16) + site naming.
// Each city has a 4-min 1080p60 H.264 loop, no audio (audio is live Icecast).
export const CITIES = [
  { id:"amsterdam", label:"Amsterdam", file:"lofi-cities-amsterdam-loop-4min-1080p60.mp4" },
  { id:"athens", label:"Athens", file:"lofi-cities-athens-loop-4min-1080p60.mp4" },
  { id:"barcelona", label:"Barcelona", file:"lofi-cities-barcelona-loop-4min-1080p60.mp4" },
  { id:"berlin", label:"Berlin", file:"lofi-cities-berlin-loop-4min-1080p60.mp4" },
  { id:"budapest", label:"Budapest", file:"lofi-cities-budapest-loop-4min-1080p60.mp4" },
  { id:"copenhagen", label:"Copenhagen", file:"lofi-cities-copenhagen-loop-4min-1080p60.mp4" },
  { id:"dublin", label:"Dublin", file:"lofi-cities-dublin-loop-4min-1080p60.mp4" },
  { id:"florence", label:"Florence", file:"lofi-cities-florence-loop-4min-1080p60.mp4" },
  { id:"hamburg", label:"Hamburg", file:"lofi-cities-hamburg-loop-4min-1080p60.mp4" },
  { id:"lisbon", label:"Lisbon", file:"lofi-cities-lisbon-loop-4min-1080p60.mp4" },
  { id:"london", label:"London", file:"lofi-cities-london-loop-4min-1080p60.mp4" },
  { id:"madrid", label:"Madrid", file:"lofi-cities-madrid-loop-4min-1080p60.mp4" },
  { id:"paris", label:"Paris", file:"lofi-cities-paris-loop-4min-1080p60.mp4" },
  { id:"prague", label:"Prague", file:"lofi-cities-prague-loop-4min-1080p60.mp4" },
  { id:"rome", label:"Rome", file:"lofi-cities-rome-loop-4min-1080p60.mp4" },
  { id:"venice", label:"Venice", file:"lofi-cities-venice-loop-4min-1080p60.mp4" },
];
const LOOP_BASE = "https://pub-f443cfa20d11480ba421991226fd803c.r2.dev";

export function loopUrl(city) {
  // Loops live on Cloudflare R2 (same files as public/loops/, 1:1 filenames).
  return `${LOOP_BASE}/loops/${city.file}`;
}

