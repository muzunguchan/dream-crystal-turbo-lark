const SCALE_KEY = "cros-pixel-scale";

export type Scale = "fast" | "sharp";

declare global {
  interface Window {
    eaglercraftXOpts?: Record<string, unknown>;
    main?: () => void;
  }
}

export function readScale(): Scale {
  try {
    return localStorage.getItem(SCALE_KEY) === "sharp" ? "sharp" : "fast";
  } catch {
    return "fast";
  }
}

export function writeScale(scale: Scale) {
  localStorage.setItem(SCALE_KEY, scale);
}

function asset(file: string) {
  const match = window.location.pathname.match(/^\/hds-[a-z0-9]+-\d+-[a-z0-9]+/i);
  const prefix = match ? match[0] : "";
  return `${prefix}/${file}`;
}

function applyRuntime(scale: Scale) {
  if (scale === "fast") {
    try {
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        get: () => 1,
      });
    } catch {
      /* already locked */
    }
  }

  const proto = HTMLCanvasElement.prototype;
  const orig = proto.getContext as (
    this: HTMLCanvasElement,
    type: string,
    attrs?: unknown,
  ) => RenderingContext | null;
  if ("__crosWrapped" in orig) return;

  const wrapped = function (this: HTMLCanvasElement, type: string, attrs?: unknown) {
    if (type.includes("webgl")) {
      const next: Record<string, unknown> = {
        ...(attrs && typeof attrs === "object" ? (attrs as Record<string, unknown>) : {}),
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
      };
      return orig.call(this, type, next);
    }
    return orig.call(this, type, attrs);
  };
  Object.defineProperty(wrapped, "__crosWrapped", { value: true });
  proto.getContext = wrapped as typeof proto.getContext;
}

let scriptPromise: Promise<void> | null = null;

function loadBootScript() {
  if (typeof window.main === "function") return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = asset("eagler-boot.js");
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("De loader kon niet geladen worden."));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

type Progress = { pct: number; label: string; error: string | null };

const listeners = new Set<(state: Progress) => void>();
let boot: Promise<void> | null = null;

function emit(state: Progress) {
  listeners.forEach((listener) => listener(state));
}

export function subscribeBoot(listener: (state: Progress) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function ensureBoot(scale: Scale) {
  if (boot) return boot;
  boot = bootGame(scale).catch((err: unknown) => {
    boot = null;
    const message = err instanceof Error ? err.message : "Starten mislukt.";
    emit({ pct: 0, label: message, error: message });
    throw err;
  });
  return boot;
}
async function bootGame(scale: Scale) {
  emit({ pct: 0, label: "Spelbestand ophalen…", error: null });
  const response = await fetch(asset("client.epw"));
  if (!response.ok || !response.body) {
    throw new Error("Spelbestand niet gevonden.");
  }

  const total = Number(response.headers.get("content-length")) || 0;
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    got += value.byteLength;
    const pct = total ? Math.min(99, Math.round((got / total) * 100)) : 5;
    emit({ pct, label: `Laden ${pct}%`, error: null });
  }

  const blobUrl = URL.createObjectURL(new Blob(chunks, { type: "application/octet-stream" }));
  emit({ pct: 100, label: "Starten…", error: null });
  applyRuntime(scale);
  await loadBootScript();

  const relayId = Math.floor(Math.random() * 3);
  window.eaglercraftXOpts = {
    container: "game_frame",
    worldsDB: "worlds",
    assetsURI: blobUrl,
    enforceVSync: true,
    keepAliveHack: true,
    finishOnSwap: false,
    html5CursorSupport: true,
    allowExperimentalWebGL1: true,
    useDelayOnSwap: false,
    relays: [
      { addr: "wss://relay.deev.is/", comment: "lax1dude relay #1", primary: relayId === 0 },
      { addr: "wss://relay.lax1dude.net/", comment: "lax1dude relay #2", primary: relayId === 1 },
      { addr: "wss://relay.shhnowisnottheti.me/", comment: "ayunami relay #1", primary: relayId === 2 },
    ],
  };

  const frame = document.getElementById("game_frame");
  if (!frame?.isConnected) return;
  window.main?.();
}
