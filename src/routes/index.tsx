import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({ component: Home });

const SCALE_KEY = "cros-pixel-scale";

type Scale = "fast" | "sharp";

function readScale(): Scale {
  try {
    return localStorage.getItem(SCALE_KEY) === "sharp" ? "sharp" : "fast";
  } catch {
    return "fast";
  }
}

function playSrc(scale: Scale): string {
  const match = window.location.pathname.match(/^\/hds-[a-z0-9]+-\d+-[a-z0-9]+/i);
  const base = match ? match[0] : "";
  return `${base}/play.html?scale=${scale}`;
}

function Home() {
  const [scale, setScale] = useState<Scale>("fast");
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const next = readScale();
    setScale(next);
    setSrc(playSrc(next));
  }, []);

  function choose(next: Scale) {
    try {
      localStorage.setItem(SCALE_KEY, next);
    } catch {
      /* private mode */
    }
    setScale(next);
    setSrc(playSrc(next));
  }

  function goFullscreen() {
    const frame = document.getElementById("play-frame") as HTMLIFrameElement | null;
    const target = frame ?? document.documentElement;
    const req = target.requestFullscreen?.bind(target);
    if (req) void req();
  }

  return (
    <main className="shell">
      {src ? (
        <iframe
          id="play-frame"
          className="play"
          title="1.20.6"
          src={src}
          allow="autoplay; fullscreen; pointer-lock; gamepad"
          allowFullScreen
        />
      ) : (
        <p className="boot">Chromebook-modus laden…</p>
      )}
      <div className="dock">
        <div className="dock-copy">
          <p className="kicker">Chromebook</p>
          <p className="hint">Originele features blijven. Alleen de belasting is lager.</p>
        </div>
        <div className="dock-actions">
          <button
            type="button"
            className={scale === "fast" ? "on" : ""}
            onClick={() => choose("fast")}
          >
            Snel
          </button>
          <button
            type="button"
            className={scale === "sharp" ? "on" : ""}
            onClick={() => choose("sharp")}
          >
            Scherp
          </button>
          <button type="button" onClick={goFullscreen}>
            Volledig scherm
          </button>
        </div>
      </div>
    </main>
  );
}
