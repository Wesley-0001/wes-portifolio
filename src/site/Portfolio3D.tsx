import { useEffect, useRef } from "react";
import { initPortfolio3d } from "./gltfPortfolioScene";

/** Canvas Three.js na hero (GLB + mesma cena que gltfPortfolioScene). */
export function Portfolio3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return initPortfolio3d(el);
  }, []);

  return (
    <div className="wes-portfolio-3d-shell" aria-hidden>
      <div id="portfolio-3d" ref={ref} style={{ background: "transparent" }} />
    </div>
  );
}
