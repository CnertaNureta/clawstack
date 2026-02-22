type AnalyticsPayloadValue = string | number | boolean | null;
type AnalyticsPayload = Record<string, AnalyticsPayloadValue>;
type AnalyticsTrack = (eventName: string, payload?: AnalyticsPayload) => void;

let trackImpl: AnalyticsTrack | null = null;
let trackRequested = false;
let loading: Promise<AnalyticsTrack | null> | null = null;
const eventQueue: Array<{ name: string; payload: AnalyticsPayload }> = [];

function cleanPayload(input: AnalyticsPayload): AnalyticsPayload {
  const output: AnalyticsPayload = {};

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      output[key] = value;
    }
  }

  return output;
}

function resolveTrack(): Promise<AnalyticsTrack | null> {
  if (trackRequested) return Promise.resolve(trackImpl);
  if (!loading) {
    loading = import("@vercel/analytics")
      .then((module) =>
        typeof module.track === "function" ? (module.track as AnalyticsTrack) : null
      )
      .catch(() => null);
  }

  return loading.then((impl) => {
    trackImpl = impl;
    trackRequested = true;
    return impl;
  });
}

function flushEvents() {
  void resolveTrack().then((impl) => {
    while (eventQueue.length > 0) {
      const event = eventQueue.shift();
      if (!event) continue;
      const { name, payload } = event;
      if (impl) {
        impl(name, payload);
        continue;
      }
      if (process.env.NODE_ENV === "development") {
        console.debug(`[analytics] ${name}`, payload);
      }
    }
  });
}

export function trackEvent(name: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;
  eventQueue.push({ name, payload: cleanPayload(payload) });
  flushEvents();
}
