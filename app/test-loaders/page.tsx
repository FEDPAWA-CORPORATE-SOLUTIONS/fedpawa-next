// ============================================================
// FEDPAWA — 20 Variations de loader corporate (4 librairies x 5)
// Thème : bleu nuit (#15294D) + doré (#D4AF37)
// Librairies d'inspiration : react-spinners, ldrs,
// lucide-react + framer-motion, @tanstack/react-query
// ============================================================

import React from "react";

export const metadata = {
  title: "20 Loaders | FEDPAWA",
};

const commonCss = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 100%;
    min-height: 100vh;
    background: #0a1628;
    color: #ffffff;
    font-family: "Georgia", "Times New Roman", serif;
    -webkit-font-smoothing: antialiased;
  }
  .page-wrap {
    max-width: 1400px;
    margin: 0 auto;
    padding: 40px 20px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  .page-title {
    text-align: center;
    color: #d4af37;
    font-size: 2.2rem;
    letter-spacing: 2px;
    margin-bottom: 16px;
    text-transform: uppercase;
  }
  .page-subtitle {
    text-align: center;
    color: rgba(212, 175, 55, 0.6);
    font-size: 1rem;
    margin-bottom: 50px;
    font-style: italic;
  }
  .section {
    margin-bottom: 70px;
  }
  .section-title {
    color: #d4af37;
    font-size: 1.4rem;
    margin-bottom: 30px;
    padding-bottom: 12px;
    border-bottom: 2px solid #d4af37;
    display: inline-block;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 32px 40px;
  }
  .loader-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(212, 175, 55, 0.25);
    border-radius: 10px;
    padding: 28px 20px;
    text-align: center;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 260px;
  }
  .loader-card:hover {
    border-color: #d4af37;
    background: rgba(212, 175, 55, 0.06);
    transform: translateY(-4px);
  }
  .loader-name {
    color: #d4af37;
    font-size: 0.85rem;
    letter-spacing: 1px;
    margin-bottom: 20px;
    text-transform: uppercase;
    font-weight: 600;
    line-height: 1.3;
  }
  .loader-name span {
    color: #ffffff;
    font-weight: 400;
  }
  .loader-container {
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
  }
  .back-link {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #15294d;
    color: #d4af37;
    padding: 12px 20px;
    border: 1px solid #d4af37;
    border-radius: 6px;
    text-decoration: none;
    font-size: 0.85rem;
    transition: all 0.2s ease;
    font-family: "Georgia", serif;
  }
  .back-link:hover {
    background: #d4af37;
    color: #15294d;
  }

  /* ============================================================
     REACT-SPINNERS INSPIRATION (5)
     ============================================================ */
  /* 1. Circle spinner */
  .rs-circle {
    width: 64px;
    height: 64px;
    border: 4px solid rgba(212, 175, 55, 0.15);
    border-top: 4px solid #d4af37;
    border-radius: 50%;
    animation: rs-spin 1.2s linear infinite;
  }
  @keyframes rs-spin { to { transform: rotate(360deg); } }

  /* 2. Ball scale */
  .rs-ball {
    width: 16px;
    height: 16px;
    background: #15294d;
    border: 3px solid #d4af37;
    border-radius: 50%;
    animation: rs-ball 1.4s ease-in-out infinite both;
  }
  .rs-ball-wrapper { display: flex; gap: 8px; justify-content: center; align-items: center; }
  .rs-ball:nth-child(1) { animation-delay: -0.32s; }
  .rs-ball:nth-child(2) { animation-delay: -0.16s; }
  .rs-ball:nth-child(3) { animation-delay: 0s; }
  @keyframes rs-ball {
    0%, 100% { transform: scale(0); opacity: 0.6; }
    50% { transform: scale(1); opacity: 1; }
  }

  /* 3. Grid pulse */
  .rs-grid-cell {
    width: 10px;
    height: 10px;
    background: #d4af37;
    animation: rs-grid 1.2s ease-in-out infinite both;
  }
  .rs-grid-wrapper { display: grid; grid-template-columns: repeat(3, 12px); gap: 8px; justify-content: center; }
  .rs-grid-cell:nth-child(1) { animation-delay: 0s; background: #15294d; border: 2px solid #d4af37; }
  .rs-grid-cell:nth-child(2) { animation-delay: 0.2s; }
  .rs-grid-cell:nth-child(3) { animation-delay: 0.4s; }
  .rs-grid-cell:nth-child(4) { animation-delay: 0.1s; }
  .rs-grid-cell:nth-child(5) { animation-delay: 0.3s; }
  .rs-grid-cell:nth-child(6) { animation-delay: 0.5s; }
  .rs-grid-cell:nth-child(7) { animation-delay: 0.2s; background: #15294d; border: 2px solid #d4af37; }
  .rs-grid-cell:nth-child(8) { animation-delay: 0.4s; }
  .rs-grid-cell:nth-child(9) { animation-delay: 0.6s; }
  @keyframes rs-grid {
    0%, 100% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.4); opacity: 1; }
  }

  /* 4. Rings */
  .rs-ring {
    width: 50px;
    height: 50px;
    border: 4px solid #15294d;
    border-top-color: #d4af37;
    border-radius: 50%;
    animation: rs-ring-spin 1s linear infinite;
    position: relative;
  }
  .rs-ring::after {
    content: "";
    position: absolute;
    top: -4px; left: -4px; right: -4px; bottom: -4px;
    border: 2px solid rgba(212, 175, 55, 0.4);
    border-radius: 50%;
    animation: rs-ring-pulse 2s ease-in-out infinite;
  }
  @keyframes rs-ring-spin { to { transform: rotate(360deg); } }
  @keyframes rs-ring-pulse {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(1.3); opacity: 0; }
  }

  /* 5. Beat */
  .rs-beat-bar {
    width: 10px;
    height: 40px;
    background: #d4af37;
    animation: rs-beat 1.2s ease-in-out infinite;
  }
  .rs-beat-wrapper { display: flex; gap: 10px; align-items: center; justify-content: center; height: 60px; }
  .rs-beat-bar:nth-child(1) { animation-delay: -0.32s; background: #15294d; border: 2px solid #d4af37; }
  .rs-beat-bar:nth-child(2) { animation-delay: -0.16s; }
  .rs-beat-bar:nth-child(3) { animation-delay: 0s; }
  .rs-beat-bar:nth-child(4) { animation-delay: -0.16s; background: #15294d; border: 2px solid #d4af37; }
  .rs-beat-bar:nth-child(5) { animation-delay: -0.32s; }
  @keyframes rs-beat {
    0%, 100% { transform: scaleY(0.4); opacity: 0.6; }
    50% { transform: scaleY(1); opacity: 1; }
  }

  /* ============================================================
     LDRS INSPIRATION (5)
     ============================================================ */
  /* 1. Dot pulse */
  .ldrs-dot {
    width: 24px;
    height: 24px;
    background: #d4af37;
    border-radius: 50%;
    animation: ldrs-dot-pulse 2s ease-in-out infinite;
  }
  @keyframes ldrs-dot-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.6); opacity: 0.5; }
  }

  /* 2. Minimal bar */
  .ldrs-bar-track {
    width: 120px;
    height: 6px;
    background: rgba(212, 175, 55, 0.15);
    border-radius: 3px;
    position: relative;
    overflow: hidden;
  }
  .ldrs-bar-fill {
    position: absolute;
    top: 0; left: 0;
    height: 100%;
    width: 60%;
    background: linear-gradient(90deg, #15294d, #d4af37);
    border-radius: 3px;
    animation: ldrs-bar 2s ease-in-out infinite;
  }
  @keyframes ldrs-bar {
    0% { left: -60%; width: 60%; }
    100% { left: 100%; width: 40%; }
  }

  /* 3. Rotating dots */
  .ldrs-dots-wrapper {
    width: 60px;
    height: 60px;
    position: relative;
  }
  .ldrs-dot-small {
    position: absolute;
    width: 8px;
    height: 8px;
    background: #d4af37;
    border-radius: 50%;
    animation: ldrs-dots 1.5s linear infinite;
  }
  .ldrs-dot-small:nth-child(1) { top: 0; left: 50%; transform: translate(-50%, -50%); animation-delay: 0s; }
  .ldrs-dot-small:nth-child(2) { top: 50%; right: 0; transform: translate(50%, -50%); animation-delay: 0.3s; }
  .ldrs-dot-small:nth-child(3) { bottom: 0; left: 50%; transform: translate(-50%, 50%); animation-delay: 0.6s; }
  .ldrs-dot-small:nth-child(4) { top: 50%; left: 0; transform: translate(-50%, -50%); animation-delay: 0.9s; }
  @keyframes ldrs-dots {
    0% { opacity: 0.3; transform: translate(-50%, -50%) rotate(0deg) translateX(20px); }
    100% { opacity: 1; transform: translate(-50%, -50%) rotate(360deg) translateX(20px); }
  }

  /* 4. Wave line */
  .ldrs-wave-svg {
    width: 100px;
    height: 24px;
    display: block;
  }
  .ldrs-wave-path {
    fill: none;
    stroke: #d4af37;
    stroke-width: 3;
    stroke-linecap: round;
    animation: ldrs-wave 1.5s ease-in-out infinite;
  }
  @keyframes ldrs-wave {
    0%, 100% { stroke-dashoffset: 0; }
    50% { stroke-dashoffset: 12; }
  }

  /* 5. Square breath */
  .ldrs-square {
    width: 32px;
    height: 32px;
    background: #15294d;
    border: 2px solid #d4af37;
    animation: ldrs-square 2s ease-in-out infinite;
  }
  @keyframes ldrs-square {
    0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
    50% { transform: scale(1.25) rotate(45deg); opacity: 1; }
  }

  /* ============================================================
     LUCIDE-REACT + FRAMER-MOTION INSPIRATION (5)
     ============================================================ */
  /* 1. Animated check circle */
  .lm-check-svg {
    width: 56px;
    height: 56px;
    fill: none;
    stroke: #d4af37;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    animation: lm-check-draw 1.5s ease-in-out infinite;
  }
  .lm-check-circle {
    fill: none;
    stroke: rgba(212, 175, 55, 0.2);
    stroke-width: 2;
  }
  @keyframes lm-check-draw {
    0% { stroke-dashoffset: 100; opacity: 0.4; }
    50% { stroke-dashoffset: 50; opacity: 1; }
    100% { stroke-dashoffset: 100; opacity: 0.4; }
  }

  /* 2. Rotating square */
  .lm-rotate-svg {
    width: 48px;
    height: 48px;
    fill: none;
    stroke: #d4af37;
    stroke-width: 3;
    stroke-linecap: round;
    animation: lm-rotate 1.5s linear infinite;
  }
  @keyframes lm-rotate { to { transform: rotate(360deg); } }

  /* 3. Loader 2 */
  .lm-loader2-svg {
    width: 48px;
    height: 48px;
    fill: none;
    stroke: #d4af37;
    stroke-width: 3;
    stroke-linecap: round;
    animation: lm-loader2 1s linear infinite;
  }
  @keyframes lm-loader2 { to { transform: rotate(360deg); } }

  /* 4. Pulse ring */
  .lm-pulse-ring {
    position: relative;
    width: 60px;
    height: 60px;
  }
  .lm-pulse-circle {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    border: 2px solid #d4af37;
    border-radius: 50%;
    animation: lm-pulse 2s ease-in-out infinite;
  }
  .lm-pulse-circle:nth-child(2) { animation-delay: 0.5s; border-color: #15294d; border-width: 3px; }
  .lm-pulse-circle:nth-child(3) { animation-delay: 1s; border-color: rgba(212,175,55,0.4); border-width: 1px; }
  @keyframes lm-pulse {
    0% { transform: scale(0.4); opacity: 1; }
    100% { transform: scale(1.4); opacity: 0; }
  }

  /* 5. Spiral motion */
  .lm-spiral-svg {
    width: 56px;
    height: 56px;
    fill: none;
    stroke: #d4af37;
    stroke-width: 2.5;
    stroke-linecap: round;
    animation: lm-spiral 2s linear infinite;
  }
  .lm-spiral-center {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 12px; height: 12px;
    background: #d4af37;
    border-radius: 50%;
    animation: lm-spiral-center 1.5s ease-in-out infinite;
  }
  @keyframes lm-spiral { to { transform: rotate(720deg); } }
  @keyframes lm-spiral-center {
    0%, 100% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.7; }
  }

  /* ============================================================
     @TANSTACK/REACT-QUERY INSPIRATION (5)
     ============================================================ */
  /* 1. Skeleton pulse */
  .tq-skeleton {
    width: 140px;
    height: 20px;
    background: linear-gradient(90deg, #15294d 25%, #d4af37 50%, #15294d 75%);
    background-size: 200% 100%;
    border-radius: 4px;
    animation: tq-skeleton 1.5s ease-in-out infinite;
  }
  @keyframes tq-skeleton {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* 2. Dots loading */
  .tq-dots {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
  }
  .tq-dot {
    width: 12px;
    height: 12px;
    background: #d4af37;
    border-radius: 50%;
    animation: tq-dots 1.4s ease-in-out infinite both;
  }
  .tq-dot:nth-child(1) { animation-delay: 0s; background: #15294d; border: 2px solid #d4af37; }
  .tq-dot:nth-child(2) { animation-delay: 0.2s; }
  .tq-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes tq-dots {
    0%, 100% { transform: scale(1); opacity: 0.6; }
    50% { transform: scale(1.3); opacity: 1; }
  }

  /* 3. Circular progress */
  .tq-circle-svg {
    width: 64px;
    height: 64px;
    transform: rotate(-90deg);
  }
  .tq-circle-bg {
    fill: none;
    stroke: rgba(212, 175, 55, 0.15);
    stroke-width: 5;
  }
  .tq-circle-progress {
    fill: none;
    stroke: #d4af37;
    stroke-width: 5;
    stroke-linecap: round;
    stroke-dasharray: 180;
    stroke-dashoffset: 180;
    animation: tq-circle 2s ease-in-out infinite;
  }
  @keyframes tq-circle {
    0%, 100% { stroke-dashoffset: 180; }
    50% { stroke-dashoffset: 90; }
  }

  /* 4. Line sprint */
  .tq-sprint-track {
    width: 100px;
    height: 4px;
    background: rgba(212, 175, 55, 0.15);
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }
  .tq-sprint-dash {
    position: absolute;
    top: 0; left: -40px;
    height: 100%;
    width: 40px;
    background: #d4af37;
    border-radius: 2px;
    animation: tq-sprint 1.5s linear infinite;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
  }
  @keyframes tq-sprint {
    0% { left: -40px; }
    100% { left: 140px; }
  }

  /* 5. Ring pulse query */
  .tq-ring {
    position: relative;
    width: 64px;
    height: 64px;
  }
  .tq-ring-inner {
    width: 100%; height: 100%;
    border: 3px solid #d4af37;
    border-radius: 50%;
    border-top-color: transparent;
    border-right-color: transparent;
    animation: tq-ring-spin 1s linear infinite;
  }
  .tq-ring-glow {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 100%; height: 100%;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.3), transparent 70%);
    border-radius: 50%;
    animation: tq-ring-glow 2s ease-in-out infinite;
  }
  @keyframes tq-ring-spin { to { transform: rotate(360deg); } }
  @keyframes tq-ring-glow {
    0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
    50% { transform: translate(-50%, -50%) scale(1.25); opacity: 0.8; }
  }
`;

export default function LoadersPage() {
  return (
    <div className="page-wrap">
      <h1 className="page-title">20 Loaders — FEDPAWA</h1>
      <p className="page-subtitle">Inspirés par react-spinners · ldrs · lucide-react + framer-motion · @tanstack/react-query</p>

      {/* REACT-SPINNERS */}
      <div className="section">
        <h2 className="section-title">react-spinners <span>(5 variations)</span></h2>
        <div className="grid">
          <div className="loader-card">
            <div className="loader-name">Circle <span>Spinner</span></div>
            <div className="loader-container">
              <div className="rs-circle"></div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Ball <span>Scale</span></div>
            <div className="loader-container">
              <div className="rs-ball-wrapper">
                <div className="rs-ball"></div>
                <div className="rs-ball"></div>
                <div className="rs-ball"></div>
              </div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Grid <span>Pulse</span></div>
            <div className="loader-container">
              <div className="rs-grid-wrapper">
                <div className="rs-grid-cell"></div><div className="rs-grid-cell"></div><div className="rs-grid-cell"></div>
                <div className="rs-grid-cell"></div><div className="rs-grid-cell"></div><div className="rs-grid-cell"></div>
                <div className="rs-grid-cell"></div><div className="rs-grid-cell"></div><div className="rs-grid-cell"></div>
              </div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Ring <span>Loader</span></div>
            <div className="loader-container">
              <div className="rs-ring"></div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Beat <span>Loader</span></div>
            <div className="loader-container">
              <div className="rs-beat-wrapper">
                <div className="rs-beat-bar"></div><div className="rs-beat-bar"></div><div className="rs-beat-bar"></div>
                <div className="rs-beat-bar"></div><div className="rs-beat-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LDRS */}
      <div className="section">
        <h2 className="section-title">ldrs <span>(5 variations)</span></h2>
        <div className="grid">
          <div className="loader-card">
            <div className="loader-name">Dot <span>Pulse</span></div>
            <div className="loader-container">
              <div className="ldrs-dot"></div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Minimal <span>Bar</span></div>
            <div className="loader-container">
              <div className="ldrs-bar-track">
                <div className="ldrs-bar-fill"></div>
              </div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Rotating <span>Dots</span></div>
            <div className="loader-container">
              <div className="ldrs-dots-wrapper">
                <div className="ldrs-dot-small"></div>
                <div className="ldrs-dot-small"></div>
                <div className="ldrs-dot-small"></div>
                <div className="ldrs-dot-small"></div>
              </div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Wave <span>Line</span></div>
            <div className="loader-container">
              <svg className="ldrs-wave-svg" viewBox="0 0 100 24">
                <path className="ldrs-wave-path" d="M0 12 Q25 0 50 12 T100 12" strokeDasharray="60" />
              </svg>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Square <span>Breath</span></div>
            <div className="loader-container">
              <div className="ldrs-square"></div>
            </div>
          </div>
        </div>
      </div>

      {/* LUCIDE-REACT + FRAMER-MOTION */}
      <div className="section">
        <h2 className="section-title">lucide-react + framer-motion <span>(5 variations)</span></h2>
        <div className="grid">
          <div className="loader-card">
            <div className="loader-name">Check <span>Circle</span></div>
            <div className="loader-container">
              <svg className="lm-check-svg" viewBox="0 0 24 24">
                <circle className="lm-check-circle" cx="12" cy="12" r="10" />
                <polyline points="20 6 9 13 4 8" />
              </svg>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Rotate <span>CCW</span></div>
            <div className="loader-container">
              <svg className="lm-rotate-svg" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10Z" />
                <path d="m18 6-6 6 6 6" />
              </svg>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Loader <span>2</span></div>
            <div className="loader-container">
              <svg className="lm-loader2-svg" viewBox="0 0 24 24">
                <path d="M21 12a9 9 0 1 1-6 2.106M3 12a9 9 0 1 0 6-2.106" />
              </svg>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Pulse <span>Ring</span></div>
            <div className="loader-container">
              <div className="lm-pulse-ring">
                <div className="lm-pulse-circle"></div>
                <div className="lm-pulse-circle"></div>
                <div className="lm-pulse-circle"></div>
              </div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Spiral <span>Motion</span></div>
            <div className="loader-container">
              <svg className="lm-spiral-svg" viewBox="0 0 24 24">
                <path d="M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9Z" />
              </svg>
              <div className="lm-spiral-center"></div>
            </div>
          </div>
        </div>
      </div>

      {/* TANSTACK REACT-QUERY */}
      <div className="section">
        <h2 className="section-title">@tanstack/react-query <span>(5 variations)</span></h2>
        <div className="grid">
          <div className="loader-card">
            <div className="loader-name">Skeleton <span>Pulse</span></div>
            <div className="loader-container">
              <div className="tq-skeleton"></div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Dots <span>Loading</span></div>
            <div className="loader-container">
              <div className="tq-dots">
                <div className="tq-dot"></div><div className="tq-dot"></div><div className="tq-dot"></div>
              </div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Circular <span>Progress</span></div>
            <div className="loader-container">
              <svg className="tq-circle-svg" viewBox="0 0 36 36">
                <circle className="tq-circle-bg" cx="18" cy="18" r="16" />
                <circle className="tq-circle-progress" cx="18" cy="18" r="16" />
              </svg>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Line <span>Sprint</span></div>
            <div className="loader-container">
              <div className="tq-sprint-track">
                <div className="tq-sprint-dash"></div>
              </div>
            </div>
          </div>
          <div className="loader-card">
            <div className="loader-name">Ring <span>Pulse Query</span></div>
            <div className="loader-container">
              <div className="tq-ring">
                <div className="tq-ring-inner"></div>
                <div className="tq-ring-glow"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <a className="back-link" href="/">← Retour accueil</a>

      <style>{commonCss}</style>
    </div>
  );
}
