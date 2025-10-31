"use client";

import Particles from "react-particles";
import { useEffect, useState, useMemo } from "react";

export default function ParticlesBackground() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateTheme = () => {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const htmlHasDark = document.documentElement.classList.contains("dark");
      setIsDark(htmlHasDark || prefersDark);
    };

    updateTheme();

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => updateTheme();

    if (mql.addEventListener) mql.addEventListener("change", onMediaChange);
    else mql.addListener(onMediaChange);

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (mql.removeEventListener)
        mql.removeEventListener("change", onMediaChange);
      else mql.removeListener(onMediaChange);
      observer.disconnect();
    };
  }, []);

  const particlesOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      background: { color: { value: "transparent" } },
      interactivity: {
        events: {
          onHover: { enable: true, mode: "repulse" },
          onClick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          repulse: { distance: 120, duration: 0.4 },
          push: { quantity: 4 },
        },
      },
      particles: {
        number: { value: 50, density: { enable: true, area: 800 } },
        color: { value: isDark ? "#ffffff" : "#000000" },
        shape: { type: "circle" },
        opacity: { value: 0.9, random: { enable: true, minimumValue: 0.5 } },
        size: { value: { min: 1, max: 4 } },
        links: {
          enable: true,
          distance: 120,
          color: isDark ? "#ffffff" : "#000000",
          opacity: 0.12,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1.2,
          direction: "none",
          random: false,
          straight: false,
          outModes: { default: "out" },
        },
      },
      detectRetina: true,
    }),
    [isDark]
  );

  return (
    <>
      <div
        className="absolute inset-0 -z-20 transition-colors duration-700"
        style={{ background: isDark ? "#000000" : "#ffffff" }}
      />
      <Particles
        id="global-particles"
        options={particlesOptions}
        className="absolute inset-0 -z-10"
      />
    </>
  );
}
