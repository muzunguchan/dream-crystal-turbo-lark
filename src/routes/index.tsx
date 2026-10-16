import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ensureBoot, readScale, subscribeBoot, writeScale, type Scale } from "@/lib/boot-game";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [scale, setScale] = useState<Scale>("fast");
  const [label, setLabel] = useState("Spel laden…");
  const [pct, setPct] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const next = readScale();
    setScale(next);
    const frame = document.getElementById("game_frame");
    const observer = new MutationObserver(() => {
      if (frame?.querySelector("canvas")) {
        setReady(true);
        observer.disconnect();
      }
    });
    if (frame) observer.observe(frame, { childList: true, subtree: true });
    const unsubscribe = subscribeBoot((state) => {
      setPct(state.pct);
      setLabel(state.label);
      setError(state.error);
    });
    ensureBoot(next).catch(() => {
      /* shown via subscribeBoot */
    });

    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, []);

  function choose(next: Scale) {
    writeScale(next);
    window.location.reload();
  }

  function goFullscreen() {
    const target = document.getElementById("game_frame") ?? document.documentElement;
    void target.requestFullscreen?.();
  }

  return (
    <main className="shell">
      <div id="game_frame" className="frame" />
      {!ready && (
        <div className="status">
          <div className="status-card">
            <p className="kicker">Chromebook</p>
            <p className="status-label">{error ?? label}</p>
            {!error && (
              <div className="bar">
                <div className="bar-fill" style={{ width: `${pct}%` }} />
              </div>
            )}
            <p className="hint">
              {error
                ? "Ververs de pagina en probeer opnieuw."
                : "Daarna klik je op Singleplayer in het menu."}
            </p>
          </div>
        </div>
      )}
      <div className="dock">
        <p className="kicker">Beeld</p>
        <div className="dock-actions">
          <button type="button" className={scale === "fast" ? "on" : ""} onClick={() => choose("fast")}>
            Snel
          </button>
          <button type="button" className={scale === "sharp" ? "on" : ""} onClick={() => choose("sharp")}>
            Scherp
          </button>
          <button type="button" onClick={goFullscreen}>
            Volledig
          </button>
        </div>
      </div>
    </main>
  );
}
