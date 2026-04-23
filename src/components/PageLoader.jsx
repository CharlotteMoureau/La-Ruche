import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const ORBIT_DURATION_MS = 2800;
const DASH_INTERVAL_MS = 120;
const DASH_LIFETIME_MS = 1100;
const MAX_TRAIL_DASHES = 10;
const TRAIL_OFFSET_DEG = 16;

export default function PageLoader({ title, subtitle }) {
  const { t } = useLanguage();
  const [beeAngle, setBeeAngle] = useState(0);
  const [trail, setTrail] = useState([]);
  const animationStartRef = useRef(0);
  const lastDashRef = useRef(0);
  const dashIdRef = useRef(0);
  const resolvedTitle = title || t("common.loading");
  const resolvedSubtitle = subtitle || t("profile.loadingSubtitle");

  useEffect(() => {
    let rafId = 0;

    const tick = (now) => {
      if (!animationStartRef.current) {
        animationStartRef.current = now;
        lastDashRef.current = now;
      }

      const elapsed = now - animationStartRef.current;
      const angle = ((elapsed % ORBIT_DURATION_MS) / ORBIT_DURATION_MS) * 360;
      setBeeAngle(angle);

      if (now - lastDashRef.current >= DASH_INTERVAL_MS) {
        const trailAngle = (angle - TRAIL_OFFSET_DEG + 360) % 360;
        const id = ++dashIdRef.current;

        lastDashRef.current = now;
        setTrail((prev) => [
          ...prev.slice(-(MAX_TRAIL_DASHES - 1)),
          { id, angle: trailAngle },
        ]);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleDashEnd = (id) => {
    setTrail((prev) => prev.filter((dash) => dash.id !== id));
  };

  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader__halo" aria-hidden="true" />
      <div className="page-loader__orbit" aria-hidden="true">
        <img className="page-loader__logo" src="/logo-ruche.png" alt="" />
        {trail.map((dash) => (
          <span
            key={dash.id}
            className="page-loader__trail-dash"
            style={{
              "--dash-angle": `${dash.angle}deg`,
              "--dash-lifetime": `${DASH_LIFETIME_MS}ms`,
            }}
            onAnimationEnd={() => handleDashEnd(dash.id)}
          />
        ))}
        <span
          className="page-loader__bee-carrier"
          style={{ transform: `rotate(${beeAngle}deg)` }}
        >
          <span className="page-loader__bee" />
        </span>
      </div>
      <p className="page-loader__title">{resolvedTitle}</p>
      <p className="page-loader__subtitle">{resolvedSubtitle}</p>
    </div>
  );
}
