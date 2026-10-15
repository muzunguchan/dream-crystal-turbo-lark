import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CDnWRaeL.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SCALE_KEY = "cros-pixel-scale";
function readScale() {
	try {
		return localStorage.getItem(SCALE_KEY) === "sharp" ? "sharp" : "fast";
	} catch {
		return "fast";
	}
}
function playSrc(scale) {
	const match = window.location.pathname.match(/^\/hds-[a-z0-9]+-\d+-[a-z0-9]+/i);
	return `${match ? match[0] : ""}/play.html?scale=${scale}`;
}
function Home() {
	const [scale, setScale] = (0, import_react.useState)("fast");
	const [src, setSrc] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const next = readScale();
		setScale(next);
		setSrc(playSrc(next));
	}, []);
	function choose(next) {
		try {
			localStorage.setItem(SCALE_KEY, next);
		} catch {}
		setScale(next);
		setSrc(playSrc(next));
	}
	function goFullscreen() {
		const target = document.getElementById("play-frame") ?? document.documentElement;
		const req = target.requestFullscreen?.bind(target);
		if (req) req();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "shell",
		children: [src ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
			id: "play-frame",
			className: "play",
			title: "1.20.6",
			src,
			allow: "autoplay; fullscreen; pointer-lock; gamepad",
			allowFullScreen: true
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "boot",
			children: "Chromebook-modus laden…"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "dock",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dock-copy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "kicker",
					children: "Chromebook"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "hint",
					children: "Originele features blijven. Alleen de belasting is lager."
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "dock-actions",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: scale === "fast" ? "on" : "",
						onClick: () => choose("fast"),
						children: "Snel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: scale === "sharp" ? "on" : "",
						onClick: () => choose("sharp"),
						children: "Scherp"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: goFullscreen,
						children: "Volledig scherm"
					})
				]
			})]
		})]
	});
}
//#endregion
export { Home as component };
