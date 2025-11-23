"use client";

import { useEffect } from "react";

// Lightweight preloader: downloads the Watson loader early so opening is instant-ish
export default function WxoPreloader() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const flag = "__wxoPreloaded" as const;
    if ((window as any)[flag]) return; // already preloaded

    (window as any)[flag] = true;

    const host = "https://ap-southeast-1.dl.watson-orchestrate.ibm.com";
    const script = document.createElement("script");
    script.src = `${host}/wxochat/wxoLoader.js?embed=true`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.addEventListener("load", () => {
      // Do NOT call wxoLoader.init() here; only cache the script in the browser
      console.log("✅ Preloaded Watson loader");
    });
    script.addEventListener("error", () => {
      console.warn("⚠️ Failed to preload Watson loader (continuing)");
    });

    document.head.appendChild(script);
  }, []);

  return null;
}
