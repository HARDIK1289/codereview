"use client";
import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 h-full w-full">
       <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { opacity: 0 },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: "grab" }, // Strong connection on hover
              onClick: { enable: true, mode: "push" },
              resize: true,
            },
            modes: {
              grab: {
                distance: 180, // Increased range for better "web" effect
                line_linked: { opacity: 0.8 } // Stronger lines
              },
              push: { quantity: 4 },
            },
          },
          particles: {
            color: { value: "#38bdf8" }, // Matches the "Blue Text" exactly
            links: {
              color: "#38bdf8",
              distance: 150,
              enable: true,
              opacity: 0.2, // Subtle links until hovered
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: { default: "bounce" },
              random: true,
              speed: 1.5, // Faster, more alive
              straight: false,
            },
            number: {
              density: { enable: true, area: 900 },
              value: 100, // Dense field
            },
            opacity: { value: 0.6 },
            shape: { type: "circle" },
            size: { value: { min: 1, max: 2 } },
          },
          detectRetina: true,
        }}
        className="w-full h-full"
      />
    </div>
  );
}