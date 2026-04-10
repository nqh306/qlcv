/**
 * QLCV EVNGENCO1 — Energy Glow Loading Spinner
 */

export function LogoSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: "64px",
            height: "64px",
            animation: "energyGlow 1.5s ease-in-out infinite",
          }}
        />
        {/* Rotating logo */}
        <img
          src="/logo-icon.png"
          alt="QLCV EVNGENCO1"
          className="h-11 w-auto object-contain"
          style={{
            animation: "spinSlow 3s linear infinite, breathe 1.5s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.7; transform: rotate(var(--tw-rotate, 0deg)) scale(1); }
          50% { opacity: 1; transform: rotate(var(--tw-rotate, 0deg)) scale(1.08); }
        }
        @keyframes energyGlow {
          0%, 100% {
            box-shadow: 0 0 8px 2px rgba(255, 204, 0, 0.2),
                        0 0 16px 4px rgba(237, 50, 55, 0.1);
          }
          50% {
            box-shadow: 0 0 16px 8px rgba(255, 204, 0, 0.5),
                        0 0 32px 12px rgba(237, 50, 55, 0.25);
          }
        }
      `}</style>
    </div>
  );
}
