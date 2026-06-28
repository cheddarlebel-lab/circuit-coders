export default function CircuitBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-20" />

      {/* Static glow orbs (painted once — no animation) */}
      <div className="absolute top-[10%] left-[20%] w-[800px] h-[800px] rounded-full bg-circuit-500/[0.05] blur-[150px]" />
      <div className="absolute bottom-[20%] right-[15%] w-[600px] h-[600px] rounded-full bg-circuit-600/[0.04] blur-[120px]" />

      {/* Circuit trace SVG (static) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        {[
          "M 100 200 L 300 200 L 300 400 L 500 400",
          "M 800 100 L 800 300 L 600 300 L 600 500",
          "M 200 600 L 400 600 L 400 800 L 700 800",
          "M 900 500 L 1100 500 L 1100 200 L 1300 200",
          "M 50 400 L 250 400 L 250 100 L 450 100",
          "M 1000 700 L 1200 700 L 1200 400 L 1400 400",
        ].map((d, i) => (
          <path
            key={i}
            d={d}
            stroke="rgba(0,230,138,0.2)"
            strokeWidth="1"
            fill="none"
            strokeDasharray="8 4"
          />
        ))}
      </svg>

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(6,6,26,0.4)_70%,rgba(6,6,26,0.8)_100%)]" />
    </div>
  );
}
